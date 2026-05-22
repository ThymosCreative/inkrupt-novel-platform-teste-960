migrate(
  (app) => {
    try {
      const user = app.findAuthRecordByEmail('_pb_users_auth_', 'kaike@adapta.org')
      const novels = app.findRecordsByFilter('novels', '1=1', '-created', 2, 0)

      if (novels.length >= 2) {
        const listCol = app.findCollectionByNameOrId('reading_lists')
        const itemCol = app.findCollectionByNameOrId('reading_list_items')

        try {
          app.findFirstRecordByData('reading_lists', 'title', 'Staff Picks')
        } catch (_) {
          const list = new Record(listCol)
          list.set('user', user.id)
          list.set('title', 'Staff Picks')
          list.set('description', 'A selection of our favorite novels.')
          list.set('visibility', 'public')
          app.save(list)

          for (const n of novels) {
            const item = new Record(itemCol)
            item.set('reading_list', list.id)
            item.set('novel', n.id)
            app.save(item)
          }
        }
      }
    } catch (e) {}
  },
  (app) => {
    try {
      const list = app.findFirstRecordByData('reading_lists', 'title', 'Staff Picks')
      app.delete(list)
    } catch (e) {}
  },
)
