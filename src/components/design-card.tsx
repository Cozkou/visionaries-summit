"use client";

import Link from "next/link";

import { DesignImage } from "@/components/design-image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAppStore } from "@/store/useAppStore";
import type { Design } from "@/types";

interface DesignCardProps {
  design: Design;
  index?: number;
}

export function DesignCard({ design, index = 0 }: DesignCardProps) {
  const setSelectedDesign = useAppStore((s) => s.setSelectedDesign);
  const productType = useAppStore((s) => s.generationInputs.productType);

  return (
    <Card>
      <DesignImage
        design={design}
        index={index}
        productType={productType}
      />
      <p className="px-4 pb-2 text-xs text-muted-foreground">
        Illustrative photo (
        <a
          href="https://unsplash.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Unsplash
        </a>
        ) — not this SKU
      </p>
      <CardHeader>
        <CardTitle className="text-base">{design.name}</CardTitle>
        <CardDescription>{design.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm font-medium">
          Category avg retail (line_items.csv): £{design.retailPrice}
        </p>
      </CardContent>
      <CardFooter>
        <Link
          href={`/design/${design.id}`}
          onClick={() => setSelectedDesign(design)}
          className="block w-full"
        >
          <Button variant="outline" className="w-full" type="button">
            View Analysis
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
