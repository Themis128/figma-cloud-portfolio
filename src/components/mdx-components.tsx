import type { ComponentPropsWithoutRef } from "react";

function MdxH1({ children, ...props }: ComponentPropsWithoutRef<"h1">) {
  return (
    <h1
      className="mt-10 mb-4 text-3xl font-bold tracking-tight text-foreground"
      {...props}
    >
      {children}
    </h1>
  );
}

function MdxH2({ children, ...props }: ComponentPropsWithoutRef<"h2">) {
  return (
    <h2
      className="mt-8 mb-3 text-2xl font-semibold tracking-tight text-foreground border-b border-cyan-400/20 pb-2"
      {...props}
    >
      {children}
    </h2>
  );
}

function MdxH3({ children, ...props }: ComponentPropsWithoutRef<"h3">) {
  return (
    <h3
      className="mt-6 mb-2 text-xl font-semibold text-foreground"
      {...props}
    >
      {children}
    </h3>
  );
}

function MdxP(props: ComponentPropsWithoutRef<"p">) {
  return <p className="mb-4 leading-7 text-muted-foreground" {...props} />;
}

function MdxA(props: ComponentPropsWithoutRef<"a">) {
  return (
    <a
      className="text-cyan-400 underline underline-offset-4 decoration-cyan-400/30 hover:decoration-cyan-400 transition-colors"
      target={props.href?.startsWith("http") ? "_blank" : undefined}
      rel={props.href?.startsWith("http") ? "noopener noreferrer" : undefined}
      {...props}
    />
  );
}

function MdxUl(props: ComponentPropsWithoutRef<"ul">) {
  return <ul className="mb-4 ml-6 list-disc text-muted-foreground [&>li]:mt-1" {...props} />;
}

function MdxOl(props: ComponentPropsWithoutRef<"ol">) {
  return <ol className="mb-4 ml-6 list-decimal text-muted-foreground [&>li]:mt-1" {...props} />;
}

function MdxBlockquote(props: ComponentPropsWithoutRef<"blockquote">) {
  return (
    <blockquote
      className="mb-4 border-l-4 border-cyan-400/50 pl-4 italic text-muted-foreground bg-cyan-400/5 py-2 rounded-r-lg"
      {...props}
    />
  );
}

function MdxCode(props: ComponentPropsWithoutRef<"code">) {
  // Inline code (not inside a pre block)
  if (!props.className?.includes("language-")) {
    return (
      <code
        className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-cyan-400"
        {...props}
      />
    );
  }
  return <code {...props} />;
}

function MdxPre(props: ComponentPropsWithoutRef<"pre">) {
  return (
    <pre
      className="mb-4 overflow-x-auto rounded-lg border border-border/30 bg-slate-950 p-4 font-mono text-sm [&>code]:bg-transparent [&>code]:p-0"
      {...props}
    />
  );
}

function MdxHr(props: ComponentPropsWithoutRef<"hr">) {
  return (
    <hr
      className="my-8 border-none h-px bg-linear-to-r from-transparent via-cyan-400/30 to-transparent"
      {...props}
    />
  );
}

function MdxTable(props: ComponentPropsWithoutRef<"table">) {
  return (
    <div className="mb-4 overflow-x-auto rounded-lg border border-border/30">
      <table className="w-full text-sm" {...props} />
    </div>
  );
}

function MdxTh(props: ComponentPropsWithoutRef<"th">) {
  return (
    <th
      className="border-b border-border/30 bg-muted/50 px-4 py-2 text-left font-semibold text-foreground"
      {...props}
    />
  );
}

function MdxTd(props: ComponentPropsWithoutRef<"td">) {
  return (
    <td
      className="border-b border-border/10 px-4 py-2 text-muted-foreground"
      {...props}
    />
  );
}

// MDX images use <img> since next/image requires static dimensions
// which aren't available from MDX content at build time.
// aspect-ratio + w-full prevents CLS while images load.
function MdxImg({ alt, ...props }: ComponentPropsWithoutRef<"img">) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt={alt ?? "Blog content image"}
      className="mb-4 rounded-lg border border-border/20 w-full h-auto"
      loading="lazy"
      decoding="async"
      {...props}
    />
  );
}

export const mdxComponents = {
  h1: MdxH1,
  h2: MdxH2,
  h3: MdxH3,
  p: MdxP,
  a: MdxA,
  ul: MdxUl,
  ol: MdxOl,
  blockquote: MdxBlockquote,
  code: MdxCode,
  pre: MdxPre,
  hr: MdxHr,
  table: MdxTable,
  th: MdxTh,
  td: MdxTd,
  img: MdxImg,
};
