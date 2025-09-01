import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializePWA } from './lib/sw-register'

// Initialize PWA features only in production
if (import.meta.env.PROD) {
	initializePWA().catch(console.error);
}

createRoot(document.getElementById("root")!).render(<App />);
