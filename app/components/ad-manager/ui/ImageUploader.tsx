"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, X } from "lucide-react";

// Props definition for type safety
interface ImageUploaderProps {
  onFileChange: (file: File | null) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onFileChange }) => {
  const [preview, setPreview] = useState<string | null>(null);

  // Memoize the onDrop function to prevent re-renders
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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".png", ".jpg", ".gif"] },
    multiple: false,
  });

  // Function to remove the selected image
  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the dropzone click
    setPreview(null);
    onFileChange(null);
    // Revoke the object URL to free up memory
    if (preview) {
      URL.revokeObjectURL(preview);
    }
  };

  // If a preview exists, show the image and a remove button
  if (preview) {
    return (
      <div className="relative w-full h-48 rounded-lg overflow-hidden group">
        <img src={preview} alt="Ad creative preview" className="w-full h-full object-cover" />
        <button
          onClick={removeImage}
          className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Remove image"
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
        Drag and drop image or <span className="font-semibold text-violet-600">browse</span>
      </p>
    </div>
  );
};

export default ImageUploader;