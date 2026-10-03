import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { prefersReducedMotion } from './lib/motion'
import { isLiteDevice } from './lib/device'
import '@fontsource-variable/fraunces/full.css'
import '@fontsource-variable/fraunces/full-italic.css'
import '@fontsource-variable/manrope/index.css'
import './index.css'

// The opening sequence plays on every load, always from the top of the page.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
window.scrollTo(0, 0)
document.documentElement.classList.add('intro')

// Hide reveal-able text before first paint, only when animations will run.
if (!prefersReducedMotion()) document.documentElement.classList.add('js-motion')
// Calmer background effects on small or slow devices.
if (isLiteDevice()) document.documentElement.classList.add('lite')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
