import GradientSection from "../components/GradientSection";
import MasonryGallery from "../components/MasonryGallery";
import React from "react";
type Props = {
  children?: React.ReactNode;
  className: string;
  files: string[];
  gradientStart: string;
  gradientStop: string;
  loading?: "lazy" | "eager";
  priority?: boolean;
  title?: string;
  subtitle?: string;
  sectionBackgroundImageClassName?: string;
  backgroundImageSrc?: string;
};

const Gallery = ({
  className,
  files,
  backgroundImageSrc,
  gradientStart,
  gradientStop,
  loading = "lazy",
  priority = false,
  title,
  subtitle,
  sectionBackgroundImageClassName,
  children,
}: Props) => (
  <GradientSection
    imageClassName={sectionBackgroundImageClassName}
    className={className}
    // @ts-ignore
    gradientStart={gradientStart}
    // @ts-ignore
    gradientStop={gradientStop}
    src={backgroundImageSrc}
    loading={loading}
    priority={priority}
  >
    {children}
    {title && (
      <h2 className="text-4xl font-bold text-center mt-4 mb-8">{title}</h2>
    )}
    {subtitle && (
      <p className="text-xl opacity-60 font-medium text-center mb-8">
        {subtitle}
      </p>
    )}
    <MasonryGallery
      gradientStart={gradientStart}
      gradientStop={gradientStop}
      items={files}
      config={{
        columns: [1, 2, 3],
        gap: [24, 12, 6],
        media: [640, 768, 1024],
      }}
    />
  </GradientSection>
);

export default Gallery;
