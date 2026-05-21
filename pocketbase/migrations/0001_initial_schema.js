migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    const novels = new Collection({
      name: 'novels',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && author = @request.auth.id",
      deleteRule: "@request.auth.id != '' && author = @request.auth.id",
      fields: [
        { name: 'title', type: 'text', required: true },
        {
          name: 'author',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'description', type: 'text' },
        {
          name: 'cover',
          type: 'file',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        },
        { name: 'genres', type: 'json' },
        {
          name: 'status',
          type: 'select',
          values: ['Em Andamento', 'Concluído', 'Hiato'],
          maxSelect: 1,
        },
        { name: 'type', type: 'select', values: ['Original', 'Tradução'], maxSelect: 1 },
        { name: 'rating', type: 'number', min: 0, max: 5 },
        { name: 'is_hot', type: 'bool' },
        { name: 'reads', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_novels_rating ON novels (rating DESC)',
        'CREATE INDEX idx_novels_reads ON novels (reads DESC)',
        'CREATE INDEX idx_novels_created ON novels (created DESC)',
      ],
    })
    app.save(novels)

    const chapters = new Collection({
      name: 'chapters',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'novel',
          type: 'relation',
          required: true,
          collectionId: novels.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'title', type: 'text', required: true },
        { name: 'content', type: 'text' },
        { name: 'chapter_number', type: 'number', required: true, min: 1 },
        { name: 'is_premium', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_chapters_novel_num ON chapters (novel, chapter_number)'],
    })
    app.save(chapters)

    const reviews = new Collection({
      name: 'reviews',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: "@request.auth.id != ''",
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
        {
          name: 'novel',
          type: 'relation',
          required: true,
          collectionId: novels.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'content', type: 'text' },
        { name: 'rating', type: 'number', min: 1, max: 5 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(reviews)

    const library_entries = new Collection({
      name: 'library_entries',
      type: 'base',
      listRule: "@request.auth.id != '' && user = @request.auth.id",
      viewRule: "@request.auth.id != '' && user = @request.auth.id",
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
        {
          name: 'novel',
          type: 'relation',
          required: true,
          collectionId: novels.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'status',
          type: 'select',
          values: ['reading', 'plan_to_read', 'completed'],
          maxSelect: 1,
        },
        { name: 'last_chapter', type: 'relation', collectionId: chapters.id, maxSelect: 1 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(library_entries)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('library_entries'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('reviews'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('chapters'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('novels'))
    } catch (_) {}
  },
)
