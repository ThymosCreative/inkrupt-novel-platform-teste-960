migrate(
  (app) => {
    const collection = new Collection({
      name: 'author_applications',
      type: 'base',
      listRule: "@request.auth.id != '' && user = @request.auth.id",
      viewRule: "@request.auth.id != '' && user = @request.auth.id",
      createRule: "@request.auth.id != '' && @request.auth.is_author = false",
      updateRule: null,
      deleteRule: null,
      fields: [
        {
          name: 'user',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'bio', type: 'text', required: true },
        { name: 'portfolio_link', type: 'text', required: false },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['pending', 'approved', 'rejected'],
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_author_applications_user ON author_applications (user)'],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('author_applications')
    app.delete(collection)
  },
)
