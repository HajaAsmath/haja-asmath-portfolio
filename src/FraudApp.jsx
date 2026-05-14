import FraudDecisioningLifecycle from './FraudDecisioningLifecycle'

function FraudApp() {
  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: 'var(--bg)' }}>
      <header className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-4 flex flex-wrap items-center justify-between gap-3">
        <a
          href="/"
          className="text-[11px] sm:text-xs tracking-[0.12em] uppercase no-underline"
          style={{ color: 'var(--text-faint)', fontFamily: 'var(--mono)' }}
        >
          ← Back to portfolio
        </a>
        <span
          className="text-[11px] sm:text-xs tracking-[0.12em] uppercase"
          style={{ color: 'var(--text-faint)', fontFamily: 'var(--mono)' }}
        >
          02 — Professional Projects
        </span>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-4">
        <h1
          className="text-2xl sm:text-3xl md:text-4xl leading-tight"
          style={{ fontFamily: 'var(--serif)', color: 'var(--text)', fontWeight: 400 }}
        >
          Real-Time Fraud Decisioning Lifecycle
        </h1>
        <p
          className="mt-2 text-[13px] sm:text-sm max-w-2xl leading-relaxed"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--sans)' }}
        >
          A fraud platform is more than a rule engine — it's a full decision loop.
          Signals are collected and enriched, scored under tight latency, routed to
          approve / decline / human review, and the outcomes (chargebacks, disputes,
          confirmed fraud) feed back into the rules. Toggle the scenario to see how
          one transaction flows end-to-end.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-12 sm:pb-16">
        <FraudDecisioningLifecycle />
      </div>
    </div>
  )
}

export default FraudApp
