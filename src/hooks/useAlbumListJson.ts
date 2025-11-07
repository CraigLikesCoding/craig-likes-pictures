import { useEffect, useState } from "react";
import type { AlbumListJson } from "../services/AlbumListJson";

const useAlbumListJson = (year: string | null) => {
  const [error, setError] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [albumListData, setAlbumListData] = useState<AlbumListJson[] | null>(
    []
  );

  useEffect(() => {
    if (!year) return;

    const fetchData = async () => {
      setLoading(true);

      try {
        let version = "1"; // ✅ default fallback

        try {
          // Try to get version info
          const versionRes = await fetch("/json/version.json");
          if (versionRes.ok) {
            const versionData = await versionRes.json();
            version =
              versionData[`albums_${year}`] ||
              versionData.albums_index ||
              versionData.default ||
              "1";
          } else {
            console.warn("⚠️ version.json not found or invalid, using v=1");
          }
        } catch (versionErr) {
          console.warn("⚠️ version.json missing or malformed, using v=1");
        }

        // Then fetch the album list JSON
        const url = `/json/albums_${year}.json?v=${version}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to fetch ${url}`);
        const data: AlbumListJson[] = await res.json();

        // Add year metadata
        const dataWithYear = data.map((album) => ({
          ...album,
          year: album.albumJson.split("/")[0],
        }));

        setAlbumListData(dataWithYear);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [year]);

  return { albumListData, error, isLoading };
};

export default useAlbumListJson;
