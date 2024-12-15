"use client"

import React, { useCallback, useEffect, useState } from 'react'
import { TopBar } from './components/TopBar';
import { SettingsModal } from './components/SettingsModal';
import { BibleContent } from './components/BibleContent';
import { parseQuery } from './utils/bibleParser';
import { themes } from './utils/themes';
import type {  BiblePassage, Settings, BibleVersionWithFavorite } from './types/bible';
import {  saveFavorites } from './utils/favorites';
import { useAuth } from '@/contexts/AuthContext';
import { getBibleVersions, getBiblePassage } from '@/app/services/bibleService';

// Custom hook for debouncing values
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

// Allowed English versions
const ALLOWED_VERSIONS = new Set(['ASV', 'NKJV', 'FSV', 'BSB', 'TAOVBSI']);

// Supported languages with their exact API language codes
const SUPPORTED_LANGUAGES = new Set([
  'English',
  'Tamil',
  'Telugu',
  'Hindi',
  'Odia',
  'Korean'
]);

const BibleApp = () => {
  const [query, setQuery] = useState('jn 1:1');
  const [bibleId, setBibleId] = useState('de4e12af7f28f599-02');
  const [versions, setVersions] = useState<BibleVersionWithFavorite[]>([]);
  const [result, setResult] = useState<BiblePassage | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isUserTyping, setIsUserTyping] = useState(false);
  const { userPreferences } = useAuth();
  const [settings, setSettings] = useState<Settings>(() => 
    userPreferences?.settings || {
      showVerseNumbers: true,
      font: 'sans',
      theme: 'light',
      verseDisplay: 'paragraph',
      fontSize: 'medium'
    });

    useEffect(() => {
      const fetchVersions = async () => {
        try {
          setLoading(true);
          const versions = await getBibleVersions();
          const userFavorites = userPreferences?.favorites?.versions || [];
          
          // Filter and process versions
          const filteredVersions = versions.filter((bible) => {
            const langCode = bible.language?.name || '';
      
            // Include Tamil Bible explicitly
            if (bible.id === 'TAOVBSI') return true;
      
            // For English versions, only include allowed versions
            if (langCode === 'English') {
              return ALLOWED_VERSIONS.has(bible.abbreviation);
            }
      
            // Include all versions for supported languages
            return SUPPORTED_LANGUAGES.has(langCode);
          });
      
      
          // Sort versions
          const sortedVersions = filteredVersions.map(version => ({
            ...version,
            isFavorite: userFavorites.includes(version.id)
          })).sort((a, b) => {
            // English versions first
            if (a.language.name === 'English' && b.language.name !== 'English') return -1;
            if (a.language.name !== 'English' && b.language.name === 'English') return 1;
            
            // Then by language
            if (a.language.name !== b.language.name) {
              return a.language.name.localeCompare(b.language.name);
            }
            
            // Then by favorite status
            if (a.isFavorite !== b.isFavorite) {
              return a.isFavorite ? -1 : 1;
            }
            
            // Finally by name
            return a.name.localeCompare(b.name);
          });
      
          setVersions(sortedVersions);
        } catch (err) {
          console.error('Version fetching error:', err);
          setError('Failed to load Bible versions');
        } finally {
          setLoading(false);
        }
      };
  
      fetchVersions();
    }, [userPreferences?.favorites?.versions]);

    useEffect(() => {
      if (userPreferences?.settings) {
        setSettings(userPreferences.settings);
      }
    }, [userPreferences]);

  // Debounce the query to prevent excessive API calls
  const debouncedQuery = useDebounce(query, 800);

  // Handle query changes with typing indication
  const handleQueryChange = (newQuery: string) => {
    setQuery(newQuery);
    setIsUserTyping(true);
    setError(''); // Clear errors while typing
  };

  // Reset typing state when debounced query updates
  useEffect(() => {
    setIsUserTyping(false);
  }, [debouncedQuery]);

  const toggleFavorite = (versionId: string) => {
    setVersions(prevVersions => {
      const updated = prevVersions.map(v => ({
        ...v,
        isFavorite: v.id === versionId ? !v.isFavorite : v.isFavorite
      }));

      // Save favorites and sort
      saveFavorites(updated.filter(v => v.isFavorite).map(v => v.id));
      return updated.sort((a, b) => {
        if (a.isFavorite === b.isFavorite) return a.name.localeCompare(b.name);
        return a.isFavorite ? -1 : 1;
      });
    });
  };

  const handleSearch = useCallback(async () => {
    if (!bibleId) {
      setError('Please wait for Bible versions to load');
      return;
    }

    if (isUserTyping) return;

    setLoading(true);
    setError('');
    
    try {
      const parsed = parseQuery(query);
      if (!parsed) throw new Error('Invalid search format');

      const passageId = parsed.verseStart && parsed.verseEnd && parsed.verseEnd !== parsed.verseStart
        ? `${parsed.book}.${parsed.chapter}.${parsed.verseStart}-${parsed.book}.${parsed.chapter}.${parsed.verseEnd}`
        : parsed.verseStart
          ? `${parsed.book}.${parsed.chapter}.${parsed.verseStart}`
          : `${parsed.book}.${parsed.chapter}`;

      const response = await getBiblePassage(
        bibleId,
        passageId,
        settings.showVerseNumbers
      );

      setResult(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch passage');
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, [bibleId, query, settings.showVerseNumbers, isUserTyping]);

  useEffect(() => {
    if (bibleId && versions.length > 0 && debouncedQuery) {
      handleSearch();
    }
  }, [debouncedQuery, bibleId, versions.length, handleSearch]);

  return (
    <div className={`min-h-screen ${themes[settings.theme].bg} ${themes[settings.theme].text} transition-colors duration-200`}>
      <TopBar
        query={query}
        setQuery={handleQueryChange}
        handleSearch={handleSearch}
        loading={loading}
        theme={settings.theme}
        onSettingsClick={() => setIsSettingsOpen(true)}
        bibleId={bibleId}
        versions={versions}
        onVersionSelect={setBibleId}
        onToggleFavorite={toggleFavorite}
      />
      
      <BibleContent
        result={result}
        loading={loading}
        error={error}
        settings={settings}
        theme={settings.theme}
        query={query}
      />
      
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSettingsChange={setSettings}
        theme={settings.theme}
      />
    </div>
  );
};

export default BibleApp;

