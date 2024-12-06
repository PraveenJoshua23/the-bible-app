import React from 'react';
import { Search, Settings } from 'lucide-react';
import { VersionSelector } from './VersionSelector';
import { BibleLookup } from './BibleLookup';
import { themes } from '../utils/themes';
import type { BibleVersionWithFavorite } from '../types/bible';
import { AuthButton } from './AuthButton';

interface TopBarProps {
  query: string;
  setQuery: (query: string) => void;
  handleSearch: () => void;
  loading: boolean;
  theme: keyof typeof themes;
  onSettingsClick: () => void;
  bibleId: string;
  versions: BibleVersionWithFavorite[];
  onVersionSelect: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  query,
  setQuery,
  handleSearch,
  loading,
  theme,
  onSettingsClick,
  bibleId,
  versions,
  onVersionSelect,
  onToggleFavorite
}) => {
  return (
    <div className={`fixed top-0 left-0 right-0 ${themes[theme].topBar} border-b z-10`}>
      <div className=" mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo Section */}
        <LogoSection theme={theme} />

        {/* Search and Controls Section */}
        <div className="flex items-center justify-center gap-3 flex-1 max-w-2xl mx-4">
          <SearchBar
            query={query}
            setQuery={setQuery}
            handleSearch={handleSearch}
            loading={loading}
            theme={theme}
          />

          <VersionSelector
            versions={versions}
            selectedVersion={bibleId}
            onVersionSelect={onVersionSelect}
            onToggleFavorite={onToggleFavorite}
            theme={theme}
          />

          <SettingsButton onClick={onSettingsClick} theme={theme} />
        </div>

        <div>
            <AuthButton />
        </div>
      </div>
    </div>
  );
};

// Sub-components
interface LogoSectionProps {
  theme: keyof typeof themes;
}

const LogoSection: React.FC<LogoSectionProps> = ({ theme }) => (
  <div className="flex items-center">
    <span className={`ml-2 font-semibold ${themes[theme].text}`}>The Bible App</span>
  </div>
);

interface SearchBarProps {
  query: string;
  setQuery: (query: string) => void;
  handleSearch: () => void;
  loading: boolean;
  theme: keyof typeof themes;
}

const SearchBar: React.FC<SearchBarProps> = ({
  query,
  setQuery,
  handleSearch,
  loading,
  theme
}) => (
  <div className="relative w-96 flex gap-2">
    <div className="relative flex-1">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        placeholder="Search (e.g., 'rv 21:1-4' or 'jn 3:16')"
        className={`w-full p-2 pr-10 border rounded-lg shadow-sm outline-none ${themes[theme].input}`}
      />
      <button
        onClick={handleSearch}
        className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors 
          ${themes[theme].buttonBg} ${themes[theme].buttonText}
          ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-opacity-80'}`}
        disabled={loading}
      >
        <Search className={`h-5 w-5 ${loading ? 'animate-pulse' : ''}`} />
      </button>
    </div>
    <BibleLookup 
      onSelect={(reference) => {
        setQuery(reference);
        handleSearch();
      }} 
      theme={theme}
    />
  </div>
);

interface SettingsButtonProps {
  onClick: () => void;
  theme: keyof typeof themes;
}

const SettingsButton: React.FC<SettingsButtonProps> = ({ onClick, theme }) => (
  <button
    onClick={onClick}
    className={`p-2 rounded-full transition-colors ${themes[theme].settingsButton} ${themes[theme].buttonText}`}
    aria-label="Open Settings"
  >
    <Settings className="h-5 w-5" />
  </button>
);

export default TopBar;