"use client";

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Renders assistant text as GitHub-flavoured markdown.
 * Styling lives in globals.css under the `.md` scope.
 */
export function MarkdownMessage({ content }: { content: string }) {
  return (
    <div className="md text-[0.95rem]">
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Open links in a new tab safely.
          a: (props) => (
            <a {...props} target="_blank" rel="noopener noreferrer" />
          ),
        }}
      >
        {content}
      </Markdown>
    </div>
  );
}
