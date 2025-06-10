"use client";

import { Button } from "@/components/ui/button";
import { Calendar, ExternalLink } from "lucide-react";
import type { ImageData } from "./types";
import { Separator } from "@/components/ui/separator";
import { H4, P, Small } from "@/components/ui/typography";

interface ImageDetailProps {
  image: ImageData;
}

export function ImageDetail({ image }: ImageDetailProps) {
  return (
    <div className="flex flex-col space-y-6 py-2 max-w-full w-full sm:max-w-lg mx-auto">
      {/* Image display */}
      <div className="overflow-hidden rounded-md bg-muted/30 flex justify-center items-center max-h-[60vh]">
        <img
          src={image.url}
          alt={image.summary || image.content || image.file_name}
          className="object-contain max-h-[30vh] w-auto max-w-full"
          loading="lazy"
        />
      </div>

      {/* Image metadata */}
      <div className="flex items-center text-sm text-muted-foreground">
        <Calendar className="h-4 w-4 mr-2" />
        <Small>
          Created: {new Date(image.created_at).toLocaleDateString()}
        </Small>
      </div>

      <Separator />

      {/* Content analysis */}
      <div>
        <H4 className="mb-2 text-sm">Content Analysis</H4>
        <div className="bg-muted/30 p-4 rounded-md">
          <P>{image.content}</P>
        </div>
      </div>

      {/* Summary */}
      <div>
        <H4 className="mb-2 text-sm">Summary</H4>
        <div className="bg-muted/30 p-4 rounded-md">
          <P>{image.summary}</P>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button variant="outline" size="sm" className="gap-2" asChild>
          <a href={image.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" />
            <span>Open Original</span>
          </a>
        </Button>
      </div>
    </div>
  );
}
