'use client';

import React, { useState, useEffect } from 'react';

interface SecurityNoticeProps {
  onClose?: () => void;
}

export default function SecurityNotice({ onClose }: SecurityNoticeProps) {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    // Check if user has already seen the notice
    const hasSeenNotice = localStorage.getItem('bsm_security_notice_seen');
    
    // FOR TESTING: Check if URL has ?showToast=true
    const urlParams = new URLSearchParams(window.location.search);
    const forceShow = urlParams.get('showToast') === 'true';
    
    if (!hasSeenNotice || forceShow) {
      // Show the toast after a short delay
      const timer = setTimeout(() => {
        setShow(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setShow(false);
    setDismissed(true);
    localStorage.setItem('bsm_security_notice_seen', 'true');
    onClose?.();
  };

  const handleLearnMore = () => {
    setExpanded(!expanded);
  };

  if (!show || dismissed) return null;

  return (
    <div className={`fixed top-20 right-4 md:top-24 md:right-6 z-[100] transition-all duration-500 ease-out max-w-[calc(100vw-2rem)] ${
      show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className={`bg-gradient-to-br from-gray-900 to-black border border-yellow-500/30 rounded-xl shadow-2xl shadow-yellow-500/10 transition-all duration-300 ${
        expanded ? 'w-full md:w-96' : 'w-full md:w-80'
      }`}>
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-yellow-600/5 rounded-xl pointer-events-none"></div>
        
        {/* Main content */}
        <div className="relative p-4">
          <div className="flex items-start gap-3 mb-3">
            {/* Icon */}
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-white mb-1">
                Your Security Matters 🔒
              </h4>
              <p className="text-xs text-gray-300 leading-relaxed">
                Worried about phishing? We get it. Try BSM with an empty wallet - it's <span className="text-yellow-400 font-semibold">100% free, no fees</span>.
              </p>
            </div>

            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Expanded content */}
          <div className={`overflow-hidden transition-all duration-300 ${
            expanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <div className="space-y-2 mb-3 pt-2 border-t border-gray-800">
              <div className="flex items-center gap-2">
                <svg className="w-3 h-3 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-xs text-gray-300">End-to-end encrypted messages</p>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-3 h-3 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-xs text-gray-300">No sign-ups or personal data</p>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-3 h-3 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-xs text-gray-300">We never ask for private keys</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleLearnMore}
              className="flex-1 text-xs text-yellow-400 hover:text-yellow-300 font-medium transition-colors"
            >
              {expanded ? 'Show Less' : 'Learn More'}
            </button>
            <button
              onClick={handleDismiss}
              className="flex-1 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-xs font-medium px-3 py-2 rounded-lg transition-all duration-300"
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

