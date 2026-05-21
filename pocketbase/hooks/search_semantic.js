routerAdd('POST', '/backend/v1/search/semantic', (e) => {
  const body = e.requestInfo().body || {}
  const query = (body.query || '').trim()
  if (!query) return e.badRequestError('missing query')

  try {
    const embedRes = $ai.embed({ input: query })
    const results = $vectors.search(e, 'novels', {
      field: 'embedding',
      query: embedRes.data[0].embedding,
      k: body.k || 20,
      filter: body.filter || '',
      expand: ['author'],
    })
    return e.json(200, results)
  } catch (err) {
    $app.logger().error('semantic search failed', 'error', err.message)
    return e.json(200, { items: [] })
  }
})
