"use client";

import { useState, useEffect, useCallback } from "react";

interface Slide {
  image: string;
  title: string;
  subtitle: string;
}

interface HeroCarouselProps {
  slides: Slide[];
}

export default function HeroCarousel({ slides }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  // Auto-advance every 3 seconds
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(next, 3000);
    return () => clearInterval(timer);
  }, [next, slides.length]);

  if (slides.length === 0) return null;

  return (
    <div className="relative w-full h-full">
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            i === current ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover rounded-2xl"
          />
        </div>
      ))}

      {/* Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                i === current
                  ? "w-8 bg-brand"
                  : "w-2.5 bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
