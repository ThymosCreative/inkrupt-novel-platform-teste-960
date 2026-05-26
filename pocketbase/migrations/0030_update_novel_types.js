migrate(
  (app) => {
    // Update existing data to match new categories
    app
      .db()
      .newQuery("UPDATE novels SET type = 'Inkrupt Original' WHERE type = 'Original'")
      .execute()
    app.db().newQuery("UPDATE novels SET type = 'Independente' WHERE type = 'Tradução'").execute()

    // Update schema select values
    const col = app.findCollectionByNameOrId('novels')
    const typeField = col.fields.getByName('type')
    if (typeField) {
      typeField.values = ['Inkrupt Original', 'Independente']
      app.save(col)
    }
  },
  (app) => {
    // Revert data
    app
      .db()
      .newQuery("UPDATE novels SET type = 'Original' WHERE type = 'Inkrupt Original'")
      .execute()
    app.db().newQuery("UPDATE novels SET type = 'Tradução' WHERE type = 'Independente'").execute()

    // Revert schema
    const col = app.findCollectionByNameOrId('novels')
    const typeField = col.fields.getByName('type')
    if (typeField) {
      typeField.values = ['Original', 'Tradução']
      app.save(col)
    }
  },
)
