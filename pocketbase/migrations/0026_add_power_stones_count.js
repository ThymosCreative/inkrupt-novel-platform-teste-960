migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('novels')
    col.fields.add(new NumberField({ name: 'power_stones_count' }))
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('novels')
    col.fields.removeByName('power_stones_count')
    app.save(col)
  },
)
