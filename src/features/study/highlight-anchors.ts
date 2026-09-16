import type { HighlightRecord } from "@/types/study-flow";

const CONTEXT_LENGTH = 48;

export type TextSelectionAnchor = Pick<HighlightRecord, "text" | "start" | "end" | "prefix" | "suffix">;

export function createTextSelectionAnchor(content: string, start: number, end: number): TextSelectionAnchor | null {
  if (start < 0 || end <= start || end > content.length) return null;
  const text = content.slice(start, end);
  if (!text.trim()) return null;
  return {
    text,
    start,
    end,
    prefix: content.slice(Math.max(0, start - CONTEXT_LENGTH), start),
    suffix: content.slice(end, end + CONTEXT_LENGTH),
  };
}

/**
 * Converts a DOM Range into offsets in the source string without relying on
 * innerText (which changes line breaks and formatting). It supports selections
 * across inline elements such as bold text and existing marks.
 */
export function getSelectionAnchor(root: HTMLElement, range: Range, content: string): TextSelectionAnchor | null {
  if (!root.contains(range.startContainer) || !root.contains(range.endContainer) || range.collapsed) return null;
  const beforeStart = document.createRange();
  beforeStart.selectNodeContents(root);
  beforeStart.setEnd(range.startContainer, range.startOffset);
  const beforeEnd = document.createRange();
  beforeEnd.selectNodeContents(root);
  beforeEnd.setEnd(range.endContainer, range.endOffset);
  const startBeforeTrim = beforeStart.toString().length;
  const endBeforeTrim = beforeEnd.toString().length;
  const selected = content.slice(startBeforeTrim, endBeforeTrim);
  const leading = selected.match(/^\s*/)?.[0].length ?? 0;
  const trailing = selected.match(/\s*$/)?.[0].length ?? 0;
  return createTextSelectionAnchor(content, startBeforeTrim + leading, endBeforeTrim - trailing);
}

function occurrences(content: string, needle: string) {
  const positions: number[] = [];
  if (!needle) return positions;
  let index = content.indexOf(needle);
  while (index !== -1) {
    positions.push(index);
    index = content.indexOf(needle, index + Math.max(1, needle.length));
  }
  return positions;
}

export function resolveHighlight(content: string, highlight: HighlightRecord) {
  const exactOffset = highlight.start !== undefined && highlight.end !== undefined
    && content.slice(highlight.start, highlight.end) === highlight.text
    && (!highlight.prefix || content.slice(Math.max(0, highlight.start - highlight.prefix.length), highlight.start) === highlight.prefix)
    && (!highlight.suffix || content.slice(highlight.end, highlight.end + highlight.suffix.length) === highlight.suffix);
  if (exactOffset) return { start: highlight.start!, end: highlight.end!, status: "active" as const };

  const allMatches = occurrences(content, highlight.text);
  const contextualMatches = allMatches.filter((start) => {
    const end = start + highlight.text.length;
    const prefixMatches = !highlight.prefix || content.slice(Math.max(0, start - highlight.prefix.length), start) === highlight.prefix;
    const suffixMatches = !highlight.suffix || content.slice(end, end + highlight.suffix.length) === highlight.suffix;
    return prefixMatches && suffixMatches;
  });

  // A unique occurrence remains safe even when an edit changed its surrounding context.
  // Repeated text, however, needs the contextual anchors to prevent a wrong highlight.
  const matches = contextualMatches.length > 0 ? contextualMatches : allMatches.length === 1 ? allMatches : [];
  if (matches.length === 1) {
    const start = matches[0];
    return { start, end: start + highlight.text.length, status: "active" as const };
  }
  return { start: undefined, end: undefined, status: "orphaned" as const };
}

export function hasOverlap(anchor: Pick<HighlightRecord, "start" | "end">, highlights: HighlightRecord[]) {
  if (anchor.start === undefined || anchor.end === undefined) return false;
  return highlights.some((item) => item.status !== "orphaned" && item.start !== undefined && item.end !== undefined
    && anchor.start! < item.end && anchor.end! > item.start);
}
