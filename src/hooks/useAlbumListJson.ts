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

    const url = `/json/albums_${year}.json?v=1`;

    setLoading(true);
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch ${url}`);
        return res.json();
      })
      .then((data: AlbumListJson[]) => {
        const dataWithYear = data.map((album) => ({
          ...album,
          year: album.albumJson.split("/")[0], // first part before '/'
        }));
        setAlbumListData(dataWithYear);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, [year]);

  return { albumListData, error, isLoading };
};

export default useAlbumListJson;
