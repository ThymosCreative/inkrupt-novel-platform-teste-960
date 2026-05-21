migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('novels')
    if (!col.fields.getByName('embedding')) {
      // Workaround for missing VectorField constructor in JS VM
      const raw = JSON.parse(JSON.stringify(col))
      raw.fields.push({
        name: 'embedding',
        type: 'vector',
        dimensions: 1536,
        distance: 'cosine',
      })
      const updatedCol = new Collection(raw)
      updatedCol.addIndex('idx_novels_title', false, 'title', '')
      updatedCol.addIndex('idx_novels_author', false, 'author', '')
      app.save(updatedCol)
    } else {
      col.addIndex('idx_novels_title', false, 'title', '')
      col.addIndex('idx_novels_author', false, 'author', '')
      app.save(col)
    }
  },
  (app) => {
    const col = app.findCollectionByNameOrId('novels')
    if (col.fields.getByName('embedding')) {
      const raw = JSON.parse(JSON.stringify(col))
      raw.fields = raw.fields.filter((f) => f.name !== 'embedding')
      const updatedCol = new Collection(raw)
      updatedCol.removeIndex('idx_novels_title')
      updatedCol.removeIndex('idx_novels_author')
      app.save(updatedCol)
    } else {
      col.removeIndex('idx_novels_title')
      col.removeIndex('idx_novels_author')
      app.save(col)
    }
  },
)
