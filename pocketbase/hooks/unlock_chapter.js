routerAdd(
  'POST',
  '/backend/v1/unlock-chapter',
  (e) => {
    const body = e.requestInfo().body || {}
    const chapterId = body.chapter_id
    const method = body.method || 'coin'
    const userId = e.auth?.id

    if (!userId) return e.unauthorizedError('auth required')
    if (!chapterId) return e.badRequestError('chapter_id is required')

    let chapter
    try {
      chapter = $app.findRecordById('chapters', chapterId)
    } catch (_) {
      return e.notFoundError('chapter not found')
    }

    // Support both is_premium (legacy bool) and type (new SelectField)
    const isPremium =
      chapter.getBool('is_premium') || chapter.getString('type') === 'premium'
    if (!isPremium) {
      return e.badRequestError('chapter is not premium')
    }

    let price = chapter.getInt('coin_price') || 0
    if (price === 0) {
      const content = chapter.getString('content') || ''
      const wordCount = content.split(/\s+/).length
      price = Math.max(1, Math.ceil(wordCount / 200))
    }

    try {
      $app.findFirstRecordByFilter('unlocked_chapters', 'user = {:u} && chapter = {:c}', {
        u: userId,
        c: chapterId,
      })
      return e.json(200, { success: true, message: 'already unlocked' })
    } catch (_) {}

    let errResponse = null

    try {
      $app.runInTransaction((txApp) => {
        const user = txApp.findRecordById('_pb_users_auth_', userId)

        if (method === 'fast_pass') {
          // user.get() in PocketBase hooks returns Go-native types.
          // Array.isArray() is false for Go []interface{}, so we normalise
          // via JSON round-trip to get a proper JS array.
          const rawFp = user.get('fast_passes')
          let fastPasses = []
          try {
            if (rawFp != null) {
              const fpStr =
                typeof rawFp === 'string' ? rawFp : JSON.stringify(rawFp)
              if (fpStr && fpStr !== 'null') {
                const parsed = JSON.parse(fpStr)
                if (Array.isArray(parsed)) fastPasses = parsed
              }
            }
          } catch (_) {}

          const now = Date.now()
          let activeFps = fastPasses.filter((fp) => fp && fp.expires_at > now)
          const total = activeFps.reduce((a, b) => a + (b.amount || 0), 0)

          if (total < 1) {
            errResponse = e.badRequestError('insufficient fast passes')
            throw new Error('rollback')
          }

          // Deduct 1 fast pass from the earliest-expiring batch
          activeFps.sort((a, b) => a.expires_at - b.expires_at)
          activeFps[0].amount = (activeFps[0].amount || 0) - 1
          const newFp = activeFps.filter((fp) => fp.amount > 0)
          user.set('fast_passes', newFp)
        } else {
          const coins = user.getInt('coins') || 0
          if (coins < price) {
            errResponse = e.badRequestError('insufficient coins')
            throw new Error('rollback')
          }
          user.set('coins', coins - price)
        }

        txApp.save(user)

        const col = txApp.findCollectionByNameOrId('unlocked_chapters')
        const unlockedRecord = new Record(col)
        unlockedRecord.set('user', userId)
        unlockedRecord.set('chapter', chapterId)
        txApp.save(unlockedRecord)
      })
    } catch (err) {
      if (errResponse) return errResponse
      throw err
    }

    return e.json(200, { success: true })
  },
  $apis.requireAuth(),
)
