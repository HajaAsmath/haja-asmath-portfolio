import RiskEngineVisualizer from './RiskEngineVisualizer'

function App() {
  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: 'var(--bg)' }}>
      <header className="max-w-5xl mx-auto px-6 pt-10 pb-4 flex items-center justify-between">
        <a
          href="/"
          className="text-xs tracking-[0.12em] uppercase no-underline"
          style={{ color: 'var(--text-faint)', fontFamily: 'var(--mono)' }}
        >
          ← Back to portfolio
        </a>
        <span
          className="text-xs tracking-[0.12em] uppercase"
          style={{ color: 'var(--text-faint)', fontFamily: 'var(--mono)' }}
        >
          02 — Professional Projects
        </span>
      </header>

      <div className="max-w-5xl mx-auto px-6 pb-4">
        <h1
          className="text-3xl md:text-4xl"
          style={{ fontFamily: 'var(--serif)', color: 'var(--text)' }}
        >
          E-Gift Delivery Pipeline
        </h1>
        <p
          className="mt-2 text-sm max-w-2xl"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--sans)' }}
        >
          Interactive visualisation of the migration from synchronous SendGrid delivery
          to an event-driven RabbitMQ + auto-scaling SES consumer pipeline at giftcard.com.
          Toggle the processing mode and traffic load to see the behaviour change.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-6 pb-16">
        <RiskEngineVisualizer />
      </div>
    </div>
  )
}

export default App
