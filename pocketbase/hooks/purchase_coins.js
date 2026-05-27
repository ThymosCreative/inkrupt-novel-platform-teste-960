// Secure coin purchase endpoint.
//
// Before this hook, the frontend was calling `pb.collection('users').update`
// directly to add coins — which means anyone with a DevTools console could
// grant themselves infinite coins. Bug.
//
// Now the only way to credit coins is through this endpoint. The endpoint:
//   1. Looks up the requested package by id from a backend-controlled list
//      (the frontend cannot specify arbitrary coin amounts or prices)
//   2. Records the purchase in coin_purchases with status='pending'
//   3. In SIMULATION mode (no real gateway): immediately marks the purchase
//      completed and credits the coins. Used during development.
//   4. When a real gateway is added (Phase 2.4), the simulation branch will
//      be replaced with: create payment intent → return checkout URL →
//      separate webhook hook marks the purchase completed on confirmation.
//
// The PACKAGES list MUST stay in sync with src/lib/coin-packages.ts — if you
// change one, change the other. We don't share code here because PocketBase
// hooks run in Goja (a separate JS runtime) and can't import frontend modules.

routerAdd(
  'POST',
  '/backend/v1/purchase-coins',
  (e) => {
    const PACKAGES = {
      p60:   { coins: 60,    price_brl_cents: 500 },
      p300:  { coins: 300,   price_brl_cents: 2500 },
      p680:  { coins: 680,   price_brl_cents: 5000 },
      p1280: { coins: 1280,  price_brl_cents: 10000 },
      p3280: { coins: 3280,  price_brl_cents: 25000 },
      p6480: { coins: 6480,  price_brl_cents: 50000 },
    }

    // Parse body — defensive against PocketBase Goja's quirks.
    let body = {}
    try {
      body = e.requestInfo().body || {}
    } catch (_) {
      // requestInfo may not be available on every PB version — fall through.
    }

    const packageId = body.package_id
    if (!packageId || !PACKAGES[packageId]) {
      return e.badRequestError('invalid package_id')
    }

    const pkg = PACKAGES[packageId]

    // Authenticated user
    const userId = e.auth?.id
    if (!userId) return e.unauthorizedError('auth required')

    let createdRecordId = null

    try {
      $app.runInTransaction((txApp) => {
        const user = txApp.findRecordById('_pb_users_auth_', userId)

        // 1. Create the purchase record (status=pending initially)
        const purchasesCol = txApp.findCollectionByNameOrId('coin_purchases')
        const purchase = new Record(purchasesCol)
        purchase.set('user', userId)
        purchase.set('package_id', packageId)
        purchase.set('coins_credited', pkg.coins)
        purchase.set('price_paid_brl_cents', pkg.price_brl_cents)
        purchase.set('status', 'pending')
        purchase.set('gateway', 'simulation')
        txApp.save(purchase)
        createdRecordId = purchase.id

        // 2. SIMULATION MODE — credit coins immediately, mark completed.
        //    Replace this block with real-gateway flow in Phase 2.4.
        const currentCoins = user.getInt('coins') || 0
        user.set('coins', currentCoins + pkg.coins)
        txApp.save(user)

        purchase.set('status', 'completed')
        txApp.save(purchase)
      })
    } catch (err) {
      $app.logger().error(
        'purchase-coins failed',
        'userId', userId,
        'packageId', packageId,
        'error', err.message,
      )
      return e.internalServerError('purchase failed')
    }

    return e.json(200, {
      success: true,
      purchase_id: createdRecordId,
      coins_credited: pkg.coins,
      price_paid_brl_cents: pkg.price_brl_cents,
    })
  },
  $apis.requireAuth(),
)
