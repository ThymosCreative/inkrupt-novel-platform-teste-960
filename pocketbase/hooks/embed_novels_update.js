onRecordAfterUpdateSuccess((e) => {
  const titleChanged = e.record.getString('title') !== e.record.original().getString('title')
  const descChanged =
    e.record.getString('description') !== e.record.original().getString('description')
  const genresChanged =
    JSON.stringify(e.record.get('genres')) !== JSON.stringify(e.record.original().get('genres'))
  if (!titleChanged && !descChanged && !genresChanged) return e.next()

  const genresStr = e.record.get('genres') ? JSON.stringify(e.record.get('genres')) : ''
  const text = (
    e.record.getString('title') +
    '\n\n' +
    e.record.getString('description') +
    '\n\n' +
    genresStr
  ).trim()
  if (!text) return e.next()
  try {
    const res = $ai.embed({ input: text })
    const record = $app.findRecordById('novels', e.record.id)
    record.set('embedding', res.data[0].embedding)
    $app.saveNoValidate(record)
  } catch (err) {
    $app.logger().error('embedding failed for novel update ' + e.record.id, 'error', err.message)
  }
  return e.next()
}, 'novels')
