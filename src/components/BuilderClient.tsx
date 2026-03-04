"use client";

import { BuilderComponent, builder } from "@builder.io/react";
import { useEffect, useState } from "react";

// Initialize Builder.io once
if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_BUILDER_API_KEY) {
  builder.init(process.env.NEXT_PUBLIC_BUILDER_API_KEY);
}

interface BuilderClientProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content?: any;
  model?: string;
  url?: string;
}

export function BuilderClient({
  content,
  model = "page",
  url,
}: BuilderClientProps) {
  const [fetchedContent, setFetchedContent] = useState(content);
  const [loading, setLoading] = useState(!content);

  useEffect(() => {
    if (!content && url) {
      builder
        .get(model, { url })
        .toPromise()
        .then((result) => {
          setFetchedContent(result);
          setLoading(false);
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error("Error fetching Builder.io content:", error);
          setLoading(false);
        });
    }
  }, [content, model, url]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!fetchedContent) {
    return null;
  }

  return <BuilderComponent model={model} content={fetchedContent} />;
}
