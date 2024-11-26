"use client"

import React, { useCallback, useEffect, useState } from 'react'
import { TopBar } from './components/TopBar';
import { SettingsModal } from './components/SettingsModal';
import { BibleContent } from './components/BibleContent';
import { parseQuery } from './utils/bibleParser';
import { themes } from './utils/themes';
import type { BibleVersion, BiblePassage, Settings, BibleVersionWithFavorite } from './types/bible';
import { loadFavorites, saveFavorites } from './utils/favorites';


const BibleApp = () => {
  const [query, setQuery] = useState('jn 1:1');
  const [bibleId, setBibleId] = useState('de4e12af7f28f599-02');
  const [versions, setVersions] = useState<BibleVersionWithFavorite[]>([]);
  const [result, setResult] = useState<BiblePassage | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>({
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
          
          if (!response.ok) {
              throw new Error(`Failed to fetch Bible versions: ${response.status}`);
          }
          
          const data = await response.json();
          const favorites = loadFavorites();
          
          const englishVersions = data.data
              .filter((bible: BibleVersion) => bible.language.name === 'English')
              .map((bible: BibleVersion) => ({
                  ...bible,
                  isFavorite: favorites.includes(bible.id)
              }));
          
          const sortedVersions = englishVersions.sort((a: { isFavorite: boolean; name: string }, b: { isFavorite: boolean; name: string }) => {
              if (a.isFavorite === b.isFavorite) {
                  return a.name.localeCompare(b.name);
              }
              return a.isFavorite ? -1 : 1;
          });
          
          setVersions(sortedVersions);
      } catch (err) {
          setError(`Failed to load Bible versions: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
  };

  fetchVersions();
}, []);

const toggleFavorite = (versionId: string) => {
  const updatedVersions = versions.map(v => {
      if (v.id === versionId) {
          return { ...v, isFavorite: !v.isFavorite };
      }
      return v;
  });

  // Update localStorage
  const favorites = updatedVersions
      .filter(v => v.isFavorite)
      .map(v => v.id);
  saveFavorites(favorites);

  // Sort versions with favorites at the top
  const sortedVersions = updatedVersions.sort((a, b) => {
      if (a.isFavorite === b.isFavorite) {
          return a.name.localeCompare(b.name);
      }
      return a.isFavorite ? -1 : 1;
  });

  setVersions(sortedVersions);
};

// Update handleSearch function
const handleSearch = useCallback(async () => {
  if (!bibleId) {
      setError('Please wait for Bible versions to load');
      return;
  }

  setLoading(true);
  setError('');
  
  try {
      const parsed = parseQuery(query);
      if (!parsed) {
          throw new Error('Invalid search format');
      }

      // Construct the passage ID
      let passageId;
      if (parsed.verseStart && parsed.verseEnd && parsed.verseEnd !== parsed.verseStart) {
          passageId = `${parsed.book}.${parsed.chapter}.${parsed.verseStart}-${parsed.book}.${parsed.chapter}.${parsed.verseEnd}`;
      } else if (parsed.verseStart) {
          passageId = `${parsed.book}.${parsed.chapter}.${parsed.verseStart}`;
      } else {
          passageId = `${parsed.book}.${parsed.chapter}`;
      }

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
      console.error('Search error:', err);
  } finally {
      setLoading(false);
  }
}, [bibleId, query, settings.showVerseNumbers]);




// Don't auto-search until we have a valid Bible ID
useEffect(() => {
    if (bibleId && versions.length > 0) {
        handleSearch()
    }
}, [bibleId, versions.length, handleSearch])


return (
  <div className={`min-h-screen ${themes[settings.theme].bg} ${themes[settings.theme].text} transition-colors duration-200`}>
      <TopBar
          query={query}
          setQuery={setQuery}
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

export default BibleApp