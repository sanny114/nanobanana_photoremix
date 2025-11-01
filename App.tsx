import React, { useState, useCallback, useMemo, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { PresetSelector } from './components/PresetSelector';
import { GenerationControls } from './components/GenerationControls';
import { ResultsGallery } from './components/ResultsGallery';
import { FullScreenLoader } from './components/FullScreenLoader';
import { GeneratedImage, AspectRatio, Preset } from './types';
import { generateImage } from './services/geminiService';
import { PRESETS } from './constants';
import JSZip from 'jszip';
import saveAs from 'file-saver';

const App: React.FC = () => {
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [selectedPresetIds, setSelectedPresetIds] = useState<Set<number>>(new Set());
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
    const [results, setResults] = useState<GeneratedImage[]>([]);
    const [processingJobs, setProcessingJobs] = useState<Map<string, { preset: Preset, status: 'pending' | 'generating' | 'done' | 'error' }>>(new Map());
    const [error, setError] = useState<string | null>(null);
    const cancelGenerationRef = useRef(false);

    const isGenerating = useMemo(() => Array.from(processingJobs.values()).some(job => job.status === 'generating' || job.status === 'pending'), [processingJobs]);

    const runGeneration = useCallback(async (
        image: string,
        preset: Preset,
        aspect: AspectRatio,
        jobId: string,
        ai: GoogleGenAI
    ) => {
        try {
            setProcessingJobs(prev => new Map(prev).set(jobId, { preset, status: 'generating' }));
            const resultBase64 = await generateImage(ai, image, preset, aspect);
            
            if (cancelGenerationRef.current) return; // Don't add result if cancelled

            const newResult: GeneratedImage = {
                id: jobId,
                base64: `data:image/png;base64,${resultBase64}`,
                preset: preset,
                aspectRatio: aspect,
                originalImage: image,
            };
            setResults(prev => [newResult, ...prev]);
            setProcessingJobs(prev => new Map(prev).set(jobId, { preset, status: 'done' }));
        } catch (err: any) {
            console.error(`Error generating image for preset ${preset.name}:`, err);
            setError(`Failed to generate image for "${preset.name}". Please try again.`);
            setProcessingJobs(prev => new Map(prev).set(jobId, { preset, status: 'error' }));
            throw err; // re-throw to stop the main loop
        }
    }, []);

    const handleGenerate = useCallback(async () => {
        if (!uploadedImage || selectedPresetIds.size === 0 || isGenerating) {
            return;
        }
        setError(null);
        cancelGenerationRef.current = false;

        const newJobs = new Map<string, { preset: Preset, status: 'pending' | 'generating' | 'done' | 'error' }>();
        selectedPresetIds.forEach(id => {
            const preset = PRESETS.find(p => p.id === id);
            if (preset) {
                const jobId = `${Date.now()}-${id}`;
                newJobs.set(jobId, { preset, status: 'pending' });
            }
        });
        setProcessingJobs(newJobs);

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

        for (const [jobId, job] of newJobs.entries()) {
            if (cancelGenerationRef.current) {
                setProcessingJobs(prev => {
                    const updatedJobs = new Map(prev);
                    updatedJobs.forEach((value, key) => {
                        if (value.status === 'pending' || value.status === 'generating') {
                            updatedJobs.set(key, { ...value, status: 'error' });
                        }
                    });
                    return updatedJobs;
                });
                break;
            }
            try {
                await runGeneration(uploadedImage, job.preset, aspectRatio, jobId, ai);
            } catch (err) {
                // Stop further processing on error
                break;
            }
        }
    }, [uploadedImage, selectedPresetIds, aspectRatio, isGenerating, runGeneration]);
    
    const handleRegenerate = useCallback(async (resultToRegen: GeneratedImage) => {
        if (isGenerating) return;
        setError(null);
        cancelGenerationRef.current = false;

        const jobId = `${Date.now()}-${resultToRegen.preset.id}`;
        const newJob: [string, { preset: Preset, status: 'pending' }] = [jobId, { preset: resultToRegen.preset, status: 'pending' }];
        setProcessingJobs(new Map([newJob]));

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        await runGeneration(resultToRegen.originalImage, resultToRegen.preset, resultToRegen.aspectRatio, jobId, ai);

    }, [isGenerating, runGeneration]);

    const handleCancel = () => {
        cancelGenerationRef.current = true;
    };

    const handleDownloadAll = useCallback(() => {
        if (results.length === 0) return;
        const zip = new JSZip();
        results.forEach((result) => {
            const imgData = result.base64.split(',')[1];
            zip.file(`remix-${result.preset.id}-${result.preset.name.replace(/\s/g, '_')}.png`, imgData, { base64: true });
        });
        zip.generateAsync({ type: 'blob' }).then((content) => {
            saveAs(content, 'nano-banana-remixes.zip');
        });
    }, [results]);
    
    const clearResults = () => {
        setResults([]);
    }

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col">
            {isGenerating && <FullScreenLoader jobs={processingJobs} onCancel={handleCancel} />}
            <Header />
            <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-6">
                    <div className="bg-gray-800 rounded-2xl p-6 shadow-lg">
                        <h2 className="text-xl font-bold mb-4 text-indigo-400">1. Upload Photo</h2>
                        <ImageUploader onImageUpload={setUploadedImage} />
                    </div>
                    {uploadedImage && (
                        <>
                            <div className="bg-gray-800 rounded-2xl p-6 shadow-lg">
                                <h2 className="text-xl font-bold mb-4 text-indigo-400">2. Choose Presets</h2>
                                <PresetSelector selectedIds={selectedPresetIds} onSelectionChange={setSelectedPresetIds} />
                            </div>
                            <div className="bg-gray-800 rounded-2xl p-6 shadow-lg sticky top-8">
                                <h2 className="text-xl font-bold mb-4 text-indigo-400">3. Generate</h2>
                                <GenerationControls
                                    aspectRatio={aspectRatio}
                                    onAspectRatioChange={setAspectRatio}
                                    onGenerate={handleGenerate}
                                    isDisabled={selectedPresetIds.size === 0 || isGenerating}
                                    selectedCount={selectedPresetIds.size}
                                />
                                {error && <p className="text-red-400 mt-4 text-sm">{error}</p>}
                            </div>
                        </>
                    )}
                </div>
                <div className="lg:col-span-8 xl:col-span-9 bg-gray-800/50 rounded-2xl p-6 shadow-lg">
                   <ResultsGallery 
                     results={results} 
                     onDownloadAll={handleDownloadAll}
                     onClearAll={clearResults}
                     onRegenerate={handleRegenerate}
                     isGenerating={isGenerating}
                   />
                </div>
            </main>
        </div>
    );
};

export default App;
