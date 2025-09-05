import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializePWA } from './lib/sw-register'

// Initialize PWA features only in production and only after the app loads
if (import.meta.env.PROD) {
	// Delay service worker registration to avoid blocking initial load
	setTimeout(() => {
		initializePWA().catch(console.error);
	}, 2000);
}

createRoot(document.getElementById("root")!).render(<App />);
