import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Trigger reload

// Disable service worker entirely to fix blank screen issues
// if (import.meta.env.PROD) {
// 	// Delay service worker registration to avoid blocking initial load
// 	setTimeout(() => {
// 		initializePWA().catch(console.error);
// 	}, 2000);
// }

createRoot(document.getElementById("root")!).render(<App />);
