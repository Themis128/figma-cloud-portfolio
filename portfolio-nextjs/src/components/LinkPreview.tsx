import type { LinkPreviewData } from "@shared/api";
import { AlertCircle, ExternalLink, Image as ImageIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { generatePreviewCached } from "@/lib/linkPreviewService";
import { cn } from "@/lib/utils";

interface LinkPreviewProps {
  url: string;
  className?: string;
  showImage?: boolean;
  compact?: boolean;
  onClick?: (url: string) => void;
}

/**
 * Link Preview Component
 * Displays rich previews of URLs with metadata, images, and social media tags
 */
export function LinkPreview({
  url,
  className,
  showImage = true,
  compact = false,
  onClick,
}: LinkPreviewProps) {
  const [preview, setPreview] = useState<LinkPreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadPreview = async () => {
      try {
        setLoading(true);
        setError(null);

        const previewData = await generatePreviewCached(url);

        if (isMounted) {
          setPreview(previewData);
          setError(previewData.error);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load preview");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (url) {
      loadPreview();
    }

    return () => {
      isMounted = false;
    };
  }, [url]);

  const handleClick = () => {
    if (onClick) {
      onClick(url);
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  if (loading) {
    return (
      <Card className={cn("w-full max-w-md", className)}>
        <CardContent className='p-4'>
          <div className='space-y-3'>
            <Skeleton className='h-4 w-3/4' />
            <Skeleton className='h-3 w-full' />
            <Skeleton className='h-3 w-2/3' />
            {showImage && <Skeleton className='h-32 w-full rounded' />}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !preview) {
    return (
      <Card
        className={cn(
          "w-full max-w-md cursor-pointer hover:shadow-md transition-shadow",
          className,
        )}
        onClick={handleClick}
      >
        <CardContent className='p-4'>
          <div className='flex items-center gap-3'>
            <AlertCircle className='w-5 h-5 text-red-500 flex-shrink-0' />
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-medium text-gray-900 truncate'>{new URL(url).hostname}</p>
              <p className='text-xs text-gray-500'>{error || "Preview unavailable"}</p>
            </div>
            <ExternalLink className='w-4 h-4 text-gray-400 flex-shrink-0' />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "w-full max-w-md cursor-pointer hover:shadow-md transition-shadow overflow-hidden",
        className,
      )}
      onClick={handleClick}
    >
      {showImage && preview.image && (
        <div className='relative h-32 bg-gray-100 overflow-hidden'>
          <Image
            src={preview.image}
            alt={preview.title}
            fill
            className='object-cover'
            onError={(e) => {
              // Hide broken images
              e.currentTarget.style.display = "none";
              e.currentTarget.nextElementSibling?.classList.remove("hidden");
            }}
          />
          <div className='hidden absolute inset-0 flex items-center justify-center bg-gray-100'>
            <ImageIcon className='w-8 h-8 text-gray-400' />
          </div>
        </div>
      )}

      <CardContent className={cn("p-4", compact && "p-3")}>
        <div className='space-y-2'>
          {/* Title and favicon */}
          <div className='flex items-start gap-2'>
            {preview.favicon && (
              <Image
                src={preview.favicon}
                alt=''
                width={16}
                height={16}
                className='shrink-0 mt-0.5'
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            )}
            <h3
              className={cn(
                "font-medium text-gray-900 leading-tight",
                compact ? "text-sm" : "text-base",
              )}
            >
              {preview.title}
            </h3>
          </div>

          {/* Description */}
          {preview.description && !compact && (
            <p className='text-sm text-gray-600 line-clamp-2'>{preview.description}</p>
          )}

          {/* Site name and type */}
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <span className='text-xs text-gray-500'>{preview.siteName}</span>
              {preview.type && preview.type !== "website" && (
                <Badge variant='secondary' className='text-xs px-1.5 py-0.5'>
                  {preview.type}
                </Badge>
              )}
            </div>
            <ExternalLink className='w-3 h-3 text-gray-400' />
          </div>

          {/* Social media indicators */}
          {(preview.openGraph || preview.twitter) && (
            <div className='flex gap-1'>
              {preview.openGraph && (
                <Badge variant='outline' className='text-xs px-1.5 py-0.5'>
                  Open Graph
                </Badge>
              )}
              {preview.twitter && (
                <Badge variant='outline' className='text-xs px-1.5 py-0.5'>
                  Twitter Card
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Compact version for use in lists or small spaces
 */
export function CompactLinkPreview(props: LinkPreviewProps) {
  return <LinkPreview {...props} compact showImage={false} />;
}

/**
 * Link Preview List Component
 * Displays multiple link previews in a grid or list
 */
interface LinkPreviewListProps {
  urls: string[];
  className?: string;
  compact?: boolean;
  maxItems?: number;
}

export function LinkPreviewList({
  urls,
  className,
  compact = false,
  maxItems,
}: LinkPreviewListProps) {
  const displayUrls = maxItems ? urls.slice(0, maxItems) : urls;

  return (
    <div
      className={cn(
        "grid gap-4",
        compact ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {displayUrls.map((url) => (
        <LinkPreview key={url} url={url} compact={compact} showImage={!compact} />
      ))}
    </div>
  );
}

export default LinkPreview;
