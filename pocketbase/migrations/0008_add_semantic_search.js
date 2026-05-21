migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('novels')
    if (!col.fields.getByName('embedding')) {
      col.fields.add(new VectorField({ name: 'embedding', dimensions: 1536 }))
      app.save(col)
    }
  },
  (app) => {
    const col = app.findCollectionByNameOrId('novels')
    col.fields.removeByName('embedding')
    app.save(col)
  },
)
