import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SiteSettings {
  siteTitle: string;
  siteDescription: string;
  contactEmail: string;
  youtubeUrl: string;
  vkUrl: string;
  telegramUrl: string;
}

interface SettingsContextType {
  settings: SiteSettings;
  updateSettings: (newSettings: Partial<SiteSettings>) => void;
  loading: boolean;
}

const defaultSettings: SiteSettings = {
  siteTitle: 'BlogPro',
  siteDescription: '',
  contactEmail: '',
  youtubeUrl: '',
  vkUrl: '',
  telegramUrl: ''
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(false);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setSettings({
          siteTitle: data.siteTitle || defaultSettings.siteTitle,
          siteDescription: data.siteDescription || defaultSettings.siteDescription,
          contactEmail: data.contactEmail || defaultSettings.contactEmail,
          youtubeUrl: data.youtubeUrl || defaultSettings.youtubeUrl,
          vkUrl: data.vkUrl || defaultSettings.vkUrl,
          telegramUrl: data.telegramUrl || defaultSettings.telegramUrl
        });
      } else {
        // Use default settings if API fails
        setSettings(defaultSettings);
      }
    } catch (error) {
      // Silent error handling - use default settings
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = (newSettings: Partial<SiteSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  useEffect(() => {
    // Defer settings loading to not block initial render
    const timer = setTimeout(() => {
      loadSettings();
    }, 50);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};
