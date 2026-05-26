migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')

    if (!users.fields.getByName('author_balance')) {
      users.fields.add(
        new NumberField({
          name: 'author_balance',
        }),
      )
      app.save(users)
    }
  },
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    try {
      users.fields.removeByName('author_balance')
      app.save(users)
    } catch {
      // Field already removed — safe to ignore
    }
  },
)
