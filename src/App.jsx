import RiskEngineVisualizer from './RiskEngineVisualizer'

function App() {
  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: 'var(--bg)' }}>
      <header className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-4 flex flex-wrap items-center justify-between gap-3">
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

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-4">
        <h1
          className="text-2xl sm:text-3xl md:text-4xl leading-tight"
          style={{ fontFamily: 'var(--serif)', color: 'var(--text)', fontWeight: 400 }}
        >
          E-Gift Delivery Pipeline
        </h1>
        <p
          className="mt-2 text-[13px] sm:text-sm max-w-2xl leading-relaxed"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--sans)' }}
        >
          Interactive visualisation of the migration from synchronous SendGrid delivery
          to an event-driven RabbitMQ + auto-scaling SES consumer pipeline at giftcard.com.
          Toggle the processing mode and traffic load to see the behaviour change.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-12 sm:pb-16">
        <RiskEngineVisualizer />
      </div>
    </div>
  )
}

export default App
