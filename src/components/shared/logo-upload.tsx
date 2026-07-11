"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Camera, Loader2 } from "lucide-react";
import Image from "next/image";

interface LogoUploadProps {
  value: string | null;
  onChange: (url: string) => void;
  size?: "sm" | "lg";
}

export function LogoUpload({ value, onChange, size = "lg" }: LogoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const dimension = size === "lg" ? "h-24 w-24" : "h-16 w-16";
  const iconSize = size === "lg" ? 24 : 18;

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (data.url) {
        onChange(data.url);
      }
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative flex items-center justify-center rounded-full border-2 border-dashed border-slate-200 bg-slate-50 transition hover:border-bayaro-blue hover:bg-blue-50",
          dimension,
          uploading && "pointer-events-none opacity-70",
        )}
      >
        {uploading ? (
          <Loader2 size={iconSize} className="animate-spin text-bayaro-blue" />
        ) : value ? (
          <Image
            src={value}
            alt="Logo"
            fill
            className="rounded-full object-cover"
          />
        ) : (
          <Camera size={iconSize} className="text-slate-400" />
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}
