import React from 'react';
import { Preset } from '../types';

interface FullScreenLoaderProps {
  jobs: Map<string, { preset: Preset, status: 'pending' | 'generating' | 'done' | 'error' }>;
  onCancel: () => void;
}

export const FullScreenLoader: React.FC<FullScreenLoaderProps> = ({ jobs, onCancel }) => {
    const totalJobs = jobs.size;
    const completedJobs = Array.from(jobs.values()).filter(j => j.status === 'done' || j.status === 'error').length;
    const progress = totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0;
    const currentJob = Array.from(jobs.values()).find(j => j.status === 'generating');

    return (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md p-8 bg-gray-800 rounded-2xl shadow-2xl text-center">
                <h2 className="text-2xl font-bold text-indigo-400 mb-2">Generating...</h2>
                <p className="text-gray-400 mb-6">Your image remixes are being created.</p>
                
                <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
                    <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${progress}%`, transition: 'width 0.5s ease-in-out' }}></div>
                </div>

                <div className="text-right text-sm font-medium text-gray-300 mb-4">
                    {completedJobs} / {totalJobs} Completed
                </div>

                {currentJob && (
                    <div className="h-12 flex items-center justify-center">
                        <p className="text-lg text-white animate-pulse">
                            Applying: <span className="font-semibold">{currentJob.preset.name}</span>
                        </p>
                    </div>
                )}

                <button
                    onClick={onCancel}
                    className="mt-6 w-full bg-red-600/80 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 disabled:bg-gray-500 transition-colors"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};
