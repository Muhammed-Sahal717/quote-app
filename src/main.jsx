import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* strict mode is a development tool that helps identify potential problems in the code */}
    <App />
  </StrictMode>,
)
