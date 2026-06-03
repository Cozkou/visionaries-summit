"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Design } from "@/types";
import { useAppStore } from "@/store/useAppStore";

interface DesignCardProps {
  design: Design;
}

export function DesignCard({ design }: DesignCardProps) {
  const setSelectedDesign = useAppStore((s) => s.setSelectedDesign);

  return (
    <Card>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={design.imageUrl}
        alt={design.name}
        className="aspect-square w-full object-cover bg-muted"
      />
      <CardHeader>
        <CardTitle className="text-base">{design.name}</CardTitle>
        <CardDescription>{design.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm font-medium">
          Suggested retail: £{design.retailPrice}
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
