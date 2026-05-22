migrate(
  (app) => {
    try {
      const adminUser = app.findAuthRecordByEmail('_pb_users_auth_', 'kaike@adapta.org')
      const novels = app.findRecordsByFilter('novels', '1=1', '-created', 3, 0)

      if (novels.length > 0) {
        const discussionsCol = app.findCollectionByNameOrId('novel_discussions')
        for (const novel of novels) {
          try {
            app.findFirstRecordByFilter('novel_discussions', 'novel = {:novel} && user = {:user}', {
              novel: novel.id,
              user: adminUser.id,
            })
          } catch (_) {
            const discussion = new Record(discussionsCol)
            discussion.set('user', adminUser.id)
            discussion.set('novel', novel.id)
            discussion.set('content', 'This is an amazing novel! Highly recommended.')
            app.save(discussion)
          }
        }
      }

      try {
        const authorUsers = app.findRecordsByFilter('_pb_users_auth_', 'is_author = true', '', 1, 0)
        if (authorUsers.length > 0 && authorUsers[0].id !== adminUser.id) {
          const followsCol = app.findCollectionByNameOrId('author_follows')
          try {
            app.findFirstRecordByFilter(
              'author_follows',
              'follower = {:follower} && author = {:author}',
              {
                follower: adminUser.id,
                author: authorUsers[0].id,
              },
            )
          } catch (_) {
            const follow = new Record(followsCol)
            follow.set('follower', adminUser.id)
            follow.set('author', authorUsers[0].id)
            app.save(follow)
          }
        }
      } catch (_) {}
    } catch (_) {}
  },
  (app) => {
    // Empty down migration, it is a seed
  },
)
