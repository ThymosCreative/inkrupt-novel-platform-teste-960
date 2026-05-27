migrate(
  (app) => {
    // Raise the character limit on long-form fields without losing existing data.
    //
    // Default TextField max in PocketBase admin is often 5000, which is
    // insufficient for novel chapters (some go past 10k words ≈ 60k chars).
    //
    // Reference sizes (Webnovel):
    //   - Median chapter:           ~2.5k words ≈ 15k chars
    //   - Long chapter:             ~5k words   ≈ 30k chars
    //   - Hard cap on the platform: ~10k words  ≈ 60k chars
    //
    // We set chapters.content to 200_000 chars (≈ 30k words) so the longest
    // legitimate chapters comfortably fit, while still preventing abuse
    // (single rows with megabytes of text that would hurt DB performance).
    //
    // We mutate the existing field in-place instead of removing/re-adding,
    // so saved chapter content is preserved.
    const setMax = (collectionName, fieldName, max) => {
      try {
        const col = app.findCollectionByNameOrId(collectionName)
        const field = col.fields.getByName(fieldName)
        if (!field) return
        field.max = max
        app.save(col)
      } catch (err) {
        console.log(`[migration 0035] ${collectionName}.${fieldName}: ${err.message}`)
      }
    }

    setMax('chapters', 'content', 200000)   // ≈ 30k words per chapter
    setMax('novels', 'description', 5000)   // long blurb / synopsis
    setMax('reviews', 'content', 5000)      // long review
    setMax('comments', 'content', 2000)     // forum-style comment
  },
  (app) => {
    // Reverse to the original (default) caps. If you re-run the down
    // migration in dev, the fields go back to PocketBase's default max.
    const setMax = (collectionName, fieldName, max) => {
      try {
        const col = app.findCollectionByNameOrId(collectionName)
        const field = col.fields.getByName(fieldName)
        if (!field) return
        field.max = max
        app.save(col)
      } catch {
        // Field may already be gone — ignore
      }
    }

    setMax('chapters', 'content', 5000)
    setMax('novels', 'description', 5000)
    setMax('reviews', 'content', 5000)
    setMax('comments', 'content', 5000)
  },
)
