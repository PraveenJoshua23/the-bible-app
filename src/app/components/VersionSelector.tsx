'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Star, StarOff, ChevronDown } from 'lucide-react';
import { themes } from '../utils/themes';
import type { BibleVersionWithFavorite } from '../types/bible';
import { useAuth } from '@/contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

interface VersionSelectorProps {
    versions: BibleVersionWithFavorite[];
    selectedVersion: string;
    onVersionSelect: (id: string) => void;
    onToggleFavorite: (id: string) => void;
    theme: keyof typeof themes;
}

export const VersionSelector: React.FC<VersionSelectorProps> = ({
    versions = [],
    selectedVersion,
    onVersionSelect,
    onToggleFavorite,
    theme
}) => {
    const { user, userPreferences } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768); // md breakpoint
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            // Prevent body scroll on mobile when dropdown is open
            if (isMobile) {
                document.body.style.overflow = 'hidden';
            }
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            if (isMobile) {
                document.body.style.overflow = '';
            }
        };
    }, [isOpen, isMobile]);

    const handleToggleFavorite = async (versionId: string) => {
        if (!user) {
            onToggleFavorite(versionId);
            return;
        }

        try {
            if (!db) {
                throw new Error('Firestore instance is not initialized');
            }
            const userRef = doc(db, 'users', user.uid);
            const currentFavorites = userPreferences?.favorites?.versions || [];
            const updatedFavorites = currentFavorites.includes(versionId)
                ? currentFavorites.filter(id => id !== versionId)
                : [...currentFavorites, versionId];

            await updateDoc(userRef, {
                'favorites.versions': updatedFavorites
            });

            onToggleFavorite(versionId);
        } catch (error) {
            console.error('Error updating favorites:', error);
        }
    };

    const selectedVersionData = versions.find(v => v.id === selectedVersion);

    return (
        <div className="relative flex-1 md:flex-none" ref={dropdownRef}>
            <button
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    w-full md:w-auto px-4 py-2 rounded-lg border shadow-sm 
                    flex items-center gap-2 justify-between transition-colors
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

            {isOpen && (
                <>
                    {isMobile && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" />
                    )}
                    <div 
                        className={`
                            ${isMobile 
                                ? 'fixed inset-x-0 bottom-0 rounded-t-lg max-h-[80vh] z-50' 
                                : 'absolute right-0 mt-2 w-64 rounded-lg'}
                            ${themes[theme].dropdownBg} ${themes[theme].text}
                            shadow-lg border overflow-hidden
                        `}
                    >
                        <div className="max-h-[60vh] overflow-y-auto">
                            <div className="p-4">
                                <SearchVersions 
                                    versions={versions}
                                    theme={theme}
                                    onVersionSelect={(id) => {
                                        onVersionSelect(id);
                                        setIsOpen(false);
                                    }}

                                    onToggleFavorite={onToggleFavorite}
                                    handleToggleFavorite={handleToggleFavorite}
                                    selectedVersion={selectedVersion}
                                    closeDropdown={() => setIsOpen(false)}
                                    searchQuery={searchQuery}         
                                    setSearchQuery={setSearchQuery}  
                                />
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

interface SearchVersionsProps {
    versions: BibleVersionWithFavorite[];
    theme: keyof typeof themes;
    onVersionSelect: (id: string) => void;
    onToggleFavorite: (id: string) => void;
    handleToggleFavorite: (id: string) => void; 
    selectedVersion: string;
    searchQuery: string;     
    setSearchQuery: (query: string) => void;    
    closeDropdown: () => void;
}

const SearchVersions: React.FC<SearchVersionsProps> = ({
    versions,
    theme,
    onVersionSelect,
    onToggleFavorite,
    handleToggleFavorite,
    selectedVersion,
    searchQuery, 
    setSearchQuery,
    closeDropdown
}) => {
    
    
    const filteredVersions = versions.filter(version => 
        version.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        version.abbreviation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        version.nameLocal?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        version.language.name.toLowerCase().includes(searchQuery.toLowerCase())
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
                            handleToggleFavorite={handleToggleFavorite}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};


interface VersionOptionProps {
    version: BibleVersionWithFavorite;
    theme: keyof typeof themes;
    isSelected: boolean;
    onSelect: () => void;
    onToggleFavorite: () => void;
    handleToggleFavorite: (id: string) => void;
}



const VersionOption: React.FC<VersionOptionProps> = ({
    version,
    theme,
    isSelected,
    onSelect,
    handleToggleFavorite
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
                handleToggleFavorite(version.id);
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