import React, { useState, useMemo, useCallback } from 'react';
import { PRESETS, PRESET_TAGS } from '../constants';
import { Preset } from '../types';

interface PresetCardProps {
    preset: Preset;
    isSelected: boolean;
    onSelect: (id: number) => void;
}

const PresetCard: React.FC<PresetCardProps> = React.memo(({ preset, isSelected, onSelect }) => {
    return (
        <div
            onClick={() => onSelect(preset.id)}
            className={`cursor-pointer p-3 rounded-lg transition-all duration-200 ${isSelected ? 'bg-indigo-600 shadow-lg ring-2 ring-indigo-400' : 'bg-gray-700 hover:bg-gray-600'}`}
        >
            <p className="font-semibold text-sm truncate text-white">{preset.name}</p>
            <div className="flex flex-wrap gap-1 mt-2">
                {preset.tags.map(tag => (
                    <span key={tag} className="text-xs bg-gray-600/50 text-indigo-300 px-1.5 py-0.5 rounded">
                        {tag}
                    </span>
                ))}
            </div>
        </div>
    );
});


interface PresetSelectorProps {
    selectedIds: Set<number>;
    onSelectionChange: (ids: Set<number>) => void;
}

export const PresetSelector: React.FC<PresetSelectorProps> = ({ selectedIds, onSelectionChange }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTags, setActiveTags] = useState<Set<string>>(new Set());

    const handleSelect = useCallback((id: number) => {
        const newSelection = new Set(selectedIds);
        if (newSelection.has(id)) {
            newSelection.delete(id);
        } else {
            newSelection.add(id);
        }
        onSelectionChange(newSelection);
    }, [selectedIds, onSelectionChange]);

    const handleTagClick = useCallback((tag: string) => {
        setActiveTags(prev => {
            const newTags = new Set(prev);
            if (newTags.has(tag)) {
                newTags.delete(tag);
            } else {
                newTags.add(tag);
            }
            return newTags;
        });
    }, []);

    const filteredPresets = useMemo(() => {
        return PRESETS.filter(preset => {
            const lowerSearch = searchTerm.toLowerCase();
            const matchesSearch = preset.name.toLowerCase().includes(lowerSearch) || preset.prompt.toLowerCase().includes(lowerSearch) || preset.tags.some(t => t.toLowerCase().includes(lowerSearch));
            const matchesTags = activeTags.size === 0 || preset.tags.some(t => activeTags.has(t));
            return matchesSearch && matchesTags;
        });
    }, [searchTerm, activeTags]);

    const handleSelectAllVisible = () => {
        const allVisibleIds = new Set(filteredPresets.map(p => p.id));
        onSelectionChange(new Set([...selectedIds, ...allVisibleIds]));
    };
    
    const handleClearSelection = () => {
        onSelectionChange(new Set());
    };

    return (
        <div className="flex flex-col gap-4">
            <input
                type="text"
                placeholder="Search presets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex flex-wrap gap-2 text-xs">
                <button onClick={handleSelectAllVisible} className="font-medium text-indigo-400 hover:text-indigo-300">Select All (Visible)</button>
                <button onClick={handleClearSelection} className="font-medium text-indigo-400 hover:text-indigo-300">Clear Selection</button>
            </div>
            <div className="flex flex-wrap gap-2">
                {PRESET_TAGS.map(tag => (
                    <button
                        key={tag}
                        onClick={() => handleTagClick(tag)}
                        className={`px-2 py-1 text-xs font-medium rounded-full transition-colors ${activeTags.has(tag) ? 'bg-indigo-500 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'}`}
                    >
                        {tag}
                    </button>
                ))}
            </div>
            <div className="max-h-96 overflow-y-auto pr-2 space-y-2">
                {filteredPresets.length > 0 ? filteredPresets.map(preset => (
                    <PresetCard
                        key={preset.id}
                        preset={preset}
                        isSelected={selectedIds.has(preset.id)}
                        onSelect={handleSelect}
                    />
                )) : <p className="text-gray-400 text-sm text-center py-4">No presets found.</p>}
            </div>
        </div>
    );
};
