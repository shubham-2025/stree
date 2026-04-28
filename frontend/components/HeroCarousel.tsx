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
    <div className="relative h-full w-full overflow-hidden rounded-2xl">
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            i === current
              ? "z-10 opacity-100"
              : "z-0 opacity-0 pointer-events-none"
          }`}
          aria-hidden={i !== current}
        >
          <img
            src={slide.image}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover blur-xl scale-110 opacity-10 brightness-125 saturate-110"
          />
          <div className="absolute inset-0 bg-[#fce8e4]/65" aria-hidden />
          <img
            src={slide.image}
            alt={slide.title}
            className="relative z-10 h-full w-full object-contain"
            loading={i === 0 ? "eager" : "lazy"}
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
