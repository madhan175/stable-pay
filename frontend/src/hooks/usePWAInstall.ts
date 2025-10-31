import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface UsePWAInstallReturn {
  deferredPrompt: BeforeInstallPromptEvent | null;
  isIOS: boolean;
  isStandalone: boolean;
  canInstall: boolean;
  installApp: () => Promise<void>;
}

export const usePWAInstall = (): UsePWAInstallReturn => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if app is already installed (standalone mode)
    const checkStandalone = () => {
      const isInStandaloneMode = 
        window.matchMedia('(display-mode: standalone)').matches ||
        ((window.navigator as any).standalone === true);
      
      setIsStandalone(isInStandaloneMode);
      
      // Check if iOS
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
      setIsIOS(isIOSDevice);
      
      // Debug logging
      console.log('PWA Install Check:', {
        isStandalone: isInStandaloneMode,
        isIOS: isIOSDevice,
        userAgent: userAgent,
        hasServiceWorker: 'serviceWorker' in navigator
      });
    };

    checkStandalone();

    // Handle beforeinstallprompt event (Android/Chrome/Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check again after a short delay to ensure all checks are done
    const timeoutId = setTimeout(checkStandalone, 500);

    // Also check periodically for the event (in case it fires later)
    const intervalId = setInterval(() => {
      checkStandalone();
    }, 2000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, []);

  const installApp = async () => {
    try {
      if (deferredPrompt) {
        console.log('Triggering install prompt...');
        // Show the install prompt
        await deferredPrompt.prompt();
        
        // Wait for the user to respond
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        
        // Clear the deferred prompt since it can only be used once
        setDeferredPrompt(null);
      } else {
        console.warn('No deferred prompt available. User may need to use browser menu to install.');
        // Fallback: Try to show manual instructions
        alert('To install this app:\n\nChrome/Edge: Click the install icon in the address bar\nSafari (iOS): Tap Share → Add to Home Screen');
      }
    } catch (error) {
      console.error('Error installing app:', error);
      alert('Installation failed. Please try using your browser\'s install option.');
    }
  };

  // Show button if:
  // 1. Not already in standalone mode
  // 2. Show for all modern browsers (service worker support means PWA capable)
  // This ensures the button is visible even if beforeinstallprompt hasn't fired yet
  const isPWACapable = 'serviceWorker' in navigator;
  const canInstall = !isStandalone && isPWACapable;

  return {
    deferredPrompt,
    isIOS,
    isStandalone,
    canInstall,
    installApp,
  };
};

