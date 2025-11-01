export interface Preset {
    id: number;
    name: string;
    prompt: string;
    tags: string[];
}

export type AspectRatio = '1:1' | '3:4' | '4:3' | '9:16' | '16:9' | 'Free';

export interface GeneratedImage {
    id: string;
    base64: string;
    preset: Preset;
    aspectRatio: AspectRatio;
    originalImage: string;
}
