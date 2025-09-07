"use client";

import React, { useCallback, useState } from "react";
import { useDropzone, Accept } from "react-dropzone";
import { UploadCloud, X } from "lucide-react";

// Props definition for type safety
interface MediaUploaderProps {
  onFileChange: (file: File | null) => void;
  mediaType: "image" | "video";
}

const MediaUploader: React.FC<MediaUploaderProps> = ({ onFileChange, mediaType }) => {
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        onFileChange(file);
        setPreview(URL.createObjectURL(file));
      }
    },
    [onFileChange]
  );

  // --- THIS IS THE FIX ---
  // We define the 'Accept' object cleanly outside of the hook
  // to avoid the complex type inference issue.
  const acceptConfig: Accept = mediaType === 'image'
    ? { "image/*": [".jpeg", ".png", ".jpg", ".gif"] }
    : { "video/*": [".mp4", ".mov", ".avi"] };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptConfig, // Use the correctly typed object here
    multiple: false,
  });

  const removeMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    onFileChange(null);
    if (preview) {
      URL.revokeObjectURL(preview);
    }
  };

  // If a preview exists, show the correct preview (image or video)
  if (preview) {
    return (
      <div className="relative w-full h-48 rounded-lg overflow-hidden group">
        {mediaType === 'image' ? (
          <img src={preview} alt="Ad creative preview" className="w-full h-full object-cover" />
        ) : (
          <video src={preview} controls className="w-full h-full object-cover" />
        )}
        <button
          onClick={removeMedia}
          className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Remove media"
        >
          <X size={18} />
        </button>
      </div>
    );
  }

  // Otherwise, show the dropzone input
  return (
    <div
      {...getRootProps()}
      className={`w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
        isDragActive
          ? "border-violet-600 bg-violet-50"
          : "border-gray-300 bg-gray-50 hover:border-gray-400"
      }`}
    >
      <input {...getInputProps()} />
      <UploadCloud className="text-gray-400 mb-2" size={32} />
      <p className="text-gray-500 text-sm">
        Drag and drop {mediaType} or <span className="font-semibold text-violet-600">browse</span>
      </p>
    </div>
  );
};

export default MediaUploader;

