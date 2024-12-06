'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { themes, fonts, fontSizes } from '../utils/themes';
import type { Settings } from '../types/bible';
import { db } from '@/lib/firebase/config';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    settings: Settings;
    onSettingsChange: (settings: Settings) => void;
    theme: keyof typeof themes;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
    isOpen,
    onClose,
    settings,
    onSettingsChange,
    theme
}) => {
    const { user, userPreferences } = useAuth();

    // Load settings from Firestore on init
    useEffect(() => {
        if (userPreferences?.settings) {
            onSettingsChange(userPreferences.settings);
        }
    }, [userPreferences, onSettingsChange]);

    // Generic setting update handler
    const updateSetting = async <K extends keyof Settings>(
        key: K,
        value: Settings[K]
    ) => {
        const newSettings = {
            ...settings,
            [key]: value
        };
        
        onSettingsChange(newSettings);

        // Update Firestore if user is logged in
        if (user) {
            try {
                if (!db) {
                    throw new Error('Firestore instance is not initialized');
                  }
                const userRef = doc(db, 'users', user.uid);
                await updateDoc(userRef, {
                    'settings': newSettings
                });
            } catch (error) {
                console.error('Error updating settings:', error);
            }
        }
    };
    // Handle escape key press
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose]);
    
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-title"
        >
            <div 
                className={`
                    ${themes[theme].modalBg} rounded-lg shadow-lg 
                    max-w-md w-full mx-4 p-6 space-y-6
                `}
            >
                <ModalHeader onClose={onClose} theme={theme} />
                
                <div className="space-y-6">
                    <TextSizeSection
                        currentSize={settings.fontSize}
                        onSizeChange={(size) => updateSetting('fontSize', size)}
                        theme={theme}
                    />

                    <FontStyleSection
                        currentFont={settings.font}
                        onFontChange={(font) => updateSetting('font', font)}
                        theme={theme}
                    />

                    <ThemeSection
                        currentTheme={settings.theme}
                        onThemeChange={(newTheme) => updateSetting('theme', newTheme)}
                        theme={theme}
                    />

                    <VerseDisplaySection
                        currentDisplay={settings.verseDisplay}
                        onDisplayChange={(display) => updateSetting('verseDisplay', display)}
                        theme={theme}
                    />

                    <VerseNumbersToggle
                        showNumbers={settings.showVerseNumbers}
                        onToggle={(show) => updateSetting('showVerseNumbers', show)}
                        theme={theme}
                    />
                </div>
            </div>
        </div>
    );
};

// Sub-components
const ModalHeader: React.FC<{ onClose: () => void; theme: keyof typeof themes }> = ({ onClose, theme }) => (
    <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold" id="settings-title">Settings</h3>
        <button 
            onClick={onClose}
            className={`${themes[theme].buttonText} p-1 rounded-lg hover:bg-opacity-10 hover:bg-gray-500
                transition-colors duration-200`}
            aria-label="Close settings"
        >
            <X className="h-5 w-5" />
        </button>
    </div>
);

interface SettingSectionProps {
    title: string;
    children: React.ReactNode;
}

const SettingSection: React.FC<SettingSectionProps> = ({ title, children }) => (
    <div className="space-y-2">
        <h4 className="font-medium">{title}</h4>
        {children}
    </div>
);

interface OptionButtonProps {
    selected: boolean;
    onClick: () => void;
    theme: keyof typeof themes;
    className?: string;
    children: React.ReactNode;
}

const OptionButton: React.FC<OptionButtonProps> = ({
    selected,
    onClick,
    theme,
    className = '',
    children
}) => (
    <button
        onClick={onClick}
        className={`
            p-2 border rounded transition-colors duration-200
            ${selected ? themes[theme].activeButton : `${themes[theme].buttonBg} ${themes[theme].buttonText}`}
            ${className}
        `}
    >
        {children}
    </button>
);

// Setting Sections
interface TextSizeSectionProps {
    currentSize: Settings['fontSize'];
    onSizeChange: (size: Settings['fontSize']) => void;
    theme: keyof typeof themes;
}

const TextSizeSection: React.FC<TextSizeSectionProps> = ({ currentSize, onSizeChange, theme }) => (
    <SettingSection title="Text Size">
        <div className="grid grid-cols-4 gap-2">
            {(['small', 'medium', 'large', 'xl'] as const).map((size) => (
                <OptionButton
                    key={size}
                    selected={currentSize === size}
                    onClick={() => onSizeChange(size)}
                    theme={theme}
                >
                    <span className={fontSizes[size]}>Aa</span>
                </OptionButton>
            ))}
        </div>
    </SettingSection>
);

interface FontStyleSectionProps {
    currentFont: Settings['font'];
    onFontChange: (font: Settings['font']) => void;
    theme: keyof typeof themes;
}

const FontStyleSection: React.FC<FontStyleSectionProps> = ({ currentFont, onFontChange, theme }) => (
    <SettingSection title="Font Style">
        <div className="grid grid-cols-3 gap-2">
            {(['sans', 'serif', 'script'] as const).map((font) => (
                <OptionButton
                    key={font}
                    selected={currentFont === font}
                    onClick={() => onFontChange(font)}
                    theme={theme}
                    className={fonts[font]}
                >
                    Sample
                </OptionButton>
            ))}
        </div>
    </SettingSection>
);

interface ThemeSectionProps {
    currentTheme: Settings['theme'];
    onThemeChange: (theme: Settings['theme']) => void;
    theme: keyof typeof themes;
}

const ThemeSection: React.FC<ThemeSectionProps> = ({ currentTheme, onThemeChange, theme }) => (
    <SettingSection title="Theme">
        <div className="grid grid-cols-3 gap-2">
            {(['light', 'dark', 'cream'] as const).map((themeOption) => (
                <OptionButton
                    key={themeOption}
                    selected={currentTheme === themeOption}
                    onClick={() => onThemeChange(themeOption)}
                    theme={theme}
                >
                    {themeOption.charAt(0).toUpperCase() + themeOption.slice(1)}
                </OptionButton>
            ))}
        </div>
    </SettingSection>
);

interface VerseDisplaySectionProps {
    currentDisplay: Settings['verseDisplay'];
    onDisplayChange: (display: Settings['verseDisplay']) => void;
    theme: keyof typeof themes;
}

const VerseDisplaySection: React.FC<VerseDisplaySectionProps> = ({
    currentDisplay,
    onDisplayChange,
    theme
}) => (
    <SettingSection title="Verse Display">
        <div className="grid grid-cols-2 gap-2">
            {(['paragraph', 'list'] as const).map((display) => (
                <OptionButton
                    key={display}
                    selected={currentDisplay === display}
                    onClick={() => onDisplayChange(display)}
                    theme={theme}
                >
                    {display.charAt(0).toUpperCase() + display.slice(1)}
                </OptionButton>
            ))}
        </div>
    </SettingSection>
);

interface VerseNumbersToggleProps {
    showNumbers: boolean;
    onToggle: (show: boolean) => void;
    theme: keyof typeof themes;
}

const VerseNumbersToggle: React.FC<VerseNumbersToggleProps> = ({ showNumbers, onToggle, theme }) => (
    <div className="flex items-center gap-3">
        <label className={`flex items-center gap-2 cursor-pointer ${themes[theme].buttonText}`}>
            <input
                type="checkbox"
                checked={showNumbers}
                onChange={(e) => onToggle(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Show verse numbers</span>
        </label>
    </div>
);
