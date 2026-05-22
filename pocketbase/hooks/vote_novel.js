routerAdd(
  'POST',
  '/backend/v1/vote',
  (e) => {
    const body = e.requestInfo().body || {}
    const novelId = body.novel_id
    if (!novelId) return e.badRequestError('novel_id required')

    $app.runInTransaction((txApp) => {
      try {
        const novel = txApp.findRecordById('novels', novelId)
        const current = novel.getInt('power_stones_count') || 0
        novel.set('power_stones_count', current + 1)
        txApp.save(novel)
      } catch (err) {
        $app.logger().error('Error voting for novel', 'error', err.message)
      }
    })

    return e.json(200, { success: true })
  },
  $apis.requireAuth(),
)
