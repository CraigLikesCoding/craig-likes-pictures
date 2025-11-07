import { useEffect, useState } from "react";
import type { AlbumIndexJson } from "../services/AlbumIndexJson";

const useYearListJson = () => {
  const [error, setError] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [yearListData, setYearListData] = useState<number[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");

      // Default version for albums_index
      let albumsIndexVersion = "1";

      try {
        const versionRes = await fetch("/json/version.json");
        if (versionRes.ok) {
          const versionData = await versionRes.json();
          albumsIndexVersion = versionData.albums_index ?? "1";
        } else {
          console.warn(
            "version.json not found, using v=1 for albums_index.json"
          );
        }
      } catch (err: any) {
        console.warn(
          "Error loading version.json, using v=1 for albums_index.json",
          err?.message ?? err
        );
      }

      const url = `/json/albums_index.json?v=${albumsIndexVersion}`;

      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to fetch ${url}`);
        const data: AlbumIndexJson[] = await res.json();

        const allYears = Array.from(new Set(data.map((a) => a.year))).sort(
          (a, b) => b - a
        );

        setYearListData(allYears);
      } catch (err: any) {
        console.error(err);
        setError(err?.message ?? String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { yearListData, error, isLoading };
};

export default useYearListJson;
