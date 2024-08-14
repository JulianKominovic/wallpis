import { cn } from "@/lib/utils";
import Image from "next/image";
import React from "react";

type Props = {
  children: React.ReactNode;
  src?: string;
  gradientStart:
    | `rgba(${string})`
    | `rgb(${string})`
    | `hsl(${string})`
    | `hsla(${string})`
    | `transparent`;
  gradientStop:
    | `rgba(${string})`
    | `rgb(${string})`
    | `hsl(${string})`
    | `hsla(${string})`
    | `transparent`;
  className?: string;
  style?: React.CSSProperties;
  priority?: boolean;
  loading?: "lazy" | "eager";
  imageClassName?: string;
} & React.HTMLAttributes<HTMLDivElement>;

const GradientSection = ({
  children,
  gradientStart,
  gradientStop,
  className,
  imageClassName,
  style,
  src,
  priority = false,
  loading = "lazy",
  ...rest
}: Props) => {
  return (
    <section
      className={cn("min-h-[100dvh] py-32 relative", className)}
      {...rest}
    >
      <div className="relative z-10">{children}</div>
      {src && (
        <Image
          alt="Gradient wallpaper"
          src={src}
          priority={priority}
          loading={loading}
          className={cn(
            "gradient-mask-t-50-d absolute top-0 left-0 opacity-30",
            imageClassName
          )}
          width={1920}
          height={1080}
        ></Image>
      )}
    </section>
  );
};

export default GradientSection;
