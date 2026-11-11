import React, { createContext, useContext, useState, useEffect } from 'react';

const PwaContext = createContext(null);

export function PwaProvider({ children }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
                             window.navigator.standalone === true;
    setIsStandalone(isStandaloneMode);

    const handleBeforeInstallPrompt = (e) => {
      // Prevent automatic mini-infobar on mobile Chrome
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
      console.log('📱 PWA install prompt ready and captured');
    };

    const handleAppInstalled = () => {
      console.log('🎉 UniLife Ethiopia PWA successfully installed');
      setDeferredPrompt(null);
      setIsInstallable(false);
      setIsStandalone(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installPwa = async () => {
    if (!deferredPrompt) {
      // For iOS Safari or browsers without beforeinstallprompt
      alert('To install UniLife on your device:\n\n• On iOS (Safari): Tap the Share button, then tap "Add to Home Screen".\n• On Android/Desktop: Tap browser menu (⋮) and tap "Install UniLife" or "Add to Home Screen".');
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install prompt: ${outcome}`);
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  return (
    <PwaContext.Provider
      value={{
        isInstallable,
        isStandalone,
        installPwa
      }}
    >
      {children}
    </PwaContext.Provider>
  );
}

export function usePwa() {
  const context = useContext(PwaContext);
  if (!context) {
    throw new Error('usePwa must be used within a PwaProvider');
  }
  return context;
}
