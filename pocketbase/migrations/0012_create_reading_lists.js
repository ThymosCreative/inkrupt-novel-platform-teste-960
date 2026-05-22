migrate(
  (app) => {
    const collection = new Collection({
      name: 'reading_lists',
      type: 'base',
      listRule: "visibility = 'public' || user = @request.auth.id",
      viewRule: "visibility = 'public' || user = @request.auth.id",
      createRule: "@request.auth.id != '' && user = @request.auth.id",
      updateRule: "@request.auth.id != '' && user = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user = @request.auth.id",
      fields: [
        {
          name: 'user',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'text' },
        {
          name: 'visibility',
          type: 'select',
          required: true,
          values: ['public', 'private'],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_reading_lists_user ON reading_lists (user)',
        'CREATE INDEX idx_reading_lists_visibility ON reading_lists (visibility)',
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('reading_lists')
    app.delete(collection)
  },
)
