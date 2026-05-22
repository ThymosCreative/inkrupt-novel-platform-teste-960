migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('chapters')
    if (!col.fields.getByName('type')) {
      col.fields.add(
        new SelectField({
          name: 'type',
          values: ['free', 'premium', 'privilege'],
          maxSelect: 1,
        }),
      )
      app.save(col)
    }
  },
  (app) => {
    const col = app.findCollectionByNameOrId('chapters')
    if (col.fields.getByName('type')) {
      col.fields.removeByName('type')
      app.save(col)
    }
  },
)
