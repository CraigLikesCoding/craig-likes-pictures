import { useEffect, useState } from "react";
import type { AlbumListJson } from "../services/AlbumListJson";
import type { AlbumJson } from "../services/AlbumJson";

const useRandomThumbnailJson = (albumList: AlbumListJson[]) => {
  const [errorThumb, setErrorThumb] = useState("");
  const [isLoadingThumb, setLoadingThumb] = useState(false);
  const [randomThumbnailList, setRandomThumbnailList] =
    useState<Record<string, string>>();

  const PHOTO_BASE_URL = import.meta.env.VITE_PHOTO_BASE_URL;

  async function getRandomThumbnails(
    albums: AlbumListJson[],
    version: string,
  ): Promise<Record<string, string>> {
    const results = await Promise.all(
      albums.map(async (album) => {
        const res = await fetch(`/json/${album.albumJson}?v=${version}`);
        if (!res.ok) throw new Error(`Failed to fetch ${album.albumJson}`);
        const data: AlbumJson = await res.json();
        const randomImage =
          data.images[Math.floor(Math.random() * data.images.length)];
        return {
          folder: album.folder,
          url: `${PHOTO_BASE_URL}/albums/${album.albumJson.replace(
            ".json",
            "",
          )}/img/${randomImage}`,
        };
      }),
    );

    return results.reduce(
      (acc, curr) => {
        acc[curr.folder] = curr.url;
        return acc;
      },
      {} as Record<string, string>,
    );
  }

  useEffect(() => {
    if (!albumList || albumList.length === 0) return;

    const fetchThumbnails = async () => {
      setLoadingThumb(true);
      setErrorThumb("");

      // default version
      let albumsIndividualVersion = "1";

      try {
        const versionRes = await fetch("/json/version.json");
        if (versionRes.ok) {
          const versionData = await versionRes.json();
          albumsIndividualVersion = versionData.albums_individual ?? "1";
        } else {
          console.warn(
            "version.json not found, using v=1 for individual album JSONs",
          );
        }
      } catch (err: any) {
        console.warn(
          "Error loading version.json, using v=1 for individual album JSONs",
          err?.message ?? err,
        );
      }

      try {
        const result = await getRandomThumbnails(
          albumList,
          albumsIndividualVersion,
        );
        setRandomThumbnailList(result);
      } catch (err: any) {
        console.error(err);
        setErrorThumb(err?.message ?? String(err));
      } finally {
        setLoadingThumb(false);
      }
    };

    fetchThumbnails();
  }, [albumList]);

  return { randomThumbnailList, errorThumb, isLoadingThumb };
};

export default useRandomThumbnailJson;
