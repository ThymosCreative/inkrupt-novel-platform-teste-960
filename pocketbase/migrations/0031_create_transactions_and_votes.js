migrate(
  (app) => {
    // ── transactions ────────────────────────────────────────────────────────
    // Persists every wallet event (coin gains/losses, fast-pass changes, EXP).
    // Previously stored only in browser localStorage — now in PocketBase so
    // the history is preserved across devices.
    const transCol = new Collection({
      name: 'transactions',
      type: 'base',
      listRule: '@request.auth.id != "" && user = @request.auth.id',
      viewRule: '@request.auth.id != "" && user = @request.auth.id',
      createRule: '@request.auth.id != ""',
      updateRule: null,
      deleteRule: null,
      fields: [
        new RelationField({ name: 'user', collectionId: '_pb_users_auth_', required: true }),
        new NumberField({ name: 'amount', required: true }),
        new SelectField({
          name: 'type',
          values: ['coin', 'fast_pass', 'exp'],
          maxSelect: 1,
          required: true,
        }),
        new TextField({ name: 'description', required: true }),
      ],
    })
    app.save(transCol)

    // ── novel_votes ──────────────────────────────────────────────────────────
    // One record per (user, novel, day). Replaces the localStorage vote cache.
    // The `voted_at` timestamp lets the frontend check "did I vote today?".
    const votesCol = new Collection({
      name: 'novel_votes',
      type: 'base',
      listRule: '@request.auth.id != "" && user = @request.auth.id',
      viewRule: '@request.auth.id != "" && user = @request.auth.id',
      createRule: '@request.auth.id != ""',
      updateRule: null,
      deleteRule: null,
      fields: [
        new RelationField({ name: 'user', collectionId: '_pb_users_auth_', required: true }),
        new RelationField({ name: 'novel', collectionId: 'novels', required: true }),
        new NumberField({ name: 'voted_at', required: true }),
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
