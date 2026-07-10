import type { LocaleCode, PortableTextBlock } from "@claimsahayak/shared-types";
import { pickText } from "@/lib/locale";

/**
 * Renders any Rule Pack `PortableTextBlock[]` (V3 §3.4: "never raw HTML").
 * Dispatches purely on the block's own `kind` — a structural property every
 * Card body (and future content page) shares — never on card id, route, or
 * scheme, so this one renderer serves every card generically.
 */
export function PortableText({
  blocks,
  locale,
}: {
  readonly blocks: readonly PortableTextBlock[];
  readonly locale: LocaleCode;
}) {
  return (
    <div className="flex flex-col gap-s3">
      {blocks.map((block, index) => (
        <PortableTextBlockView key={index} block={block} locale={locale} />
      ))}
    </div>
  );
}

function PortableTextBlockView({
  block,
  locale,
}: {
  readonly block: PortableTextBlock;
  readonly locale: LocaleCode;
}) {
  switch (block.kind) {
    case "paragraph":
      return <p className="m-0 text-ink">{block.text ? pickText(block.text, locale) : ""}</p>;

    case "heading": {
      const Heading = block.level === 3 ? "h4" : "h3";
      return (
        <Heading className="m-0 font-display font-semibold text-ink">
          {block.text ? pickText(block.text, locale) : ""}
        </Heading>
      );
    }

    case "list":
      return (
        <ul className="m-0 flex list-disc flex-col gap-s1 pl-s5 text-ink">
          {(block.items ?? []).map((item, index) => (
            <li key={index}>{pickText(item, locale)}</li>
          ))}
        </ul>
      );

    case "summaryBox":
      return (
        <p className="m-0 rounded-control border border-peacock/30 bg-notice-bg px-s3 py-s2 font-semibold text-peacock">
          {block.text ? pickText(block.text, locale) : ""}
        </p>
      );

    case "warningChip":
      return (
        <p
          role="note"
          className="m-0 rounded-control border border-warn/30 bg-warn-bg px-s3 py-s2 text-warn"
        >
          {block.text ? pickText(block.text, locale) : ""}
        </p>
      );

    case "table":
      return (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <tbody>
              {(block.rows ?? []).map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b border-ink-soft/20">
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="py-s2 pr-s4 align-top text-ink">
                      {pickText(cell, locale)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}
