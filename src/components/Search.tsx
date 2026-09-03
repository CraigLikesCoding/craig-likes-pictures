import { useState, useMemo, useEffect, useRef } from "react";
import type { PhotosIndexNormalized } from "../services/PhotosIndexJson";
import { useToast } from "./ToastContext";
import ImageModal from "./ImageModal";

interface SearchProps {
  photosData: PhotosIndexNormalized[] | null;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
}

export default function Search({
  photosData,
  isLoading,
  error,
  onClose,
}: SearchProps) {
  const [query, setQuery] = useState("");

  const { showToast } = useToast();

  const [visibleCount, setVisibleCount] = useState(0);

  const [randomizeTrigger, setRandomizeTrigger] = useState(0);

  const [resetOrder, setResetOrder] = useState(false);

  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);

  const PHOTO_BASE_URL = import.meta.env.VITE_PHOTO_BASE_URL;

  // useMemo caches filtered and sorted results for efficiency
  const filteredAndSortedResults = useMemo(() => {
    if (query.trim().length < 2) {
      setVisibleCount(0);
      return [];
    }

    if (!photosData || !query.trim()) {
      setVisibleCount(0);
      return [];
    }

    if (visibleCount == 0) {
      setVisibleCount(100);
    }

    // Split query into words, remove extra spaces
    const words = query.toLowerCase().split(" ").filter(Boolean);

    // Filter results where every search word is found in the photo name
    const matches = photosData.filter((item) =>
      words.every((w) => item.photo.toLowerCase().includes(w)),
    );

    const sortedResults = [...matches].sort((a, b) => {
      // Sort by year descending
      const yearDiff = parseInt(b.year) - parseInt(a.year);
      if (yearDiff !== 0) return yearDiff;

      // Then sort by photo filename descending
      return b.photo.localeCompare(a.photo);
    });

    return sortedResults;
  }, [photosData, query]);

  const displayedResults = useMemo(() => {
    const arr = [...filteredAndSortedResults];

    if (randomizeTrigger > 0) {
      // Fisher-Yates shuffle (fast and uniform)
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    }

    return arr;
  }, [filteredAndSortedResults, randomizeTrigger]);

  const closeModal = () => setImageModalOpen(false);

  const openModalAt = (index: number) => {
    setCurrentIndex(index);
    setImageModalOpen(true);
  };

  const showPrev = () => {
    if (currentIndex === null) return;

    const newIndex =
      currentIndex > 0
        ? currentIndex - 1
        : Math.min(visibleCount, displayedResults.length) - 1;
    setCurrentIndex(newIndex);
  };

  const showNext = () => {
    if (currentIndex === null) return;

    const newIndex =
      currentIndex < Math.min(visibleCount, displayedResults.length) - 1
        ? currentIndex + 1
        : 0;
    setCurrentIndex(newIndex);
  };

  const getFullImageUrl = (file: string) => {
    const item = displayedResults[currentIndex!];
    return `${PHOTO_BASE_URL}/albums/${item.year}/${item.album}/img/${file}`;
  };

  const listenerAttached = useRef(false);

  useEffect(() => {
    if (imageModalOpen && !listenerAttached.current) {
      listenerAttached.current = true;
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") closeModal();
        else if (e.key === "ArrowLeft") showPrev();
        else if (e.key === "ArrowRight") showNext();
      };
      document.addEventListener("keydown", handleKeyDown);

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        listenerAttached.current = false;
      };
    }
  }, [imageModalOpen, showPrev, showNext]);

  useEffect(() => {
    if (photosData) {
      showToast(
        "Ready to search " + photosData.length.toLocaleString() + " photos.",
        "success",
      );
    }
  }, [photosData]);

  useEffect(() => {
    if (resetOrder) {
      setRandomizeTrigger(0);
      setResetOrder(false);
    }
  }, [resetOrder]);

  return (
    <div
      className={`modal fade show d-block search-modal ${
        imageModalOpen ? "image-modal-open" : ""
      }`}
      onClick={onClose}
    >
      {/* Fullscreen overlay */}
      <div
        className="modal-dialog modal-dialog-centered modal-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content bg-white text-dark p-3">
          <h5 className="text-center mb-3">Search Photos</h5>

          {isLoading && <p>Loading photos index…</p>}
          {error && <p className="text-danger">Error: {error}</p>}

          {!isLoading && !error && (
            <>
              <input
                type="text"
                className="form-control mb-3"
                placeholder="Type to search photo names..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />

              {displayedResults.length > 0 && (
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setRandomizeTrigger((prev) => prev + 1)}
                  >
                    Randomize Results
                  </button>

                  <p className="text-muted">
                    Showing {Math.min(visibleCount, displayedResults.length)} of{" "}
                    {displayedResults.length.toLocaleString()} results
                  </p>

                  <button
                    className="btn btn-secondary"
                    onClick={() => setResetOrder(true)}
                  >
                    Reset Order
                  </button>
                </div>
              )}

              {/* Scrollable results area */}
              <div
                style={{
                  maxHeight: "70vh",
                  overflowY: "auto",
                  flexGrow: 1,
                  paddingRight: "4px", // prevent scrollbar overlap
                }}
              >
                <div className="d-flex flex-wrap justify-content-start gap-2">
                  {displayedResults
                    .slice(0, visibleCount)
                    .map((item, index) => (
                      <div
                        key={`${item.year}-${item.album}-${item.photo}`}
                        className="d-flex flex-column align-items-center"
                        style={{ flex: "0 0 150px" }}
                        onClick={() => openModalAt(index)}
                      >
                        <img
                          src={`${PHOTO_BASE_URL}/albums/${item.year}/${item.album}/img/thumb/${
                            item.photo.substring(
                              0,
                              item.photo.lastIndexOf(".jpg"),
                            ) + "_small.jpg"
                          }`}
                          alt={item.photo}
                          className="img-fluid rounded"
                          style={{ cursor: "pointer" }}
                        />
                        <div className="text-center mt-1">
                          <div>{item.photo}</div>
                          <div
                            className="text-muted"
                            style={{ fontSize: "0.85rem" }}
                          >
                            {item.year}
                          </div>
                        </div>
                      </div>
                    ))}
                  {visibleCount < displayedResults.length && (
                    <div className="text-center mt-3">
                      <button
                        className="btn btn-secondary mt-2"
                        onClick={() => setVisibleCount((prev) => prev + 100)}
                      >
                        Load more results
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          <button className="btn btn-secondary mt-2" onClick={onClose}>
            Close
          </button>
          <ImageModal
            isImageModalOpen={imageModalOpen}
            currentImg={
              imageModalOpen && currentIndex !== null
                ? displayedResults[currentIndex].photo
                : null
            }
            getFullImageUrl={getFullImageUrl}
            showPrev={showPrev}
            showNext={showNext}
            closeModal={closeModal}
            context="search"
            onOpenAlbum={() => {
              const item = displayedResults[currentIndex!];
              window.location.href = `/album/${item.year}/${item.album}/${item.photoIndex}`;
            }}
          />
        </div>
      </div>
    </div>
  );
}
