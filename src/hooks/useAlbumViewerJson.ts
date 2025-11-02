import { useEffect, useState } from "react";
import type { AlbumJson } from "../services/AlbumJson";

const useAlbumViewerJson = (year: string, albumFolder: string) => {
  const [error, setError] = useState("");

  const [isLoading, setLoading] = useState(false);

  const [albumData, setAlbumData] = useState<AlbumJson | null>(null);

  useEffect(() => {
    if (!year || !albumFolder) return;

    const url = `/json/${year}/${albumFolder}.json?v=1`;

    setLoading(true);
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch ${url}`);
        return res.json();
      })
      .then((data: AlbumJson) => {
        setAlbumData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, [year, albumFolder]);

  return { albumData, error, isLoading };
};

export default useAlbumViewerJson;
