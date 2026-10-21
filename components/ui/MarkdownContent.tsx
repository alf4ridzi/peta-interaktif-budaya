"use client";

import React from "react";

interface MarkdownContentProps {
  content: string;
  className?: string;
}

function renderInline(text: string): React.ReactNode {
  // Matches **bold**, `code`, and *italic*
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let keyIndex = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith("**") && token.endsWith("**")) {
      parts.push(
        <strong key={`b-${keyIndex++}`} className="font-bold text-[var(--color-ink)]">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith("`") && token.endsWith("`")) {
      parts.push(
        <code
          key={`c-${keyIndex++}`}
          className="rounded bg-[var(--color-paper-2)] px-1 py-0.5 font-mono text-[11px] text-[var(--color-accent)] border border-[var(--color-rule-subtle)]"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith("*") && token.endsWith("*")) {
      parts.push(
        <em key={`i-${keyIndex++}`} className="italic text-[var(--color-ink-2)]">
          {token.slice(1, -1)}
        </em>
      );
    }
    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

export function MarkdownContent({ content, className = "" }: MarkdownContentProps) {
  if (!content) return null;

  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];

  let inList = false;
  let listItems: React.ReactNode[] = [];

  let inNumberedList = false;
  let numberedItems: React.ReactNode[] = [];

  let inBlockquote = false;
  let blockquoteLines: string[] = [];

  const flushList = () => {
    if (inList && listItems.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="my-2 space-y-1 pl-1">
          {listItems}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  const flushNumberedList = () => {
    if (inNumberedList && numberedItems.length > 0) {
      elements.push(
        <ol key={`ol-${elements.length}`} className="my-2 space-y-1 pl-4 list-decimal text-xs sm:text-sm">
          {numberedItems}
        </ol>
      );
      numberedItems = [];
      inNumberedList = false;
    }
  };

  const flushBlockquote = () => {
    if (inBlockquote && blockquoteLines.length > 0) {
      elements.push(
        <blockquote
          key={`bq-${elements.length}`}
          className="my-2.5 rounded-r border-l-3 border-[var(--color-accent)] bg-[var(--color-paper-2)]/70 px-3.5 py-2 text-xs italic text-[var(--color-ink-2)]"
        >
          {blockquoteLines.map((line, idx) => (
            <p key={idx} className="leading-relaxed">
              {renderInline(line)}
            </p>
          ))}
        </blockquote>
      );
      blockquoteLines = [];
      inBlockquote = false;
    }
  };

  const flushAll = () => {
    flushList();
    flushNumberedList();
    flushBlockquote();
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line) {
      flushAll();
      continue;
    }

    // Header 1: # Title
    if (line.startsWith("# ")) {
      flushAll();
      elements.push(
        <h1
          key={`h1-${elements.length}`}
          className="mt-3.5 mb-1.5 font-display text-lg font-bold text-[var(--color-ink)]"
        >
          {renderInline(line.slice(2))}
        </h1>
      );
      continue;
    }

    // Header 2: ## Subtitle
    if (line.startsWith("## ")) {
      flushAll();
      elements.push(
        <h2
          key={`h2-${elements.length}`}
          className="mt-3 mb-1 font-display text-base font-bold text-[var(--color-ink)]"
        >
          {renderInline(line.slice(3))}
        </h2>
      );
      continue;
    }

    // Header 3: ### Heading 3
    if (line.startsWith("### ")) {
      flushAll();
      elements.push(
        <h3
          key={`h3-${elements.length}`}
          className="mt-3 mb-1 font-display text-sm sm:text-base font-bold text-[var(--color-accent)]"
        >
          {renderInline(line.slice(4))}
        </h3>
      );
      continue;
    }

    // Header 4: #### Heading 4
    if (line.startsWith("#### ")) {
      flushAll();
      elements.push(
        <h4
          key={`h4-${elements.length}`}
          className="mt-2.5 mb-1 font-display text-xs sm:text-sm font-bold text-[var(--color-ink)]"
        >
          {renderInline(line.slice(5))}
        </h4>
      );
      continue;
    }

    // Blockquote: > Text
    if (line.startsWith("> ")) {
      flushList();
      flushNumberedList();
      inBlockquote = true;
      blockquoteLines.push(line.slice(2));
      continue;
    }

    // Bullet List Item: * Item or - Item
    if (line.startsWith("* ") || line.startsWith("- ")) {
      flushNumberedList();
      flushBlockquote();
      inList = true;
      listItems.push(
        <li
          key={`li-${listItems.length}`}
          className="flex items-start gap-2 text-xs sm:text-sm text-[var(--color-ink)] leading-relaxed"
        >
          <span className="mt-1 text-xs text-[var(--color-accent)] font-bold shrink-0">•</span>
          <span className="flex-1">{renderInline(line.slice(2))}</span>
        </li>
      );
      continue;
    }

    // Numbered List Item: 1. Item
    const numMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      flushList();
      flushBlockquote();
      inNumberedList = true;
      numberedItems.push(
        <li
          key={`oli-${numberedItems.length}`}
          className="text-xs sm:text-sm text-[var(--color-ink)] leading-relaxed pl-1"
        >
          {renderInline(numMatch[2])}
        </li>
      );
      continue;
    }

    // Regular Paragraph
    flushAll();
    elements.push(
      <p
        key={`p-${elements.length}`}
        className="my-1.5 text-xs sm:text-sm leading-relaxed text-[var(--color-ink)]"
      >
        {renderInline(line)}
      </p>
    );
  }

  flushAll();

  return <div className={`space-y-1 ${className}`}>{elements}</div>;
}

