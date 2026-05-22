migrate(
  (app) => {
    const users = app.findRecordsByFilter('_pb_users_auth_', 'is_author = false', '', 2, 0)
    if (users.length === 0) return

    const collection = app.findCollectionByNameOrId('author_applications')
    users.forEach((u) => {
      try {
        app.findFirstRecordByData('author_applications', 'user', u.id)
      } catch (_) {
        const record = new Record(collection)
        record.set('user', u.id)
        record.set(
          'bio',
          'Eu adoro criar histórias e sempre quis escrever fantasia. Gostaria muito de me tornar um autor oficial na plataforma!',
        )
        record.set('status', 'pending')
        app.save(record)
      }
    })
  },
  (app) => {
    app.db().newQuery("DELETE FROM author_applications WHERE status = 'pending'").execute()
  },
)
