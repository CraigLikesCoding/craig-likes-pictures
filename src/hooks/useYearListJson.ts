import { useEffect, useState } from "react";
import type { AlbumIndexJson } from "../services/AlbumIndexJson";

const useYearListJson = () => {
  const [error, setError] = useState("");

  const [isLoading, setLoading] = useState(false);

  const [yearListData, setYearListData] = useState<number[]>([]);

  useEffect(() => {
    const url = `/json/albums_index.json?v=1`;

    setLoading(true);
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch ${url}`);
        return res.json();
      })
      .then((data: AlbumIndexJson[]) => {
        const allYears = Array.from(new Set(data.map((a) => a.year))).sort(
          (a, b) => b - a
        );

        setYearListData(allYears);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { yearListData, error, isLoading };
};

export default useYearListJson;
