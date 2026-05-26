migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')

    if (!users.fields.getByName('author_tier')) {
      users.fields.add(
        new SelectField({
          name: 'author_tier',
          values: ['starter', 'partner', 'original'],
          maxSelect: 1,
        }),
      )
      app.save(users)
    }

    // Backfill: every existing author gets the 'starter' tier (entry-level).
    // Admin promotes to 'partner' (signed monetization contract) or
    // 'original' (curated Inkrupt Original author) via the admin panel.
    app
      .db()
      .newQuery(
        "UPDATE users SET author_tier = 'starter' WHERE is_author = TRUE AND (author_tier IS NULL OR author_tier = '')",
      )
      .execute()
  },
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    try {
      users.fields.removeByName('author_tier')
      app.save(users)
    } catch {
      // Field already removed — safe to ignore
    }
  },
)
