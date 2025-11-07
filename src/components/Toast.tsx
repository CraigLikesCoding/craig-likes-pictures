import { useEffect, useState } from "react";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
  message: string;
  type?: ToastType; // Optional type — defaults to "info"
  duration?: number;
}

export default function Toast({
  message,
  type = "info",
  duration = 3000,
}: ToastProps) {
  const [show, setShow] = useState(true);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFade(true), duration - 500);
    const hideTimer = setTimeout(() => setShow(false), duration);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [duration]);

  if (!show) return null;

  // Define Bootstrap background class + emoji per toast type
  const typeStyles: Record<ToastType, { bg: string; icon: string }> = {
    success: { bg: "text-bg-success", icon: "✅" },
    error: { bg: "text-bg-danger", icon: "⚠️" },
    info: { bg: "text-bg-primary", icon: "ℹ️" },
    warning: { bg: "text-bg-warning", icon: "⚡" },
  };

  const { bg, icon } = typeStyles[type];

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
        className={`toast align-items-center ${bg} border-0 show`}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        <div className="d-flex">
          <div className="toast-body">
            {icon} {message}
          </div>
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
