import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './app/App'
import './app/styles/index.css'

// Swiper 전역 스타일
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
