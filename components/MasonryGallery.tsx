"use client";
import React, { forwardRef, useEffect } from "react";
import { Masonry, MasonryProps } from "react-plock";
import ImageCard from "./ImageCard";
import { useIntersectionObserver } from "usehooks-ts";

const LimitItem = ({
  src,
  gradientStop,
  gradientStart,
}: {
  src: string;
  gradientStop: string;
  gradientStart: string;
}) => {
  const { isIntersecting, ref } = useIntersectionObserver({
    threshold: 1,
    rootMargin: "100px",
  });
  useEffect(() => {
    if (isIntersecting) {
      document.body.style.setProperty("--background", gradientStop);
    }
  }, [isIntersecting, gradientStart, gradientStop]);
  return (
    <ImageCard
      style={{
        borderColor: gradientStop,
      }}
      className="w-full h-auto"
      ref={ref}
      src={src}
    />
  );
};

const MasonryGrid = <T,>({
  gradientStart,
  gradientStop,
  ...props
}: Omit<MasonryProps<string>, "render"> & {
  gradientStart: string;
  gradientStop: string;
}) => {
  return (
    <Masonry
      {...props}
      className="max-w-screen-lg mx-auto sm:px-8 px-4"
      config={{
        columns: [1, 2, 2],
        gap: [24, 12, 6],
        media: [640, 768, 1024],
      }}
      render={(item, idx) =>
        idx === 0 || idx === props.items.length - 1 ? (
          <LimitItem
            key={item}
            src={item}
            gradientStart={gradientStart}
            gradientStop={gradientStop}
          />
        ) : (
          <ImageCard
            style={{
              borderColor: gradientStop,
            }}
            className="w-full h-auto"
            src={item}
            key={item}
          />
        )
      }
    />
  );
};

export default MasonryGrid;
