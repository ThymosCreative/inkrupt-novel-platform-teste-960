migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    let adminId

    try {
      const admin = app.findAuthRecordByEmail('_pb_users_auth_', 'kaike@adapta.org')
      adminId = admin.id
    } catch (_) {
      const record = new Record(users)
      record.setEmail('kaike@adapta.org')
      record.setPassword('Skip@Pass')
      record.setVerified(true)
      record.set('name', 'Kaike')
      app.save(record)
      adminId = record.id
    }

    try {
      app.findFirstRecordByData('novels', 'title', 'A Lenda do Caos 1')
      return
    } catch (_) {}

    const novelsCol = app.findCollectionByNameOrId('novels')
    const chaptersCol = app.findCollectionByNameOrId('chapters')
    const libraryCol = app.findCollectionByNameOrId('library_entries')

    const genres = ['Fantasia', 'Romance', 'Ficção Científica', 'Xianxia', 'Ação', 'Mistério']

    for (let i = 1; i <= 5; i++) {
      const novel = new Record(novelsCol)
      novel.set('title', `A Lenda do Caos ${i}`)
      novel.set('author', adminId)
      novel.set(
        'description',
        `Uma história épica de superação onde o herói descobre um poder oculto que mudará o destino de todo o universo. Cheio de batalhas intensas, romance e mistérios profundos que desafiam a própria realidade.`,
      )
      novel.set('genres', [genres[i % genres.length], genres[(i + 1) % genres.length]])
      novel.set('status', i % 4 === 0 ? 'Concluído' : 'Em Andamento')
      novel.set('type', i % 3 === 0 ? 'Original' : 'Tradução')
      novel.set('rating', 4 + Math.random())
      novel.set('is_hot', i <= 3)
      novel.set('reads', Math.floor(Math.random() * 5000000) + 10000)
      app.save(novel)

      for (let j = 1; j <= 5; j++) {
        const chapter = new Record(chaptersCol)
        chapter.set('novel', novel.id)
        chapter.set('title', `Capítulo ${j}: O Despertar`)
        chapter.set(
          'content',
          `O sol não brilhava como antes. O céu estava coberto por uma névoa espessa e escura, anunciando a chegada de uma nova era. Ele olhou para suas mãos, sentindo o poder fluir por suas veias.\n\n"Isso é apenas o começo", murmurou para si mesmo.\n\nA verdadeira jornada ainda estava por vir, e ele sabia que muitos sacrifícios seriam necessários.`,
        )
        chapter.set('chapter_number', j)
        chapter.set('is_premium', j >= 4)
        app.save(chapter)
      }

      if (i <= 3) {
        const entry = new Record(libraryCol)
        entry.set('user', adminId)
        entry.set('novel', novel.id)
        entry.set('status', i === 1 ? 'reading' : i === 2 ? 'plan_to_read' : 'completed')
        app.save(entry)
      }
    }
  },
  (app) => {
    try {
      const novels = app.findRecordsByFilter('novels', "title ~ 'A Lenda do Caos'", '', 100, 0)
      for (const novel of novels) {
        app.delete(novel)
      }
    } catch (_) {}
  },
)
