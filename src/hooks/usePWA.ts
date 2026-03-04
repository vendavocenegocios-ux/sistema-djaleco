import { useState, useEffect, useCallback } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";

function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showManualInstall, setShowManualInstall] = useState(false);

  useEffect(() => {
    if (isStandalone()) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowManualInstall(false);
    };

    const installedHandler = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowManualInstall(false);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", installedHandler);

    // On mobile, show manual install instructions immediately
    // since beforeinstallprompt never fires on iOS Safari
    if (isMobileDevice()) {
      setShowManualInstall(true);
    } else {
      const timeout = setTimeout(() => {
        if (!isStandalone()) {
          setShowManualInstall(true);
        }
      }, 2000);
      return () => {
        window.removeEventListener("beforeinstallprompt", handler);
        window.removeEventListener("appinstalled", installedHandler);
        clearTimeout(timeout);
      };
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt) return false;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
      setDeferredPrompt(null);
    }
    return outcome === "accepted";
  }, [deferredPrompt]);

  return {
    canInstall: !!deferredPrompt && !isInstalled,
    isInstalled,
    install,
    showManualInstall: showManualInstall && !deferredPrompt && !isInstalled,
    isIOSDevice: isIOS(),
  };
}

export function usePWAUpdate() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, registration) {
      if (registration) {
        setInterval(() => {
          registration.update();
        }, 5 * 60 * 1000);
      }
    },
  });

  const update = useCallback(() => {
    updateServiceWorker(true);
  }, [updateServiceWorker]);

  const dismiss = useCallback(() => {
    setNeedRefresh(false);
  }, [setNeedRefresh]);

  return { needRefresh, update, dismiss };
}
