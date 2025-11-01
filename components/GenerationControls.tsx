import React from 'react';
import { AspectRatio } from '../types';

interface GenerationControlsProps {
    aspectRatio: AspectRatio;
    onAspectRatioChange: (ratio: AspectRatio) => void;
    onGenerate: () => void;
    isDisabled: boolean;
    selectedCount: number;
}

const aspectRatios: AspectRatio[] = ['1:1', '3:4', '4:3', '9:16', '16:9', 'Free'];

export const GenerationControls: React.FC<GenerationControlsProps> = ({ aspectRatio, onAspectRatioChange, onGenerate, isDisabled, selectedCount }) => {
    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Aspect Ratio</label>
                <div className="grid grid-cols-3 gap-2">
                    {aspectRatios.map(ratio => (
                        <button
                            key={ratio}
                            onClick={() => onAspectRatioChange(ratio)}
                            className={`px-2 py-2 text-sm rounded-md transition-colors ${aspectRatio === ratio ? 'bg-indigo-600 text-white font-semibold' : 'bg-gray-700 hover:bg-gray-600'}`}
                        >
                            {ratio}
                        </button>
                    ))}
                </div>
            </div>
            <button
                onClick={onGenerate}
                disabled={isDisabled}
                className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:scale-100"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
                <span>Generate {selectedCount > 0 ? `(${selectedCount})` : ''}</span>
            </button>
        </div>
    );
};
