import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsContext = createContext();

const defaultSettings = {
  downMin: 0.5,
  downMax: 2.0,
  setMin: 0.3,
  setMax: 1.5,
  restBetweenMin: 2.0,
  restBetweenMax: 4.0,
  numberOfReps: 5,
  audioType: 'tts', // 'tts' or 'recorded'
  hasCustomVoice: false,
  hasCustomWhistle: false,
  // Custom sound file URIs
  customDownUri: null,
  customSetUri: null,
  customWhistleUri: null,
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from storage on app start
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('lacrosse_settings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsedSettings });
      }
    } catch (error) {
      console.log('Error loading settings:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      await AsyncStorage.setItem('lacrosse_settings', JSON.stringify(newSettings));
    } catch (error) {
      console.log('Error saving settings:', error);
    }
  };

  const updateSetting = (key, value) => {
    const newSettings = {
      ...settings,
      [key]: value
    };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const updateMultipleSettings = (updates) => {
    const newSettings = {
      ...settings,
      ...updates
    };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
    saveSettings(defaultSettings);
  };

  const getRandomDelay = (minKey, maxKey) => {
    const min = settings[minKey];
    const max = settings[maxKey];
    return Math.random() * (max - min) + min;
  };

  const value = {
    settings,
    isLoaded,
    updateSetting,
    updateMultipleSettings,
    resetToDefaults,
    getRandomDelay,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
