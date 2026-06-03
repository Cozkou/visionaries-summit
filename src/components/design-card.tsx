"use client";

import Link from "next/link";

import { DesignDataPanel } from "@/components/design-data-panel";
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
}

export function DesignCard({ design }: DesignCardProps) {
  const setSelectedDesign = useAppStore((s) => s.setSelectedDesign);

  return (
    <Card>
      <DesignDataPanel design={design} className="max-w-none rounded-none border-0 border-b" />
      <CardHeader>
        <CardTitle className="text-base">{design.name}</CardTitle>
        <CardDescription className="line-clamp-3">{design.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm font-medium">
          Achieved retail (line_items.csv): £{design.retailPrice.toFixed(2)}
        </p>
        {design.sourceProductId && (
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {design.sourceProductId}
          </p>
        )}
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
