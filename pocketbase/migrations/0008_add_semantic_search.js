migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('novels')
    if (!col.fields.getByName('embedding')) {
      // Workaround: if VectorField is not globally defined in the JS VM,
      // we can parse it from a plain object via a dummy Collection instantiation.
      const dummy = new Collection({
        id: 'dummy1234567890',
        name: 'dummy_vector_collection',
        type: 'base',
        fields: [{ name: 'embedding', type: 'vector', dimensions: 1536 }],
      })
      col.fields.add(dummy.fields.getByName('embedding'))
      app.save(col)
    }
  },
  (app) => {
    const col = app.findCollectionByNameOrId('novels')
    col.fields.removeByName('embedding')
    app.save(col)
  },
)
