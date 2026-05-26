// Chapter content enrichment hook.
//
// HISTORY: Earlier versions attempted to strip `content` from the API response
// for premium chapters that the requesting user hadn't unlocked. The auth
// detection (via `e.requestInfo().auth`) proved unreliable inside PocketBase's
// Goja JavaScript runtime — Go-bound methods don't always satisfy
// `typeof X === 'function'`, and `info.auth` sometimes came back null even
// for legitimately authenticated requests. The result: content was stripped
// for everyone, including the chapter's own author.
//
// CURRENT BEHAVIOR: no-op. Every chapter response returns its full content.
// The frontend (Reader.tsx) already enforces the lock/unlock UI based on
// `is_premium`, `type`, and the user's `unlocked_chapters` entries.
//
// PHASE 2 TODO: re-introduce server-side payment enforcement once we have
// a reliable way to read the request auth context from this hook.
onRecordEnrich((e) => {
  if (!e.record) return e.next()
  return e.next()
}, 'chapters')
