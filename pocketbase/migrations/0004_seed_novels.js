migrate(
  (app) => {
    let adminId = ''
    try {
      const admin = app.findAuthRecordByEmail('_pb_users_auth_', 'kaike@adapta.org')
      adminId = admin.id
    } catch (_) {
      return
    }

    const novelsCol = app.findCollectionByNameOrId('novels')
    const genresList = ['Fantasia', 'Romance', 'Ação', 'Mistério', 'Xianxia']
    const statusList = ['Em Andamento', 'Concluído', 'Hiato']
    const typesList = ['Original', 'Tradução']

    for (let i = 1; i <= 15; i++) {
      const record = new Record(novelsCol)
      record.set('title', `Novel Épica ${i}`)
      record.set('author', adminId)
      record.set(
        'description',
        `Uma descrição incrivelmente detalhada para a Novel ${i}, cheia de aventuras e mistérios. Acompanhe a jornada épica deste herói improvável em um mundo vasto e perigoso.`,
      )
      record.set('genres', [
        genresList[i % genresList.length],
        genresList[(i + 1) % genresList.length],
      ])
      record.set('status', statusList[i % statusList.length])
      record.set('type', typesList[i % typesList.length])
      record.set('rating', 4.0 + (i % 10) / 10)
      record.set('is_hot', i % 3 === 0)
      record.set('reads', 1000 + i * 500)
      app.save(record)
    }
  },
  (app) => {
    app.db().newQuery('DELETE FROM novels').execute()
  },
)
