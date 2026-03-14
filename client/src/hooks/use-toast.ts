import { useState, useCallback } from "react";

export interface Toast {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((props: Toast) => {
    // Simple implementation - just show alert for now
    // In production, you would integrate with a toast library like sonner
    if (props.variant === "destructive") {
      alert(`Error: ${props.title}\n${props.description || ""}`);
    } else {
      alert(`${props.title}\n${props.description || ""}`);
    }
  }, []);

  return { toast, toasts };
}
