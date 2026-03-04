import { notFound } from "next/navigation";

// Static file extensions to skip - these should be served from public folder
const STATIC_EXTENSIONS = [
  ".svg",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".avif",
  ".ico",
  ".woff",
  ".woff2",
  ".ttf",
  ".eot",
  ".json",
  ".xml",
  ".txt",
  ".pdf",
  ".zip",
  ".html",
  ".css",
  ".js",
  ".map",
];

// Paths that should not be handled by Builder.io
const EXCLUDED_PATHS = ["api", "fonts", "images", "_next", "favicon.ico"];

function isStaticFile(path: string): boolean {
  const lowerPath = path.toLowerCase();
  return (
    STATIC_EXTENSIONS.some((ext) => lowerPath.endsWith(ext)) ||
    EXCLUDED_PATHS.some((excluded) => lowerPath.startsWith(excluded))
  );
}

export default async function CatchAllPage({
  params,
}: {
  params: { page?: string[] };
}) {
  const resolvedParams = await params;
  const urlPath =
    "/" + (resolvedParams.page ? resolvedParams.page.join("/") : "");

  // Skip static files and excluded paths - return 404 so Next.js serves from public folder
  if (isStaticFile(urlPath)) {
    notFound();
  }

  // For Builder.io pages, we need to dynamically render on client only
  // Using a simple redirect approach to avoid SSR issues with @builder.io/react
  return (
    <div
      data-builder-url={urlPath}
      data-builder-model="page"
      suppressHydrationWarning
    >
      {/* Builder.io content will be loaded client-side */}
    </div>
  );
}
