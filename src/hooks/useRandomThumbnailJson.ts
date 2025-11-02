import { useEffect, useState } from "react";
import type { AlbumListJson } from "../services/AlbumListJson";
import type { AlbumJson } from "../services/AlbumJson";

const useRandomThumbnailJson = (albumList: AlbumListJson[]) => {
  const [errorThumb, setErrorThumb] = useState("");

  const [isLoadingThumb, setLoadingThumb] = useState(false);

  const [randomThumbnailList, setRandomThumbnailList] =
    useState<Record<string, string>>();

  async function getRandomThumbnails(
    albums: AlbumListJson[]
  ): Promise<Record<string, string>> {
    const results = await Promise.all(
      albums.map(async (album) => {
        const res = await fetch(`/json/${album.albumJson}?v=1`);
        const data: AlbumJson = await res.json();
        const randomImage =
          data.images[Math.floor(Math.random() * data.images.length)];
        return {
          folder: album.folder,
          url: `/albums/${album.albumJson.replace(
            ".json",
            ""
          )}/img/${randomImage}`,
        };
      })
    );

    return results.reduce((acc, curr) => {
      acc[curr.folder] = curr.url;
      return acc;
    }, {} as Record<string, string>);
  }

  useEffect(() => {
    if (!albumList || albumList.length === 0) return;

    setLoadingThumb(true);
    setErrorThumb("");

    getRandomThumbnails(albumList)
      .then((result) => {
        setRandomThumbnailList(result);
      })
      .catch((err) => {
        console.error(err);
        setErrorThumb(err.message);
      })
      .finally(() => setLoadingThumb(false));
  }, [albumList]);

  return { randomThumbnailList, errorThumb, isLoadingThumb };
};

export default useRandomThumbnailJson;
