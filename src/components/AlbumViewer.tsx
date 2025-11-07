import { useParams } from "react-router-dom";
import useAlbumViewerJson from "../hooks/useAlbumViewerJson";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Menu from "./Menu";
import { useToast } from "./ToastContext";
import ImageModal from "./ImageModal";

export default function AlbumViewer() {
  const { year, albumFolder, imageIndexParam } = useParams<{
    year: string;
    albumFolder: string;
    imageIndexParam?: string;
  }>();

  const { albumData, error, isLoading } = useAlbumViewerJson(
    year!,
    albumFolder!
  );

  const [imageModalOpen, setImageModalOpen] = useState(false);

  const [currentImg, setCurrentImg] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState<number | 0>(0);

  const [descriptionModalOpen, setDescriptionModalOpen] = useState(false);

  const [hasShownToast, setHasShownToast] = useState(false);
  const { showToast } = useToast();

  const navigate = useNavigate();

  const handleThumbnailClick = (img: string, index: number) => {
    setCurrentImg(img);
    setImageModalOpen(true);

    setCurrentIndex(index);

    navigate(`/album/${year}/${albumFolder}/${index}`, { replace: true });
  };

  const closeModal = () => {
    setImageModalOpen(false);
    setDescriptionModalOpen(false);
    setCurrentImg(null);
    navigate(`/album/${year}/${albumFolder}`, { replace: true });
  };

  // Navigate to previous/next image
  const showPrev = () => {
    console.log("showPrev in AlbumViewer");
    if (!albumData || !albumData.images?.length) return;

    setCurrentIndex((i) => (i > 0 ? i - 1 : albumData.images.length - 1));
    setCurrentImg(
      albumData.images[
        (currentIndex - 1 + albumData.images.length) % albumData.images.length
      ]
    );
    navigate(
      `/album/${year}/${albumFolder}/${
        (currentIndex - 1 + albumData.images.length) % albumData.images.length
      }`,
      { replace: true }
    );
  };

  const showNext = () => {
    //if (albumData) console.log(!albumData.images?.length);
    if (!albumData || !albumData.images?.length) return;

    setCurrentIndex((i) => (i < albumData.images.length - 1 ? i + 1 : 0));
    setCurrentImg(
      albumData.images[(currentIndex + 1) % albumData.images.length]
    );
    navigate(
      `/album/${year}/${albumFolder}/${
        (currentIndex + 1) % albumData.images.length
      }`,
      { replace: true }
    );
  };

  // When photos are loaded AND imageIndex exists, open the photo
  useEffect(() => {
    if (albumData == null) return;

    if (imageIndexParam === undefined) {
      closeModal();
      return;
    }

    if (albumData.images.length > 0 && imageIndexParam) {
      const index = parseInt(imageIndexParam, 10);
      if (!isNaN(index) && index >= 0 && index < albumData.images.length) {
        handleThumbnailClick(albumData.images[index], index);
      } else {
        if (!hasShownToast) {
          showToast(
            `Invalid photo: ${index}, redirecting to the album page instead.`,
            "error"
          );
          setHasShownToast(true); // prevent further toast updates
        }
        navigate(`/album/${year}/${albumFolder}`, { replace: true });
      }
    }
  }, [albumData, imageIndexParam, hasShownToast]); // re-run when photos are loaded or URL changes

  // Keyboard navigation: Esc + Left/Right
  useEffect(() => {
    if (descriptionModalOpen) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") closeModal();
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }

    return;
  }, [descriptionModalOpen]);

  if (error) return <p>Error: {error}</p>;
  if (!albumData) return <p>No album data found.</p>;

  // Helper to get the thumbnail path
  const getThumbUrl = (imgName: string) =>
    `/albums/${year}/${albumFolder}/img/thumb/${imgName.replace(
      /\.[^.]+$/,
      "_small.jpg"
    )}`;

  // Full-size image path (for later modal)
  const getFullImageUrl = (imgName: string) =>
    `/albums/${year}/${albumFolder}/img/${imgName}`;

  /* This is for the share button, which I'm still thinking about how to actually pass the file alongs
  const handleShare = () => {
    if (!currentImg) return;

    const url = getFullImageUrl(currentImg);
    const title = currentImg.replace(/\.[^.]+$/, "");

    if (navigator.share) {
      navigator
        .share({
          title,
          url,
        })
        .catch((err) => console.error("Share failed:", err));
    } else {
      // fallback: copy URL to clipboard
      navigator.clipboard
        .writeText(url)
        .then(() => alert("Image URL copied to clipboard!"))
        .catch(() => alert("Could not copy URL"));
    }
  };*/

  if (isLoading) {
    return <div className="spinner-border"></div>;
  }

  return (
    <div className="container py-4">
      <Menu />
      <h1 className="h4 mb-2">{albumData.album}</h1>
      <p className="text-muted mb-4">
        {albumData.description.slice(0, 400)}
        {albumData.description.length > 400 && (
          <button
            className="btn btn-link btn-sm text-muted p-0"
            onClick={() => setDescriptionModalOpen(true)}
          >
            Read more...
          </button>
        )}
      </p>

      <div className="row g-2 justify-content-center">
        {albumData.images.map((img, idx) => (
          <div
            key={idx}
            className="col-6 col-sm-4 col-md-3 col-lg-2 d-flex justify-content-center"
          >
            <div
              role="button"
              className="d-inline-block"
              onClick={() => handleThumbnailClick(img, idx)}
            >
              <img
                src={getThumbUrl(img)}
                alt={img}
                className="rounded shadow-sm"
                style={{
                  width: "auto",
                  height: "auto",
                  maxWidth: "150px", // don’t scale up beyond 150
                  maxHeight: "150px",
                  objectFit: "contain",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <ImageModal
        isImageModalOpen={imageModalOpen}
        currentImg={currentImg}
        getFullImageUrl={getFullImageUrl}
        showPrev={showPrev}
        showNext={showNext}
        closeModal={closeModal}
        context="album"
      />

      {/* Scrollable description modal */}
      {descriptionModalOpen && (
        <div
          className="modal description-modal fade show d-block"
          tabIndex={-1}
          style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
          onClick={() => setDescriptionModalOpen(false)}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content bg-white text-dark p-3 fs-5 lh-lg text-start">
              <h5 className="text-center">{albumData.album}</h5>
              <div
                style={{
                  maxHeight: "70vh",
                  overflowY: "auto",
                  whiteSpace: "pre-wrap", // preserves paragraphs
                }}
              >
                {albumData.description}
              </div>
              <button
                className="btn btn-secondary mt-2"
                onClick={() => setDescriptionModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
