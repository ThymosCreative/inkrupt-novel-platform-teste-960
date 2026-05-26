migrate(
  (app) => {
    // Backfill chapters.type from the legacy is_premium boolean so every
    // existing record has a proper value in the new field.
    app
      .db()
      .newQuery(
        "UPDATE chapters SET type = 'premium' WHERE (type IS NULL OR type = '') AND is_premium = TRUE",
      )
      .execute()
    app
      .db()
      .newQuery(
        "UPDATE chapters SET type = 'free' WHERE (type IS NULL OR type = '') AND (is_premium IS NULL OR is_premium = FALSE)",
      )
      .execute()
  },
  () => {
    // No-op: we don't reverse the backfill — it's data, not schema.
  },
)
