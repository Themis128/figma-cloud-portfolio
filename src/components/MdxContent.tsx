"use client";

import { useMemo } from "react";
import * as runtime from "react/jsx-runtime";
import { mdxComponents } from "@/components/mdx-components";

interface MdxContentProps {
  code: string;
}

function getMDXComponent(code: string) {
  const fn = new Function(code);
  return fn(runtime).default;
}

// Velite compiles MDX to a function string that returns a React component.
// useMemo ensures we only recompile when the code string changes.
// This is the standard velite MDX rendering pattern, not a render-time component creation.
/* eslint-disable react-hooks/static-components */
export function MdxContent({ code }: MdxContentProps) {
  const Component = useMemo(() => getMDXComponent(code), [code]);
  return (
    <article className="prose-cyber max-w-none">
      <Component components={mdxComponents} />
    </article>
  );
}
/* eslint-enable react-hooks/static-components */
