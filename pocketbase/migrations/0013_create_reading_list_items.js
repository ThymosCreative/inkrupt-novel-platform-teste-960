migrate(
  (app) => {
    const listsCol = app.findCollectionByNameOrId('reading_lists')
    const novelsCol = app.findCollectionByNameOrId('novels')

    const collection = new Collection({
      name: 'reading_list_items',
      type: 'base',
      listRule: "reading_list.visibility = 'public' || reading_list.user = @request.auth.id",
      viewRule: "reading_list.visibility = 'public' || reading_list.user = @request.auth.id",
      createRule: "@request.auth.id != '' && reading_list.user = @request.auth.id",
      updateRule: "@request.auth.id != '' && reading_list.user = @request.auth.id",
      deleteRule: "@request.auth.id != '' && reading_list.user = @request.auth.id",
      fields: [
        {
          name: 'reading_list',
          type: 'relation',
          required: true,
          collectionId: listsCol.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'novel',
          type: 'relation',
          required: true,
          collectionId: novelsCol.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_reading_list_items_unique ON reading_list_items (reading_list, novel)',
        'CREATE INDEX idx_reading_list_items_list ON reading_list_items (reading_list)',
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('reading_list_items')
    app.delete(collection)
  },
)
