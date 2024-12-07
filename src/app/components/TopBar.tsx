import React, { useState } from 'react';
import { Search, Settings, Menu, X } from 'lucide-react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className={`fixed top-0 left-0 right-0 ${themes[theme].topBar} border-b z-10`}>
      <div className="mx-auto px-4 py-3">
        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between">
          <LogoSection theme={theme} />
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
          <AuthButton />
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden">
          <div className="flex items-center justify-between">
            <LogoSection theme={theme} />
            <div className="flex items-center gap-2">
              <AuthButton />
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`p-2 rounded-lg ${themes[theme].buttonBg} ${themes[theme].buttonText}`}
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} pt-4 space-y-4`}>
            <SearchBar
              query={query}
              setQuery={setQuery}
              handleSearch={handleSearch}
              loading={loading}
              theme={theme}
              isMobile={true}
            />
            <div className="flex items-center gap-2">
              <VersionSelector
                versions={versions}
                selectedVersion={bibleId}
                onVersionSelect={(id) => {
                  onVersionSelect(id);
                  setIsMobileMenuOpen(false);
                }}
                onToggleFavorite={onToggleFavorite}
                theme={theme}
              />
              <SettingsButton onClick={onSettingsClick} theme={theme} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LogoSection: React.FC<{ theme: keyof typeof themes }> = ({ theme }) => (
  <div className="flex items-center">
    <span className={`ml-2 font-semibold ${themes[theme].text}`}>The Bible App</span>
  </div>
);

interface SearchBarProps extends Omit<TopBarProps, 'versions' | 'bibleId' | 'onVersionSelect' | 'onToggleFavorite' | 'onSettingsClick'> {
  isMobile?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  query,
  setQuery,
  handleSearch,
  loading,
  theme,
  isMobile = false
}) => (
  <div className={`relative flex gap-2 ${isMobile ? 'w-full' : 'w-96'}`}>
    <div className="relative flex-1">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        placeholder="Search (e.g., 'rv 21:1-4')"
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

const SettingsButton: React.FC<{ onClick: () => void; theme: keyof typeof themes }> = ({ onClick, theme }) => (
  <button
    onClick={onClick}
    className={`p-2 rounded-full transition-colors ${themes[theme].settingsButton} ${themes[theme].buttonText}`}
    aria-label="Open Settings"
  >
    <Settings className="h-5 w-5" />
  </button>
);

export default TopBar;