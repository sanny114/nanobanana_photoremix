
import React, { useState, useCallback, useRef } from 'react';

interface ImageUploaderProps {
    onImageUpload: (base64: string) => void;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
    const [preview, setPreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = useCallback(async (file: File) => {
        if (file && file.type.startsWith('image/')) {
            const base64 = await fileToBase64(file);
            setPreview(base64);
            onImageUpload(base64);
        }
    }, [onImageUpload]);

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0]);
        }
    };

    const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    };

    const onPaste = useCallback(async (e: React.ClipboardEvent<HTMLDivElement>) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf("image") !== -1) {
                const file = items[i].getAsFile();
                if (file) {
                    await handleFileUpload(file);
                }
                break;
            }
        }
    }, [handleFileUpload]);

    return (
        <div onPaste={onPaste}>
            <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors duration-300 ${isDragging ? 'border-indigo-400 bg-gray-700' : 'border-gray-600 hover:border-indigo-500'}`}
            >
                <input type="file" accept="image/*" ref={fileInputRef} onChange={onFileChange} className="hidden" />
                {preview ? (
                    <img src={preview} alt="Preview" className="mx-auto max-h-48 rounded-md object-contain" />
                ) : (
                    <div className="flex flex-col items-center justify-center space-y-2 text-gray-400">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        <p className="text-sm">Drag & drop, click to upload, or paste an image.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
