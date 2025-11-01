import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsStandalone(true);
      return;
    }

    // Check if iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    const isInStandaloneMode = ('standalone' in window.navigator) && (window.navigator as any).standalone;
    
    setIsIOS(isIOSDevice);
    setIsStandalone(isInStandaloneMode || false);

    // Handle beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after a delay (better UX)
      const hasSeenPrompt = localStorage.getItem('pwa-install-prompt-dismissed');
      if (!hasSeenPrompt) {
        setTimeout(() => {
          setShowInstallPrompt(true);
        }, 3000); // Show after 3 seconds
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if iOS and not in standalone mode
    if (isIOSDevice && !isInStandaloneMode) {
      const hasSeenIOSPrompt = localStorage.getItem('pwa-ios-install-prompt-dismissed');
      if (!hasSeenIOSPrompt) {
        setTimeout(() => {
          setShowInstallPrompt(true);
        }, 3000);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Show the install prompt
      deferredPrompt.prompt();
      
      // Wait for the user to respond
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
      localStorage.setItem('pwa-install-prompt-dismissed', 'true');
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    if (isIOS) {
      localStorage.setItem('pwa-ios-install-prompt-dismissed', 'true');
    } else {
      localStorage.setItem('pwa-install-prompt-dismissed', 'true');
    }
  };

  // Don't show if already installed or prompt was dismissed
  if (isStandalone || !showInstallPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-md animate-fadeInUp">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-4 flex items-start gap-4">
        <div className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
          <Download className="w-5 h-5 text-white" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 mb-1">Install StablePay</h3>
          {isIOS ? (
            <div className="text-sm text-gray-600 space-y-2">
              <p>Install this app on your iOS device:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Tap the <strong>Share</strong> button</li>
                <li>Select <strong>"Add to Home Screen"</strong></li>
              </ol>
            </div>
          ) : (
            <p className="text-sm text-gray-600">
              Install our app for a better experience. Get quick access and work offline!
            </p>
          )}
          
          {!isIOS && deferredPrompt && (
            <button
              onClick={handleInstallClick}
              className="mt-3 w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity text-sm"
            >
              Install Now
            </button>
          )}
        </div>
        
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
