"use client";
import React, { forwardRef } from "react";
import { Card } from "./ui/card";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { DownloadIcon } from "@radix-ui/react-icons";

type Props = {
  src: string;
  loading?: "lazy" | "eager";
  priority?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

const ImageCard = forwardRef(
  ({ src, loading = "lazy", priority, className, style }: Props, ref) => {
    return (
      <a href={src} target="_blank" className="cursor-pointer" download>
        <Card
          className={cn("overflow-hidden group relative", className)}
          style={style}
          ref={ref as any}
        >
          <div className="group-hover:opacity-100 opacity-0 transition-opacity bg-black/70 backdrop-blur-sm h-full w-full absolute bottom-0 left-0 text-white flex justify-center items-center text-sm gap-2">
            <DownloadIcon /> Download 4K PNG
          </div>
          <Image
            loading={loading}
            priority={priority}
            src={src}
            width={600}
            height={600}
            quality={50}
            alt="image"
            className="h-full w-full object-cover"
          />
        </Card>
      </a>
    );
  }
);
ImageCard.displayName = "ImageCard";

export default ImageCard;
