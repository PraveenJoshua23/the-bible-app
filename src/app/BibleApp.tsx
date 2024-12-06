"use client"

import React, { useCallback, useEffect, useState } from 'react'
import { TopBar } from './components/TopBar';
import { SettingsModal } from './components/SettingsModal';
import { BibleContent } from './components/BibleContent';
import { parseQuery } from './utils/bibleParser';
import { themes } from './utils/themes';
import type { BibleVersion, BiblePassage, Settings, BibleVersionWithFavorite } from './types/bible';
import { loadFavorites, saveFavorites } from './utils/favorites';
import { useAuth } from '@/contexts/AuthContext';

// Custom hook for debouncing values
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

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
              const response = await fetch('/api/bible/versions');
              if (!response.ok) return;
              
              const data = await response.json();
              const englishVersions = data.data
                  .filter((bible: BibleVersion) => bible.language.name === 'English')
                  .map((bible: BibleVersion) => ({
                      ...bible,
                      isFavorite: userPreferences?.favorites?.versions?.includes(bible.id) || false
                  }));
              
              setVersions(englishVersions);
          } catch (error) {
              console.error('Error fetching versions:', error);
          }
      };

      fetchVersions();
  }, [userPreferences]);

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

  useEffect(() => {
    const fetchVersions = async () => {
      try {
        const response = await fetch('/api/bible/versions');
        if (!response.ok) throw new Error(`Failed to fetch Bible versions: ${response.status}`);
        
        const data = await response.json();
        const favorites = loadFavorites();
        
        const englishVersions = data.data
          .filter((bible: BibleVersion) => bible.language.name === 'English')
          .map((bible: BibleVersion) => ({
            ...bible,
            isFavorite: favorites.includes(bible.id)
          }));
        
        setVersions(englishVersions.sort((a: { isFavorite: boolean; name: string; }, b: { isFavorite: boolean; name: string; }) => {
          if (a.isFavorite === b.isFavorite) return a.name.localeCompare(b.name);
          return a.isFavorite ? -1 : 1;
        }));
      } catch (err) {
        setError(`Failed to load Bible versions: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    };

    fetchVersions();
  }, []);

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

    if (isUserTyping) return; // Don't search while user is typing

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

      const response = await fetch(
        `/api/bible/passage?` + new URLSearchParams({
          bibleId,
          passageId,
          showVerseNumbers: settings.showVerseNumbers.toString()
        })
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch passage');
      }

      const data = await response.json();
      setResult(data.data);
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

