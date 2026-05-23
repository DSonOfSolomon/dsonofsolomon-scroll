"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";

type WorkingOnMarqueeProps = {
  text: string;
};

type MarqueeStyle = CSSProperties & {
  "--marquee-distance"?: string;
};

export default function WorkingOnMarquee({ text }: WorkingOnMarqueeProps) {
  const frameRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    function measure() {
      const frame = frameRef.current;
      const textElement = textRef.current;

      if (!frame || !textElement) {
        return;
      }

      setDistance(Math.max(0, textElement.scrollWidth - frame.clientWidth));
    }

    measure();

    const observer = new ResizeObserver(measure);
    if (frameRef.current) {
      observer.observe(frameRef.current);
    }
    if (textRef.current) {
      observer.observe(textRef.current);
    }

    return () => observer.disconnect();
  }, [text]);

  const shouldSlide = distance > 8;
  const style: MarqueeStyle = shouldSlide
    ? { "--marquee-distance": `${distance}px` }
    : {};

  return (
    <span ref={frameRef} className="relative ml-2 min-w-0 flex-1 overflow-hidden">
      <span
        ref={textRef}
        style={style}
        className={`inline-block whitespace-nowrap text-black/80 ${
          shouldSlide
            ? "working-on-marquee animate-[working-on-slide_14s_linear_infinite]"
            : ""
        }`}
      >
        {text}
      </span>
    </span>
  );
}
