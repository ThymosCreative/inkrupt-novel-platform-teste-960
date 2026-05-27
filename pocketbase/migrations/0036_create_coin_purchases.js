migrate(
  (app) => {
    // Every coin-purchase attempt is logged here, regardless of outcome.
    // The backend endpoint /backend/v1/purchase-coins is the single source of
    // truth for crediting coins — the frontend can no longer call
    // `users.update({ coins: ... })` directly.
    //
    // Status lifecycle:
    //   pending    → created the moment a checkout is initiated
    //   completed  → payment confirmed (or, in simulation mode, instant)
    //   failed     → gateway returned an error / user abandoned
    //   refunded   → coins were taken back (chargeback, support refund)
    //
    // Gateway field tags where the payment was processed. 'simulation' is
    // the placeholder we use during development before a real gateway is
    // plugged in (Phase 2.4).
    const col = new Collection({
      name: 'coin_purchases',
      type: 'base',
      // Users can list/view their own purchases (transaction history page).
      // Only the backend (via hook) creates records — no client writes.
      listRule: '@request.auth.id != "" && user = @request.auth.id',
      viewRule: '@request.auth.id != "" && user = @request.auth.id',
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        new RelationField({ name: 'user', collectionId: '_pb_users_auth_', required: true }),
        new TextField({ name: 'package_id', required: true }),
        new NumberField({ name: 'coins_credited', required: true }),
        new NumberField({ name: 'price_paid_brl_cents', required: true }),
        new SelectField({
          name: 'status',
          values: ['pending', 'completed', 'failed', 'refunded'],
          maxSelect: 1,
          required: true,
        }),
        new SelectField({
          name: 'gateway',
          values: ['simulation', 'mercadopago', 'stripe'],
          maxSelect: 1,
          required: true,
        }),
        new TextField({ name: 'gateway_payment_id' }),
      ],
    })
    app.save(col)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('coin_purchases'))
    } catch {
      // Collection may already be gone — safe to ignore
    }
  },
)
