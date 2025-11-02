import { useParams } from "react-router-dom";
import useAlbumViewerJson from "../hooks/useAlbumViewerJson";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Menu from "./Menu";
import Toast from "./Toast";

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

  const [showControls, setShowControls] = useState(true);

  const [descriptionModalOpen, setDescriptionModalOpen] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [hasShownToast, setHasShownToast] = useState(false);

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
          setToastMessage(
            `Invalid photo: ${index}, redirecting to the album page instead.`
          );
          setHasShownToast(true); // prevent further toast updates
        }
        navigate(`/album/${year}/${albumFolder}`, { replace: true });
      }
    }
  }, [albumData, imageIndexParam, hasShownToast]); // re-run when photos are loaded or URL changes

  // Keyboard navigation: Esc + Left/Right
  useEffect(() => {
    if (imageModalOpen) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") closeModal();
        else if (e.key === "ArrowLeft") showPrev();
        else if (e.key === "ArrowRight") showNext();
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }

    if (descriptionModalOpen) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") closeModal();
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }

    return;
  }, [imageModalOpen, currentIndex, albumData, descriptionModalOpen]);

  // Touch/swipe logic
  let touchStartX = 0;
  let touchEndX = 0;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX = e.changedTouches[0].clientX;
    if (touchEndX < touchStartX - 50) showNext(); // swipe left
    if (touchEndX > touchStartX + 50) showPrev(); // swipe right
  };

  useEffect(() => {
    if (!imageModalOpen) return;

    let timeout: number;

    const resetTimer = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowControls(false), 2000); // 2 seconds of inactivity
    };

    // Listen for mouse move and touch events inside the modal
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("touchstart", resetTimer);

    // Start timer immediately
    resetTimer();

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("touchstart", resetTimer);
    };
  }, [imageModalOpen]);

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
      {toastMessage && <Toast message={toastMessage} />}
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

      {/* Modal */}
      {imageModalOpen && currentImg && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
          onClick={closeModal}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content bg-transparent border-0 text-center position-relative">
              <h5 className="text-white mb-2">
                {currentImg.replace(/\.[^.]+$/, "")}
              </h5>
              <div
                className="d-flex justify-content-center align-items-center"
                style={{
                  maxWidth: "90vw",
                  maxHeight: "90vh",
                  overflow: "hidden",
                  touchAction: "pan-y",
                }}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <div className="position-relative d-inline-block">
                  <img
                    src={getFullImageUrl(currentImg)}
                    alt={currentImg}
                    className="rounded shadow"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "100%",
                      width: "auto",
                      height: "auto",
                    }}
                  />

                  {/* Top-right controls */}
                  <div className="position-absolute top-0 end-0 d-flex gap-2 p-2">
                    {/*This is for the share button, which I'm still thinking about how to actually pass the file alongs}
                    <button
                      className={`btn btn-sm btn-dark rounded-circle text-white ${
                        !showControls ? "fade-out" : ""
                      }`}
                      style={{
                        backgroundColor: "rgba(0,0,0,0.5)", // semi-transparent black
                      }}
                      onClick={handleShare}
                    >
                      <i className="bi bi-share"></i>
                    </button>*/}
                    <button
                      className={`btn btn-sm btn-dark rounded-circle text-white ${
                        !showControls ? "fade-out" : ""
                      }`}
                      style={{
                        backgroundColor: "rgba(0,0,0,0.5)", // semi-transparent black
                      }}
                      onClick={closeModal}
                    >
                      <i className="bi bi-x-lg"></i>
                    </button>
                  </div>

                  {/* Nav arrows */}
                  <button
                    className={`btn btn-dark btn-sm rounded-circle text-white position-absolute top-50 start-0 translate-middle-y ${
                      !showControls ? "fade-out" : ""
                    }`}
                    onClick={showPrev}
                    style={{
                      backgroundColor: "rgba(0,0,0,0.5)", // semi-transparent black
                    }}
                  >
                    <i className="bi bi-chevron-left fs-4"></i>
                  </button>

                  <button
                    className={`btn btn-dark btn-sm rounded-circle text-white position-absolute top-50 end-0 translate-middle-y ${
                      !showControls ? "fade-out" : ""
                    }`}
                    onClick={showNext}
                    style={{
                      backgroundColor: "rgba(0,0,0,0.5)", // semi-transparent black
                    }}
                  >
                    <i className="bi bi-chevron-right fs-4"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
