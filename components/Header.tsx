
import React from 'react';

export const Header: React.FC = () => {
    return (
        <header className="bg-gray-800/50 backdrop-blur-sm sticky top-0 z-20 border-b border-gray-700">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-3">
                        <span className="text-2xl" role="img" aria-label="banana">🍌</span>
                        <h1 className="text-xl font-bold text-white tracking-tight">
                            Nano Banana <span className="text-indigo-400">Photo Remixer</span>
                        </h1>
                    </div>
                </div>
            </div>
        </header>
    );
};
