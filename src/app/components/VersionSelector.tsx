'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Star, StarOff, ChevronDown } from 'lucide-react';
import { themes } from '../utils/themes';
import type { BibleVersionWithFavorite } from '../types/bible';

interface VersionSelectorProps {
    versions: BibleVersionWithFavorite[];
    selectedVersion: string;
    onVersionSelect: (id: string) => void;
    onToggleFavorite: (id: string) => void;
    theme: keyof typeof themes;
}

export const VersionSelector: React.FC<VersionSelectorProps> = ({
    versions = [], // Provide default empty array
    selectedVersion,
    onVersionSelect,
    onToggleFavorite,
    theme
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Find selected version data with null check
    const selectedVersionData = Array.isArray(versions) 
        ? versions.find(v => v.id === selectedVersion)
        : undefined;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    px-4 py-2 rounded-lg border shadow-sm flex items-center gap-2 
                    min-w-[120px] justify-between transition-colors
                    ${themes[theme].buttonBg} ${themes[theme].buttonText}
                    ${isOpen ? themes[theme].activeBg : ''}
                `}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-label="Select Bible version"
            >
                <span className="truncate">
                    {selectedVersionData?.abbreviation || 'Select Version'}
                </span>
                <ChevronDown 
                    className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && Array.isArray(versions) && versions.length > 0 && (
                <div 
                    className={`
                        absolute right-0 mt-2 w-64 rounded-lg shadow-lg border 
                        ${themes[theme].dropdownBg} ${themes[theme].text}
                        max-h-[400px] overflow-y-auto z-50
                    `}
                    role="listbox"
                    aria-label="Bible versions list"
                >
                    <div className="p-2">
                        <SearchVersions 
                            versions={versions}
                            theme={theme}
                            onVersionSelect={onVersionSelect}
                            onToggleFavorite={onToggleFavorite}
                            selectedVersion={selectedVersion}
                            closeDropdown={() => setIsOpen(false)}
                        />
                    </div>
                </div>
            )}

            {isOpen && (!Array.isArray(versions) || versions.length === 0) && (
                <div 
                    className={`
                        absolute right-0 mt-2 w-64 rounded-lg shadow-lg border 
                        ${themes[theme].dropdownBg} ${themes[theme].text}
                        p-4 text-center
                    `}
                >
                    Loading versions...
                </div>
            )}
        </div>
    );
};

// SearchVersions component remains the same
interface SearchVersionsProps {
    versions: BibleVersionWithFavorite[];
    theme: keyof typeof themes;
    onVersionSelect: (id: string) => void;
    onToggleFavorite: (id: string) => void;
    selectedVersion: string;
    closeDropdown: () => void;
}

const SearchVersions: React.FC<SearchVersionsProps> = ({
    versions,
    theme,
    onVersionSelect,
    onToggleFavorite,
    selectedVersion,
    closeDropdown
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    
    const filteredVersions = versions.filter(version => 
        version.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        version.abbreviation.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div>
            <input
                type="text"
                placeholder="Search versions..."
                className={`
                    w-full p-2 mb-2 rounded-md border 
                    ${themes[theme].input} text-sm
                `}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            
            {filteredVersions.length === 0 ? (
                <div className="text-center py-4 text-sm opacity-70">
                    No versions found
                </div>
            ) : (
                <div className="space-y-1">
                    {filteredVersions.map((version) => (
                        <VersionOption
                            key={version.id}
                            version={version}
                            theme={theme}
                            isSelected={version.id === selectedVersion}
                            onSelect={() => {
                                onVersionSelect(version.id);
                                closeDropdown();
                            }}
                            onToggleFavorite={() => onToggleFavorite(version.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

// VersionOption component remains the same
interface VersionOptionProps {
    version: BibleVersionWithFavorite;
    theme: keyof typeof themes;
    isSelected: boolean;
    onSelect: () => void;
    onToggleFavorite: () => void;
}

const VersionOption: React.FC<VersionOptionProps> = ({
    version,
    theme,
    isSelected,
    onSelect,
    onToggleFavorite
}) => (
    <div
        className={`
            flex items-center justify-between px-3 py-2 rounded-md
            ${themes[theme].dropdownHover}
            ${isSelected ? themes[theme].activeBg : ''}
            ${version.isFavorite ? 'border-l-4 border-yellow-500' : ''}
        `}
        role="option"
        aria-selected={isSelected}
        data-version-id={version.id}
        tabIndex={0}
        onClick={onSelect}
    >
        <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
                <span className="font-medium truncate">
                    {version.abbreviation}
                </span>
                {isSelected && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500 text-white">
                        Selected
                    </span>
                )}
            </div>
            <div className="text-sm opacity-70 truncate">
                {version.name}
            </div>
        </div>

        <button
            onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
            }}
            className={`
                ml-2 p-1 rounded-full hover:bg-opacity-20
                ${themes[theme].buttonBg}
            `}
            aria-label={`${version.isFavorite ? 'Remove from' : 'Add to'} favorites`}
        >
            {version.isFavorite ? (
                <Star className="h-4 w-4 text-yellow-500" fill="currentColor" />
            ) : (
                <StarOff className="h-4 w-4" />
            )}
        </button>
    </div>
);

export default VersionSelector;