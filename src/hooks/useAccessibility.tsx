import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

type FontSize = 'small' | 'normal' | 'large';

interface AccessibilitySettings {
  fontSize: FontSize;
}

interface AccessibilityContextValue {
  settings: AccessibilitySettings;
  setFontSize: (size: FontSize) => void;
}

const defaultSettings: AccessibilitySettings = {
  fontSize: 'normal',
};

const AccessibilityContext = createContext<AccessibilityContextValue | undefined>(undefined);

const STORAGE_KEY = 'accessibility-settings';

// Font size multipliers (applied to root html element)
const fontSizeMap: Record<FontSize, { mobile: number; desktop: number }> = {
  small: { mobile: 13, desktop: 15 },
  normal: { mobile: 14, desktop: 16 },
  large: { mobile: 16, desktop: 18 },
};

// Helper to apply font size immediately (used both on init and in effect)
function applyFontSize(fontSize: FontSize) {
  const { mobile, desktop } = fontSizeMap[fontSize];
  
  let styleEl = document.getElementById('accessibility-font-size');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'accessibility-font-size';
    document.head.appendChild(styleEl);
  }
  
  styleEl.textContent = `
    html { font-size: ${mobile}px; }
    @media (min-width: 768px) { html { font-size: ${desktop}px; } }
  `;
}

// Get stored settings (used for immediate application)
function getStoredSettings(): AccessibilitySettings {
  if (typeof window === 'undefined') return defaultSettings;
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return { ...defaultSettings, ...JSON.parse(stored) };
    } catch {
      return defaultSettings;
    }
  }
  return defaultSettings;
}

// Apply font size immediately on script load (before React renders)
if (typeof window !== 'undefined') {
  const initialSettings = getStoredSettings();
  applyFontSize(initialSettings.fontSize);
}

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(getStoredSettings);

  // Apply font size when settings change
  useEffect(() => {
    applyFontSize(settings.fontSize);
  }, [settings.fontSize]);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const setFontSize = (fontSize: FontSize) => {
    setSettings(prev => ({ ...prev, fontSize }));
  };

  return (
    <AccessibilityContext.Provider value={{ settings, setFontSize }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}

export const fontSizeOptions: { value: FontSize; label: string }[] = [
  { value: 'small', label: 'Small' },
  { value: 'normal', label: 'Normal' },
  { value: 'large', label: 'Large' },
];
