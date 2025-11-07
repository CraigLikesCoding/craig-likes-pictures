import { useState } from "react";
import { Link } from "react-router-dom";
import useYearListJson from "../hooks/useYearListJson";
import { useEffect } from "react";
import usePhotosIndexJson from "../hooks/usePhotosIndexJson";
import Search from "./Search";

const Menu = () => {
  const { yearListData, error, isLoading } = useYearListJson();
  const [isOpen, setIsOpen] = useState(false);
  const {
    photosData,
    isLoading: isSearchLoading,
    error: searchError,
    loadPhotosIndex,
  } = usePhotosIndexJson();
  const [showSearchModal, setShowSearchModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"; // prevent background scroll
    } else {
      document.body.style.overflow = ""; // restore default scroll
    }
  }, [isOpen]);

  if (isLoading || isSearchLoading) {
    return <div className="spinner-border"></div>;
  }
  if (error) return <p>Error: {error}</p>;
  if (searchError) return <p>Error: {searchError}</p>;

  const handleSearchClick = async () => {
    await loadPhotosIndex(); // load JSON if not already loaded
    setShowSearchModal(true); // open search modal
  };

  return (
    <>
      {/* Hamburger / Close button */}
      {/* Hamburger button (always visible) */}
      <button
        onClick={() => setIsOpen(true)}
        className="btn btn-link position-fixed menu-toggle"
        style={{
          fontSize: "1.75rem",
          top: 0,
          right: 0,
          zIndex: 1049,
          color: document.body.classList.contains("dark-mode")
            ? "#fff"
            : "inherit",
        }}
        aria-label="Open menu"
      >
        <i className="bi bi-list fs-2"></i>
      </button>

      <div
        className={`menu-backdrop ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      ></div>

      {/* Sliding sidebar */}
      <nav
        className={`position-fixed top-0 end-0 h-100 bg-dark text-white p-3 shadow-lg d-flex flex-column`}
        style={{
          width: "250px",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s ease-in-out",
          zIndex: 1050,
          overflow: "hidden", // contain scroll area visually
        }}
      >
        {/* Header row: title + magnifier + close button */}
        <div
          className="d-flex align-items-center justify-content-between border-bottom border-secondary pb-2 mt-1 mb-3"
          style={{ minHeight: "40px" }}
        >
          <h5 className="m-0">Choose a Year:</h5>

          <div className="d-flex align-items-center gap-3">
            {/* Magnifier button */}
            <button
              className="btn btn-link text-white p-0"
              style={{ fontSize: "1.3rem" }}
              onClick={() => {
                setIsOpen(false);
                handleSearchClick();
              }}
              aria-label="Search all photos"
            >
              <i className="bi bi-search"></i>
            </button>

            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="btn btn-link text-white p-0"
              style={{ fontSize: "1.5rem" }}
              aria-label="Close menu"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
        </div>

        {/* Scrollable section */}
        <div
          style={{
            overflowY: "auto",
            flexGrow: 1,
            paddingRight: "4px", // prevent scrollbar overlap
          }}
        >
          <ul className="list-unstyled">
            {yearListData?.map((year) => (
              <li key={year} className="mb-2">
                <Link
                  to={`/year/${year}`}
                  className="text-white text-decoration-none"
                  onClick={() => setIsOpen(false)}
                >
                  {year}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Optional background overlay when menu is open */}
      {isOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark opacity-50"
          style={{ zIndex: 1049 }}
          onClick={() => setIsOpen(false)}
        />
      )}

      {showSearchModal && (
        <Search
          photosData={photosData}
          isLoading={isLoading}
          error={error}
          onClose={() => setShowSearchModal(false)}
        />
      )}
    </>
  );
};

export default Menu;
