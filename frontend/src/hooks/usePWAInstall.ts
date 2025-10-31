import { useState, useEffect, useRef } from 'react';

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
  installApp: () => Promise<boolean>;
  showManualInstructions: () => void;
}

export const usePWAInstall = (): UsePWAInstallReturn => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const eventFiredRef = useRef(false);

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
      
      // Debug logging (less frequent)
      if (!eventFiredRef.current) {
        console.log('PWA Install Check:', {
          isStandalone: isInStandaloneMode,
          isIOS: isIOSDevice,
          userAgent: userAgent.substring(0, 50) + '...',
          hasServiceWorker: 'serviceWorker' in navigator
        });
      }
    };

    checkStandalone();

    // Handle beforeinstallprompt event (Android/Chrome/Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('✅ beforeinstallprompt event fired!', e);
      eventFiredRef.current = true;
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      console.log('Prompt event details:', {
        platforms: promptEvent.platforms,
        eventType: e.type
      });
      setDeferredPrompt(promptEvent);
      deferredPromptRef.current = promptEvent;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if Chrome shows install option in UI (alternative detection)
    const checkChromeInstallability = () => {
      // Chrome sometimes doesn't fire beforeinstallprompt if user previously dismissed
      // But the app might still be installable via browser UI
      if ('serviceWorker' in navigator && !isStandalone) {
        try {
          // Check manifest
          const manifestLink = document.querySelector('link[rel="manifest"]');
          if (manifestLink) {
            console.log('✅ Manifest link found');
          }
        } catch (e) {
          console.warn('Error checking manifest:', e);
        }
      }
    };

    // Initial check
    checkChromeInstallability();

    // Check again after a short delay
    const timeoutId = setTimeout(() => {
      checkStandalone();
      checkChromeInstallability();
    }, 500);

    // Also check periodically for the event (in case it fires later)
    const intervalId = setInterval(() => {
      if (!eventFiredRef.current) {
        checkStandalone();
      }
    }, 3000);

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

  const installApp = async (): Promise<boolean> => {
    try {
      // Check if service worker is registered (required for PWA install)
      let swRegistered = false;
      if ('serviceWorker' in navigator) {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          swRegistered = registrations.length > 0;
          console.log('Service Worker registered:', swRegistered, 'Count:', registrations.length);
        } catch (swError) {
          console.warn('Error checking service worker:', swError);
        }
      }

      // Wait for the prompt - Chrome may delay it until user gesture
      if (!deferredPromptRef.current && !deferredPrompt) {
        console.log('Waiting for install prompt (may take a moment)...');
        // Wait longer and check multiple times
        for (let i = 0; i < 5; i++) {
          await new Promise(resolve => setTimeout(resolve, 200));
          if (deferredPromptRef.current || deferredPrompt) break;
        }
      }

      // Use ref to get the latest prompt (closure might be stale)
      const currentPrompt = deferredPromptRef.current || deferredPrompt;
      
      if (currentPrompt) {
        console.log('✅ Triggering install prompt...', currentPrompt);
        try {
          // Show the install prompt
          await currentPrompt.prompt();
          
          // Wait for the user to respond
          const { outcome } = await currentPrompt.userChoice;
          
          if (outcome === 'accepted') {
            console.log('✅ User accepted the install prompt - App should install now!');
            // Clear the prompt after successful installation
            setDeferredPrompt(null);
            deferredPromptRef.current = null;
            return true;
          } else {
            console.log('User dismissed the install prompt');
            return false;
          }
        } catch (promptError: any) {
          console.error('❌ Error showing install prompt:', promptError);
          console.error('Error details:', {
            message: promptError?.message,
            name: promptError?.name
          });
          return false;
        }
      } else {
        console.warn('⚠️ No deferred prompt available.');
        console.log('🔍 PWA Installation Requirements Check:');
        console.log('   - HTTPS/Localhost:', window.location.protocol === 'https:' || window.location.hostname === 'localhost');
        console.log('   - Service Worker registered:', swRegistered);
        console.log('   - Service Worker supported:', 'serviceWorker' in navigator);
        console.log('   - Manifest: Check DevTools > Application > Manifest');
        console.log('   - Current URL:', window.location.href);
        console.log('');
        console.log('💡 IMPORTANT: If beforeinstallprompt didn\'t fire, you can still install:');
        console.log('   1. Look for the install icon (⊕) in Chrome\'s address bar');
        console.log('   2. Or go to Chrome menu (⋮) > "Install StablePay"');
        console.log('   3. The app is installable even if the event didn\'t fire!');
        
        return false;
      }
    } catch (error) {
      console.error('❌ Error installing app:', error);
      return false;
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
    showManualInstructions: showManualInstallInstructions,
  };
};
