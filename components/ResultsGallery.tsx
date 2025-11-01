import React from 'react';
import { GeneratedImage } from '../types';

const DownloadIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
);

const RegenerateIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5M20 20v-5h-5M4 4l16 16" transform="rotate(90 12 12)" /></svg>
);


interface ResultCardProps {
    result: GeneratedImage;
    onRegenerate: (result: GeneratedImage) => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ result, onRegenerate }) => {
    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = result.base64;
        link.download = `remix-${result.preset.name.replace(/\s/g, '_')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="group relative overflow-hidden rounded-lg shadow-lg aspect-w-1 aspect-h-1 bg-gray-700">
            <img src={result.base64} alt={result.preset.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4">
                <div>
                    <h3 className="text-white font-bold text-md">{result.preset.name}</h3>
                    <p className="text-xs text-gray-300">{result.aspectRatio}</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onRegenerate(result)}
                        className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
                        title="Regenerate Image"
                    >
                        <RegenerateIcon />
                    </button>
                    <button
                        onClick={handleDownload}
                        className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
                        title="Download Image"
                    >
                        <DownloadIcon />
                    </button>
                </div>
            </div>
        </div>
    );
};


interface ResultsGalleryProps {
    results: GeneratedImage[];
    onDownloadAll: () => void;
    onClearAll: () => void;
    onRegenerate: (result: GeneratedImage) => void;
    isGenerating: boolean;
}

export const ResultsGallery: React.FC<ResultsGalleryProps> = ({ results, onDownloadAll, onClearAll, onRegenerate, isGenerating }) => {
    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-700">
                <h2 className="text-xl font-bold text-indigo-400">Results</h2>
                {results.length > 0 && (
                    <div className="flex items-center gap-2">
                         <button
                            onClick={onClearAll}
                            className="px-3 py-1.5 text-xs font-semibold bg-red-600/80 text-white rounded-md hover:bg-red-700 transition-colors"
                        >
                            Clear All
                        </button>
                        <button
                            onClick={onDownloadAll}
                            className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-1.5"
                        >
                            <DownloadIcon />
                            Download All (.zip)
                        </button>
                    </div>
                )}
            </div>
            {results.length === 0 && !isGenerating && (
                <div className="flex-grow flex items-center justify-center">
                    <div className="text-center text-gray-500">
                        <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <p className="text-lg font-medium">Your generated images will appear here.</p>
                        <p className="text-sm">Upload an image and select some presets to get started!</p>
                    </div>
                </div>
            )}
            <div className="flex-grow overflow-y-auto pr-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                    {results.map(result => (
                        <ResultCard key={result.id} result={result} onRegenerate={onRegenerate} />
                    ))}
                </div>
            </div>
        </div>
    );
};
