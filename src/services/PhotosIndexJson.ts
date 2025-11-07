export interface PhotosIndexNormalized {
  year: string;
  album: string;
  photo: string;
  photoIndex: number;
}

export type PhotosIndexRaw = Record<string, string[]>;
