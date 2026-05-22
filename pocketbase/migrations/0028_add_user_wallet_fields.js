migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('_pb_users_auth_')

    if (!col.fields.getByName('exp')) {
      col.fields.add(new NumberField({ name: 'exp' }))
    }
    if (!col.fields.getByName('level')) {
      col.fields.add(new NumberField({ name: 'level' }))
    }
    if (!col.fields.getByName('fast_passes')) {
      col.fields.add(new JSONField({ name: 'fast_passes', maxSize: 2000000 }))
    }
    if (!col.fields.getByName('power_stones')) {
      col.fields.add(new NumberField({ name: 'power_stones' }))
    }
    if (!col.fields.getByName('last_checkin')) {
      col.fields.add(new NumberField({ name: 'last_checkin' }))
    }
    if (!col.fields.getByName('last_vote_reward')) {
      col.fields.add(new NumberField({ name: 'last_vote_reward' }))
    }

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('_pb_users_auth_')
    col.fields.removeByName('exp')
    col.fields.removeByName('level')
    col.fields.removeByName('fast_passes')
    col.fields.removeByName('power_stones')
    col.fields.removeByName('last_checkin')
    col.fields.removeByName('last_vote_reward')
    app.save(col)
  },
)
