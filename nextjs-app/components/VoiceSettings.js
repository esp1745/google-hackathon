import { useState, useEffect } from 'react';

const GOOGLE_VOICES = [
  { name: 'en-US-Neural2-F', label: 'US Female (Neural)', lang: 'en-US', type: 'Neural2' },
  { name: 'en-US-Neural2-D', label: 'US Male (Neural)', lang: 'en-US', type: 'Neural2' },
  { name: 'en-US-Neural2-A', label: 'US Male Alt (Neural)', lang: 'en-US', type: 'Neural2' },
  { name: 'en-US-Neural2-C', label: 'US Female Alt (Neural)', lang: 'en-US', type: 'Neural2' },
  { name: 'en-GB-Neural2-A', label: 'UK Female (Neural)', lang: 'en-GB', type: 'Neural2' },
  { name: 'en-GB-Neural2-B', label: 'UK Male (Neural)', lang: 'en-GB', type: 'Neural2' },
  { name: 'en-AU-Neural2-A', label: 'Australian Female (Neural)', lang: 'en-AU', type: 'Neural2' },
  { name: 'en-AU-Neural2-B', label: 'Australian Male (Neural)', lang: 'en-AU', type: 'Neural2' },
  { name: 'en-US-Studio-O', label: 'US Female (Studio)', lang: 'en-US', type: 'Studio' },
  { name: 'en-US-Studio-Q', label: 'US Male (Studio)', lang: 'en-US', type: 'Studio' },
];

export default function VoiceSettings({ onSettingsChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState({
    voice: GOOGLE_VOICES[0].name,
    languageCode: GOOGLE_VOICES[0].lang,
    rate: 1.0,
    pitch: 0,
    volume: 1
  });

  useEffect(() => {
    if (onSettingsChange) {
      onSettingsChange(settings);
    }
  }, [settings, onSettingsChange]);

  const handleSettingChange = (key, value) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      
      // Update language code when voice changes
      if (key === 'voice') {
        const selectedVoice = GOOGLE_VOICES.find(v => v.name === value);
        if (selectedVoice) {
          newSettings.languageCode = selectedVoice.lang;
        }
      }
      
      return newSettings;
    });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        title="Voice Settings"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
        </svg>
        Voice Settings
        <span className="text-xs bg-primary text-white px-2 py-0.5 rounded">Premium</span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Google Cloud TTS</h3>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Neural Voices</span>
            </div>
            
            <div className="space-y-4">
              {/* Voice Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Voice
                </label>
                <select
                  value={settings.voice}
                  onChange={(e) => handleSettingChange('voice', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {GOOGLE_VOICES.map((voice) => (
                    <option key={voice.name} value={voice.name}>
                      {voice.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Professional AI voices powered by Google
                </p>
              </div>

              {/* Speed */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Speed: {settings.rate.toFixed(1)}x
                </label>
                <input
                  type="range"
                  min="0.25"
                  max="4.0"
                  step="0.25"
                  value={settings.rate}
                  onChange={(e) => handleSettingChange('rate', parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0.25x</span>
                  <span>4.0x</span>
                </div>
              </div>

              {/* Pitch */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pitch: {settings.pitch > 0 ? '+' : ''}{settings.pitch.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="-20"
                  max="20"
                  step="1"
                  value={settings.pitch}
                  onChange={(e) => handleSettingChange('pitch', parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Lower</span>
                  <span>Higher</span>
                </div>
              </div>

              {/* Volume */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Volume: {Math.round(settings.volume * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.volume}
                  onChange={(e) => handleSettingChange('volume', parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Reset Button */}
              <button
                onClick={() => {
                  setSettings({
                    voice: GOOGLE_VOICES[0].name,
                    languageCode: GOOGLE_VOICES[0].lang,
                    rate: 1.0,
                    pitch: 0,
                    volume: 1
                  });
                }}
                className="w-full px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Reset to Defaults
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
