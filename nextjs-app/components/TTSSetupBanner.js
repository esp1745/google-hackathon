import { useState } from 'react';

export default function TTSSetupBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed || !isVisible) return null;

  return (
    <div className="glass-card rounded-2xl p-5 mb-6 border-l-4 border-blue-400">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
            <strong className="font-medium">First-time setup required:</strong> Enable Google Cloud Text-to-Speech API for premium voices.
          </p>
          <div className="mt-2 text-sm" style={{ color: 'rgba(255, 255, 255, 0.75)' }}>
            <ol className="list-decimal list-inside space-y-1">
              <li>Click the button below to open the Google Cloud Console</li>
              <li>Click the blue "Enable" button</li>
              <li>Wait 1-2 minutes for the API to activate</li>
              <li>Refresh this page and try the voice features</li>
            </ol>
          </div>
          <div className="mt-3 flex gap-2">
            <a
              href="https://console.developers.google.com/apis/api/texttospeech.googleapis.com/overview"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Enable Text-to-Speech API
            </a>
            <button
              onClick={() => setIsDismissed(true)}
              className="px-4 py-2 text-sm font-medium rounded-lg transition-all border border-white/20 hover:bg-white/10"
              style={{ color: 'rgba(255, 255, 255, 0.8)' }}
            >
              I've already enabled it
            </button>
          </div>
        </div>
        <div className="ml-auto pl-3">
          <button
            onClick={() => setIsVisible(false)}
            className="inline-flex text-gray-400 hover:text-gray-300"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
