import { Link, useNavigate, useParams } from "react-router-dom";
import useRandomThumbnailJson from "../hooks/useRandomThumbnailJson";
import Menu from "./Menu";
import { useEffect, useState } from "react";
import useYearListJson from "../hooks/useYearListJson";
import useAlbumListJson from "../hooks/useAlbumListJson";
import { useToast } from "./ToastContext";

export default function AlbumList() {
  const { year: yearParam } = useParams<{ year?: string }>();
  const {
    yearListData,
    error: yearListError,
    isLoading: isYearListLoading,
  } = useYearListJson();

  const [year, setYear] = useState<string | null>(null);

  const { albumListData, error, isLoading } = useAlbumListJson(year);

  const { randomThumbnailList, errorThumb, isLoadingThumb } =
    useRandomThumbnailJson(albumListData || []);

  const [hasShownToast, setHasShownToast] = useState(false);
  const { showToast } = useToast();

  const navigate = useNavigate();

  // Pick year from URL or fall back to newest
  useEffect(() => {
    if (yearParam) {
      setYear(yearParam);
    } else if (yearListData && yearListData.length > 0) {
      setYear(yearListData[0].toString());
    }
  }, [yearParam, yearListData]);

  useEffect(() => {
    if (error && !hasShownToast && yearListData?.length) {
      const invalidYear = yearParam; // raw URL input
      showToast(
        `Invalid year: ${invalidYear}, redirecting to most recent year.`,
        "error"
      );
      setHasShownToast(true); // prevent further toast updates

      const mostRecentYear = yearListData[0].toString();
      setYear(mostRecentYear);
      navigate(`/year/${mostRecentYear}`, { replace: true });
    }
  }, [error, yearListData, hasShownToast, yearParam]);

  if (isLoading || isLoadingThumb || isYearListLoading) {
    return <div className="spinner-border"></div>;
  }

  if (errorThumb) return <p>Error: {errorThumb}</p>;
  if (yearListError) return <p>Error: {yearListError}</p>;
  if (!albumListData) return null;

  return (
    <div className="container py-4">
      <Menu />
      <h2 className="text-center mb-4">Craig Likes Pictures – {year}</h2>

      {/* Single Bootstrap row, wraps automatically */}
      <div className="row g-5 justify-content-center">
        {albumListData.map((album, idx) => (
          <div key={idx} className="col-10 col-sm-6 col-md-4 col-lg-4 mx-auto">
            <Link to={`/album/${album.year}/${album.folder}`}>
              {/* The actual card */}
              <div
                className="card h-100 shadow-sm border-0 text-white position-relative overflow-hidden rounded-4"
                role="button"
                style={{
                  backgroundImage: randomThumbnailList?.[album.folder]
                    ? `url("${randomThumbnailList[album.folder]}")`
                    : undefined,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  minHeight: "300px",
                  backgroundRepeat: "no-repeat",
                }}
              >
                {/* Dark overlay */}
                <div className="card-overlay position-absolute top-0 start-0 w-100 h-100 rounded-4"></div>

                {/* Content */}
                <div className="card-body position-relative z-1">
                  <h5 className="card-title fw-semibold text-shadow">
                    {album.title}
                  </h5>
                  <p className="card-text small text-shadow">
                    {album.description.slice(0, 150)}
                    {album.description.length > 150 && "…"}
                  </p>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
