"use client";

import * as runtime from "react/jsx-runtime";
import { useMemo } from "react";
import { mdxComponents } from "@/components/mdx-components";

interface MdxContentProps {
  code: string;
}

function getMDXComponent(code: string) {
  const fn = new Function(code);
  return fn(runtime).default;
}

export function MdxContent({ code }: MdxContentProps) {
  const Component = useMemo(() => getMDXComponent(code), [code]);
  return (
    <article className="prose-cyber max-w-none">
      <Component components={mdxComponents} />
    </article>
  );
}
