import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import FraudApp from './FraudApp.jsx'

// Multi-page Vite: same JS bundle, route by URL path.
const isFraud = typeof window !== 'undefined' && /fraud/i.test(window.location.pathname);
const Page = isFraud ? FraudApp : App;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Page />
  </StrictMode>,
)
