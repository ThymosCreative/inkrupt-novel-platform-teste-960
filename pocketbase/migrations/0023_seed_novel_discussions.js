migrate(
  (app) => {
    const novels = app.findRecordsByFilter('novels', '', '', 2, 0)
    const users = app.findRecordsByFilter('_pb_users_auth_', '', '', 1, 0)
    if (novels.length === 0 || users.length === 0) return

    const collection = app.findCollectionByNameOrId('novel_discussions')
    const seeds = [
      'Essa obra é incrível! Mal posso esperar pelo próximo capítulo.',
      'A construção de mundo é muito detalhada, excelente trabalho do autor.',
      'Alguém tem teorias sobre o que vai acontecer no torneio final?',
    ]

    let i = 0
    for (const novel of novels) {
      for (const text of seeds) {
        if (i >= 3) break
        try {
          app.findFirstRecordByData('novel_discussions', 'content', text)
        } catch (_) {
          const record = new Record(collection)
          record.set('novel', novel.id)
          record.set('user', users[0].id)
          record.set('content', text)
          app.save(record)
          i++
        }
      }
    }
  },
  (app) => {
    app
      .db()
      .newQuery(
        "DELETE FROM novel_discussions WHERE content LIKE '%obra é incrível%' OR content LIKE '%construção de mundo%' OR content LIKE '%teorias sobre o que vai%'",
      )
      .execute()
  },
)
