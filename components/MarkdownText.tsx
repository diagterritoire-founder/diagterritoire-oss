import {
  Fragment,
  ReactNode,
} from "react";

type MarkdownTextProps = {
  children: string;
};

function renderInline(
  text: string,
): ReactNode[] {
  const parts = text.split(
    /(\*\*[^*]+\*\*)/g,
  );

  return parts.map(
    (part, index) => {
      if (
        part.startsWith("**") &&
        part.endsWith("**")
      ) {
        return (
          <strong
            key={index}
            className="font-semibold text-slate-950"
          >
            {part.slice(2, -2)}
          </strong>
        );
      }

      return (
        <Fragment key={index}>
          {part}
        </Fragment>
      );
    },
  );
}

export default function MarkdownText({
  children,
}: MarkdownTextProps) {
  const lines = children.split("\n");

  return (
    <div className="space-y-3 text-sm leading-7 text-slate-800">
      {lines.map((line, index) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return null;
        }

        if (
          trimmed.startsWith("- ") ||
          trimmed.startsWith("* ")
        ) {
          return (
            <div
              key={index}
              className="flex gap-3 pl-3"
            >
              <span
                className="mt-[0.65rem] h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-600"
                aria-hidden="true"
              />

              <p>
                {renderInline(
                  trimmed.slice(2),
                )}
              </p>
            </div>
          );
        }

        if (trimmed.startsWith("#")) {
          const headingText =
            trimmed.replace(
              /^#{1,6}\s*/,
              "",
            );

          if (headingText !== trimmed) {
            return (
              <h3
                key={index}
                className="pt-2 text-lg font-bold text-slate-950"
              >
                {renderInline(
                  headingText,
                )}
              </h3>
            );
          }
        }

        const headingMatch =
          trimmed.match(
            /^\*\*(.+)\*\*$/,
          );

        if (headingMatch) {
          return (
            <h3
              key={index}
              className="pt-2 text-base font-bold text-slate-950"
            >
              {headingMatch[1]}
            </h3>
          );
        }

        return (
          <p key={index}>
            {renderInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
}