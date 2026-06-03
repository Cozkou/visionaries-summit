"use client";

import { useEffect, useState } from "react";

import {
  pickFallbackImageUrl,
  placeholderUrl,
  picsumUrl,
} from "@/lib/images/remote-images";
import type { Design, ProductType } from "@/types";

interface DesignImageProps {
  design: Design;
  index?: number;
  productType?: ProductType;
  className?: string;
  fill?: boolean;
}

export function DesignImage({
  design,
  index = 0,
  productType = "Hoodie",
  className = "aspect-square w-full object-cover bg-muted",
  fill = false,
}: DesignImageProps) {
  const primary = design.imageUrl?.trim() || placeholderUrl(index);
  const [src, setSrc] = useState(primary);

  useEffect(() => {
    setSrc(design.imageUrl?.trim() || placeholderUrl(index));
  }, [design.imageUrl, index]);

  function handleError() {
    setSrc((current) => {
      const picsum = productType
        ? pickFallbackImageUrl(productType, design.id, index)
        : picsumUrl(design.id);
      if (current !== picsum) return picsum;
      return placeholderUrl(index);
    });
  }

  if (fill) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={design.name}
        className={className}
        onError={handleError}
        style={{ objectFit: "cover", width: "100%", height: "100%" }}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={design.name}
      className={className}
      onError={handleError}
    />
  );
}
