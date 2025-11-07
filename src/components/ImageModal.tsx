import { useEffect, useState } from "react";

interface ImageModalProps {
  isImageModalOpen: boolean;
  currentImg: string | null;
  getFullImageUrl: (file: string) => string;
  showPrev: () => void;
  showNext: () => void;
  closeModal: () => void;
  context?: "album" | "search";
  onOpenAlbum?: () => void;
}

export default function ImageModal({
  isImageModalOpen,
  currentImg,
  getFullImageUrl,
  showPrev,
  showNext,
  closeModal,
  context,
  onOpenAlbum,
}: ImageModalProps) {
  const [areControlsVisible, setControlsVisible] = useState(true);

  // Keyboard navigation: Esc + Left/Right
  useEffect(() => {
    if (isImageModalOpen) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") closeModal();
        else if (e.key === "ArrowLeft") showPrev();
        else if (e.key === "ArrowRight") showNext();
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }

    return;
  }, [isImageModalOpen, showPrev, showNext]);

  // Touch/swipe logic
  let touchStartX = 0;
  let touchEndX = 0;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX = e.changedTouches[0].clientX;
    if (touchEndX < touchStartX - 50) showNext; // swipe left
    if (touchEndX > touchStartX + 50) showPrev; // swipe right
  };

  useEffect(() => {
    if (!isImageModalOpen) return;

    let timeout: number;

    const resetTimer = () => {
      setControlsVisible(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setControlsVisible(false), 2000); // 2 seconds of inactivity
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
  }, [isImageModalOpen]);

  return (
    isImageModalOpen &&
    currentImg && (
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
                {context === "search" && onOpenAlbum && (
                  <div className="mt-3">
                    <button className="btn btn-light" onClick={onOpenAlbum}>
                      Open in Album
                    </button>
                  </div>
                )}

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
                      !areControlsVisible ? "fade-out" : ""
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
                    !areControlsVisible ? "fade-out" : ""
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
                    !areControlsVisible ? "fade-out" : ""
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
    )
  );
}
