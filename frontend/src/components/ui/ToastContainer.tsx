"use client";

import { useUI } from "@/lib/store";
import { X } from "lucide-react";

export function ToastContainer() {
  const { toasts, removeToast } = useUI();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex min-w-[300px] items-center justify-between gap-3 rounded-lg px-4 py-3 shadow-lg ${
            toast.type === "error"
              ? "bg-red-500 text-white"
              : toast.type === "success"
                ? "bg-green-500 text-white"
                : "bg-blue-500 text-white"
          }`}
        >
          <span className="text-sm">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="flex-shrink-0 hover:opacity-70"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
