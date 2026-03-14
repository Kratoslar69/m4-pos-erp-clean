import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Wrapper para contenido scrolleable dentro de diálogos
 * Uso: Envolver el contenido del formulario entre DialogHeader y DialogFooter
 */
export function DialogScrollableContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "overflow-y-auto overflow-x-hidden px-6 py-4 flex-1",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Header fijo del diálogo (no scrollea)
 */
export function DialogFixedHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "px-6 pt-6 pb-2 border-b shrink-0",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Footer fijo del diálogo (no scrollea)
 */
export function DialogFixedFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "px-6 pb-6 pt-4 border-t shrink-0 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
