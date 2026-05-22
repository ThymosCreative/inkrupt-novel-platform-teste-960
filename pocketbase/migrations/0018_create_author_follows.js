migrate(
  (app) => {
    const collection = new Collection({
      name: 'author_follows',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != '' && follower = @request.auth.id",
      updateRule: "@request.auth.id != '' && follower = @request.auth.id",
      deleteRule: "@request.auth.id != '' && follower = @request.auth.id",
      fields: [
        {
          name: 'follower',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'author',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_author_follows_unique ON author_follows (follower, author)',
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('author_follows')
    app.delete(collection)
  },
)
