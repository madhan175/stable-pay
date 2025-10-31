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

  const showManualInstallInstructions = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    let instructions = '';
    
    if (isIOS) {
      instructions = 'To install on iOS:\n\n1. Tap the Share button (□↑) at the bottom\n2. Scroll and select "Add to Home Screen"\n3. Tap "Add"';
    } else if (userAgent.includes('chrome') || userAgent.includes('edg')) {
      instructions = 'To install on Chrome/Edge:\n\n1. Look for the Install icon (⊕) in the address bar (right side)\n2. Click it and select "Install"\n\nOR\n\n1. Click the menu (⋮) in the top right\n2. Look for "Install StablePay" or "Install app" option';
    } else if (userAgent.includes('firefox')) {
      instructions = 'To install on Firefox:\n\n1. Click the menu (☰) in the top right\n2. Look for "Install" or "Add to Home Screen" option';
    } else {
      instructions = 'To install this app:\n\n- Chrome/Edge: Look for install icon (⊕) in address bar\n- Firefox: Menu → Install\n- Safari (iOS): Share → Add to Home Screen\n- Check your browser\'s menu for install options';
    }
    
    alert(instructions);
  };

  const installApp = async () => {
    try {
      if (deferredPrompt) {
        console.log('Triggering install prompt...');
        try {
          // Show the install prompt
          await deferredPrompt.prompt();
          
          // Wait for the user to respond
          const { outcome } = await deferredPrompt.userChoice;
          
          if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
            // Don't clear the prompt immediately - browser will handle it
            // The prompt will be cleared automatically after installation
          } else {
            console.log('User dismissed the install prompt');
          }
          
          // Note: We keep deferredPrompt available so button can be clicked again
          // The browser will automatically clear it after successful installation
        } catch (promptError) {
          console.error('Error showing install prompt:', promptError);
          // If prompt fails, show manual instructions
          showManualInstallInstructions();
        }
      } else {
        console.warn('No deferred prompt available yet. Showing manual instructions.');
        showManualInstallInstructions();
      }
    } catch (error) {
      console.error('Error installing app:', error);
      showManualInstallInstructions();
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

