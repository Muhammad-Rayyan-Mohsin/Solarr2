// Service Worker Registration
export async function registerServiceWorker() {
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      });

      console.log('Service Worker registered successfully:', registration);

      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available, show update prompt
              showUpdatePrompt(registration);
            }
          });
        }
      });

      // Handle service worker messages
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SKIP_WAITING') {
          registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
        }
      });

      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      throw error;
    }
  } else {
    console.warn('Service Worker not supported');
    return null;
  }
}

// Show update prompt to user
function showUpdatePrompt(registration: ServiceWorkerRegistration) {
  // You can implement a custom update prompt here
  // For now, we'll just reload the page when the service worker is ready
  if (registration.waiting) {
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }
}

// Check for app updates
export async function checkForUpdates() {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.update();
    }
  }
}

// Install prompt for PWA
export async function showInstallPrompt() {
  let deferredPrompt: any;

  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    
    // Show install button or prompt
    showInstallButton();
  });

  return deferredPrompt;
}

// Show install button (you can customize this)
function showInstallButton() {
  // Create or show install button
  const installButton = document.getElementById('install-button');
  if (installButton) {
    installButton.style.display = 'block';
    installButton.addEventListener('click', async () => {
      if (window.deferredPrompt) {
        window.deferredPrompt.prompt();
        const { outcome } = await window.deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        window.deferredPrompt = null;
        installButton.style.display = 'none';
      }
    });
  }
}

// Background sync registration
export async function registerBackgroundSync() {
  if ('serviceWorker' in navigator && 'sync' in (window as any).ServiceWorkerRegistration.prototype) {
    const registration = await navigator.serviceWorker.ready;
    
    try {
      await (registration as any).sync.register('background-sync');
      console.log('Background sync registered');
    } catch (error) {
      console.error('Background sync registration failed:', error);
    }
  }
}

// Push notification registration
export async function registerPushNotifications() {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: 'YOUR_VAPID_PUBLIC_KEY' // Replace with your VAPID key
        });
        
        console.log('Push notification subscription:', subscription);
        return subscription;
      }
    } catch (error) {
      console.error('Push notification registration failed:', error);
    }
  }
  
  return null;
}

// Initialize all PWA features
export async function initializePWA() {
  try {
    // Register service worker
    await registerServiceWorker();
    
    // Register background sync
    await registerBackgroundSync();
    
    // Show install prompt
    await showInstallPrompt();
    
    console.log('PWA initialized successfully');
  } catch (error) {
    console.error('PWA initialization failed:', error);
  }
}

// Declare global types
declare global {
  interface Window {
    deferredPrompt: any;
  }
}

