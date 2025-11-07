import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import Toast from "./Toast";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastContextProps {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [message, setMessage] = useState("");
  const [type, setType] = useState<ToastType>("info");

  const showToast = (msg: string, t: ToastType = "info") => {
    setMessage(msg);
    setType(t);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {message && <Toast message={message} type={type} />}
    </ToastContext.Provider>
  );
};

// Hook for easy access
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
};
