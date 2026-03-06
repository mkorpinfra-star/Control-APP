import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './i18n' // Importa e inicializa o i18n
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
