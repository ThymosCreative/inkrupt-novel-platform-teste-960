migrate(
  (app) => {
    const novelsId = app.findCollectionByNameOrId('novels').id

    const transCol = new Collection({
      name: 'transactions',
      type: 'base',
      listRule: '@request.auth.id != "" && user = @request.auth.id',
      viewRule: '@request.auth.id != "" && user = @request.auth.id',
      createRule: '@request.auth.id != ""',
      updateRule: null,
      deleteRule: null,
      fields: [
        {
          name: 'user',
          type: 'relation',
          collectionId: '_pb_users_auth_',
          required: true,
          maxSelect: 1,
        },
        { name: 'amount', type: 'number', required: true },
        {
          name: 'type',
          type: 'select',
          values: ['coin', 'fast_pass', 'exp'],
          maxSelect: 1,
          required: true,
        },
        { name: 'description', type: 'text', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(transCol)

    const votesCol = new Collection({
      name: 'novel_votes',
      type: 'base',
      listRule: '@request.auth.id != "" && user = @request.auth.id',
      viewRule: '@request.auth.id != "" && user = @request.auth.id',
      createRule: '@request.auth.id != ""',
      updateRule: null,
      deleteRule: null,
      fields: [
        {
          name: 'user',
          type: 'relation',
          collectionId: '_pb_users_auth_',
          required: true,
          maxSelect: 1,
        },
        { name: 'novel', type: 'relation', collectionId: novelsId, required: true, maxSelect: 1 },
        { name: 'voted_at', type: 'number', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(votesCol)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('transactions'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('novel_votes'))
    } catch (_) {}
  },
)
