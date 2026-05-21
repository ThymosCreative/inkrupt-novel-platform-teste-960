migrate(
  (app) => {
    let adminId = ''
    try {
      const admin = app.findAuthRecordByEmail('_pb_users_auth_', 'kaike@adapta.org')
      adminId = admin.id
    } catch (_) {
      return
    }
    const novels = app.findRecordsByFilter('novels', '', '', 100, 0)
    const reviewsCol = app.findCollectionByNameOrId('reviews')

    for (const novel of novels) {
      for (let i = 1; i <= 3; i++) {
        const record = new Record(reviewsCol)
        record.set('user', adminId)
        record.set('novel', novel.id)
        record.set(
          'content',
          `Uma leitura fantástica! A novel ${novel.getString('title')} realmente me prendeu do início ao fim. Recomendo muito para quem curte o gênero.`,
        )
        record.set('rating', 4 + (i % 2))
        app.save(record)
      }
    }
  },
  (app) => {
    app.db().newQuery('DELETE FROM reviews').execute()
  },
)
