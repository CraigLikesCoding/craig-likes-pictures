import { useEffect, useState } from "react";
import type { AlbumJson } from "../services/AlbumJson";

const useAlbumViewerJson = (year: string, albumFolder: string) => {
  const [error, setError] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [albumData, setAlbumData] = useState<AlbumJson | null>(null);

  useEffect(() => {
    if (!year || !albumFolder) return;

    const fetchData = async () => {
      setLoading(true);
      setError("");

      // Default version for individual albums
      let albumVersion = "1";

      try {
        const versionRes = await fetch("/json/version.json");
        if (versionRes.ok) {
          const versionData = await versionRes.json();
          albumVersion = versionData.albums_individual ?? "1";
        } else {
          console.warn(
            "version.json not found, using v=1 for individual albums"
          );
        }
      } catch (err: any) {
        console.warn(
          "Error loading version.json, using v=1 for individual albums",
          err?.message ?? err
        );
      }

      const url = `/json/${year}/${albumFolder}.json?v=${albumVersion}`;

      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to fetch ${url}`);
        const data: AlbumJson = await res.json();
        setAlbumData(data);
      } catch (err: any) {
        console.error(err);
        setError(err?.message ?? String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [year, albumFolder]);

  return { albumData, error, isLoading };
};

export default useAlbumViewerJson;
