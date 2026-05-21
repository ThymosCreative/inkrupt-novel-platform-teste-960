onRecordAfterCreateSuccess((e) => {
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
    $app.logger().error('embedding failed for novel ' + e.record.id, 'error', err.message)
  }
  return e.next()
}, 'novels')
