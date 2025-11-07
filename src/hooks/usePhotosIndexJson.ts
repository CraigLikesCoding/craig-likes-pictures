import { useState } from "react";
import type {
  PhotosIndexRaw,
  PhotosIndexNormalized,
} from "../services/PhotosIndexJson";

const usePhotosIndexJson = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [photosData, setPhotosData] = useState<PhotosIndexNormalized[] | null>(
    null
  );

  function normalizePhotosIndex(raw: PhotosIndexRaw): PhotosIndexNormalized[] {
    const result: PhotosIndexNormalized[] = [];
    for (const key in raw) {
      const [year, album] = key.split("/");
      raw[key].forEach((photo, idx) => {
        result.push({
          year,
          album,
          photo,
          photoIndex: idx, // <-- add the index here
        });
      });
    }
    return result;
  }

  const loadPhotosIndex = async (): Promise<void> => {
    if (photosData) return; // already loaded
    setLoading(true);
    setError(null);

    let version = "1"; // default version if version.json is missing
    try {
      const versionRes = await fetch("/json/version.json");
      if (versionRes.ok) {
        const versionData = await versionRes.json();
        version = versionData.photos_index ?? "1";
      } else {
        console.warn("version.json not found, using v=1 for photos_index");
      }
    } catch (err: any) {
      console.warn(
        "Error loading version.json, using v=1 for photos_index",
        err?.message ?? err
      );
    }

    const url = `/json/photos_index.json?v=${version}`;

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch ${url} — ${res.status}`);
      const data = (await res.json()) as PhotosIndexRaw;
      setPhotosData(normalizePhotosIndex(data));
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  };

  return { photosData, isLoading, error, loadPhotosIndex };
};

export default usePhotosIndexJson;
