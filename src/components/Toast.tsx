// Toast.tsx
import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  duration?: number; // milliseconds
}

export default function Toast({ message, duration = 3000 }: ToastProps) {
  const [show, setShow] = useState(true);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    // start fade-out shortly before unmounting
    const fadeTimer = setTimeout(() => setFade(true), duration - 500); // fade 0.5s before removing
    const hideTimer = setTimeout(() => setShow(false), duration);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [duration]);

  if (!show) return null;

  return (
    <div
      className="toast-container position-fixed bottom-0 start-50 p-3"
      style={{
        zIndex: 1055,
        transition: "opacity 0.5s ease-in-out",
        opacity: fade ? 0 : 1,
        transform: "translateX(-50%)",
      }}
    >
      <div
        className="toast align-items-center text-bg-danger border-0 show"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        <div className="d-flex">
          <div className="toast-body">⚠️ {message}</div>
          <button
            type="button"
            className="btn-close btn-close-white me-2 m-auto"
            onClick={() => setShow(false)}
          ></button>
        </div>
      </div>
    </div>
  );
}
