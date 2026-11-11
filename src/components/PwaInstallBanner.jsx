import React, { useState } from 'react';
import { usePwa } from '../context/PwaContext.jsx';
import { Download, X, Smartphone } from 'lucide-react';

export default function PwaInstallBanner() {
  const { isInstallable, installPwa, isStandalone } = usePwa();
  const [isDismissed, setIsDismissed] = useState(false);

  if (isStandalone || isDismissed) return null;

  return (
    <div className="bg-gradient-to-r from-navy-800 to-brand-blue text-white px-4 py-3 shadow-md flex items-center justify-between transition-all">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white/10 rounded-xl">
          <Smartphone className="w-5 h-5 text-amber-300" />
        </div>
        <div>
          <p className="text-sm font-semibold flex items-center gap-2">
            Install UniLife PWA
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Free</span>
          </p>
          <p className="text-xs text-blue-100 hidden sm:block">
            Install on your phone or desktop for quick access, offline shell support, and instant study alerts.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={installPwa}
          className="px-3.5 py-1.5 rounded-lg bg-white text-navy-800 text-xs font-semibold hover:bg-slate-100 active:scale-95 transition-all flex items-center gap-1.5 shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install Now</span>
        </button>
        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
