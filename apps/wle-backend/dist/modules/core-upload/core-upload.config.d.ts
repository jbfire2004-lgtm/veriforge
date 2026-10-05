export type CoreUploadMode = 'local' | 's3' | 'direct';
export declare function getCoreUploadConfig(): {
    mode: CoreUploadMode;
    maxBytes: number;
    allowedMimeTypes: Set<string>;
    awsRegion: string;
    awsBucket: string;
    publicAssetBase: string | null;
};
