import React, { createContext, useState, useEffect } from 'react';
import audioEngine from '../utils/AudioEngine';

export const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const [audioSettings, setAudioSettings] = useState(() => {
    const saved = localStorage.getItem('investara_audio_settings');
    return saved ? JSON.parse(saved) : { enabled: true, volume: 0.5 };
  });

  useEffect(() => {
    audioEngine.setEnabled(audioSettings.enabled);
    audioEngine.setVolume(audioSettings.volume);
    localStorage.setItem('investara_audio_settings', JSON.stringify(audioSettings));
  }, [audioSettings]);

  const toggleAudio = () => {
    setAudioSettings(prev => ({ ...prev, enabled: !prev.enabled }));
  };

  const updateVolume = (val) => {
    setAudioSettings(prev => ({ ...prev, volume: val }));
  };

  const playBuySound = () => audioEngine.playBuy();
  const playSellSound = () => audioEngine.playSell();

  return (
    <AudioContext.Provider value={{ 
      audioSettings, 
      toggleAudio, 
      updateVolume, 
      playBuySound, 
      playSellSound 
    }}>
      {children}
    </AudioContext.Provider>
  );
};
