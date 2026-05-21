migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    users.fields.add(
      new JSONField({
        name: 'preferences',
        required: false,
        maxSize: 2000000,
      }),
    )
    app.save(users)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    users.fields.removeByName('preferences')
    app.save(users)
  },
)
