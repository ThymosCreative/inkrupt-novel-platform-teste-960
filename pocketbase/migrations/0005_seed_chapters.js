migrate(
  (app) => {
    const novels = app.findRecordsByFilter('novels', '', '', 100, 0)
    const chaptersCol = app.findCollectionByNameOrId('chapters')

    for (const novel of novels) {
      for (let i = 1; i <= 5; i++) {
        const record = new Record(chaptersCol)
        record.set('novel', novel.id)
        record.set('title', `Capítulo ${i}: O Início da Jornada`)
        record.set(
          'content',
          `O céu estava escuro quando ele deu seu primeiro passo.\n\n"Isso é apenas o começo", pensou.\n\nA energia ao seu redor era densa, quase palpável. Cada respiração parecia queimar seus pulmões com o poder do mundo.\n\nEle caminhou para frente, sem olhar para trás, preparado para o que quer que o destino lhe reservasse naquelas terras sombrias e inexploradas.`,
        )
        record.set('chapter_number', i)
        record.set('is_premium', i > 3)
        app.save(record)
      }
    }
  },
  (app) => {
    app.db().newQuery('DELETE FROM chapters').execute()
  },
)
