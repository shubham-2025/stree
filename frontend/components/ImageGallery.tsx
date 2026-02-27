"use client";

import { useState } from "react";

interface ImageGalleryProps {
  images: string[];
  title: string;
}

export default function ImageGallery({ images, title }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const displayImages =
    images.length > 0 ? images : ["/placeholder.svg"];

  return (
    <div className="flex flex-col gap-4">
      {/* Main image */}
      <div className="relative aspect-[3/4] bg-surface-alt rounded-xl overflow-hidden border border-border">
        <img
          src={displayImages[activeIndex]}
          alt={`${title} - Image ${activeIndex + 1}`}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Thumbnails */}
      {displayImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {displayImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`w-16 h-20 sm:w-20 sm:h-24 rounded-lg overflow-hidden border-2 shrink-0
                         transition-all ${
                           i === activeIndex
                             ? "border-brand ring-2 ring-brand/20"
                             : "border-border hover:border-muted"
                         }`}
            >
              <img
                src={img}
                alt={`Thumbnail ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

