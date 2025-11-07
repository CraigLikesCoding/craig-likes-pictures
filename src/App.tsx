import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AlbumList from "./components/AlbumList";
import AlbumViewer from "./components/AlbumViewer";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useEffect } from "react";
import { ToastProvider } from "./components/ToastContext";

function App() {
  useEffect(() => {
    const updateTheme = () => {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.body.classList.add("dark-mode");
      } else {
        document.body.classList.remove("dark-mode");
      }
    };

    updateTheme(); // set on load
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", updateTheme);

    return () =>
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .removeEventListener("change", updateTheme);
  }, []);

  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* List of albums in the current year */}
          <Route path="/" element={<AlbumList />} />

          {/* List of albums in a dynamic year */}
          <Route path="/year/:year" element={<AlbumList />} />

          {/* Album viewer */}
          <Route path="/album/:year/:albumFolder" element={<AlbumViewer />} />

          {/* Album viewer */}
          <Route
            path="/album/:year/:albumFolder/:imageIndexParam"
            element={<AlbumViewer />}
          />

          {/* Default route → redirect to / */}
          <Route path="*" element={<AlbumList />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
