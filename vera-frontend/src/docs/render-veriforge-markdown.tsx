import * as React from "react";

/**
 * Minimal forged-metal markdown renderer for VeriForge docs.
 * Supports: headings, paragraphs, lists, tables, fenced code, inline code, links, bold.
 */

function inline(text: string, keyBase: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const re =
    /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) {
      nodes.push(text.slice(last, m.index));
    }
    const token = m[0];
    if (token.startsWith("**")) {
      nodes.push(
        <strong key={`${keyBase}-b-${i++}`}>{token.slice(2, -2)}</strong>,
      );
    } else if (token.startsWith("`")) {
      nodes.push(
        <code key={`${keyBase}-c-${i++}`} className="vf-docs-code-inline">
          {token.slice(1, -1)}
        </code>,
      );
    } else if (token.startsWith("[")) {
      const linkMatch = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
      if (linkMatch) {
        const href = linkMatch[2];
        const internal =
          href.startsWith("../") ||
          href.startsWith("./") ||
          (!href.startsWith("http") && !href.startsWith("#") && !href.startsWith("/"));
        const resolved = internal
          ? `/veriforge/docs/${href
              .replace(/^\.\.\//, "")
              .replace(/^\.\//, "")
              .replace(/\/README\.md$/, "")
              .replace(/\.md$/, "")
              .replace(/\/$/, "")}`
          : href.startsWith("/")
            ? href
            : href;
        nodes.push(
          <a key={`${keyBase}-a-${i++}`} href={resolved}>
            {linkMatch[1]}
          </a>,
        );
      }
    }
    last = m.index + token.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

function parseTable(rows: string[]): React.ReactNode {
  const parseRow = (row: string) =>
    row
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((c) => c.trim());

  const header = parseRow(rows[0]);
  const body = rows.slice(2).map(parseRow);

  return (
    <div className="vf-docs-table-wrap" key={`table-${rows[0]}`}>
      <table className="vf-docs-table">
        <thead>
          <tr>
            {header.map((h, i) => (
              <th key={i}>{inline(h, `th-${i}`)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((cells, ri) => (
            <tr key={ri}>
              {cells.map((c, ci) => (
                <td key={ci}>{inline(c, `td-${ri}-${ci}`)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function renderVeriForgeMarkdown(md: string): React.ReactNode[] {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const out: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const buf: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].startsWith("```")) {
        buf.push(lines[i]);
        i += 1;
      }
      i += 1;
      out.push(
        <pre key={key++} className="vf-docs-pre" data-lang={lang || undefined}>
          <code>{buf.join("\n")}</code>
        </pre>,
      );
      continue;
    }

    if (line.trim().startsWith("|") && i + 1 < lines.length && /^\|?\s*-+/.test(lines[i + 1])) {
      const rows: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        rows.push(lines[i]);
        i += 1;
      }
      out.push(parseTable(rows));
      continue;
    }

    if (line.startsWith("# ")) {
      out.push(
        <h1 key={key++} className="vf-docs-h1">
          {inline(line.slice(2), `h1-${key}`)}
        </h1>,
      );
      i += 1;
      continue;
    }
    if (line.startsWith("## ")) {
      out.push(
        <h2 key={key++} className="vf-docs-h2">
          {inline(line.slice(3), `h2-${key}`)}
        </h2>,
      );
      i += 1;
      continue;
    }
    if (line.startsWith("### ")) {
      out.push(
        <h3 key={key++} className="vf-docs-h3">
          {inline(line.slice(4), `h3-${key}`)}
        </h3>,
      );
      i += 1;
      continue;
    }

    if (/^[-*] /.test(line) || /^\d+\. /.test(line)) {
      const items: string[] = [];
      const ordered = /^\d+\. /.test(line);
      while (
        i < lines.length &&
        (ordered ? /^\d+\. /.test(lines[i]) : /^[-*] /.test(lines[i]))
      ) {
        items.push(lines[i].replace(/^([-*] |\d+\. )/, ""));
        i += 1;
      }
      const ListTag = ordered ? "ol" : "ul";
      out.push(
        <ListTag key={key++} className="vf-docs-list">
          {items.map((item, idx) => (
            <li key={idx}>{inline(item, `li-${key}-${idx}`)}</li>
          ))}
        </ListTag>,
      );
      continue;
    }

    if (line.trim() === "" || line.trim() === "---") {
      if (line.trim() === "---") {
        out.push(<hr key={key++} className="vf-docs-hr" />);
      }
      i += 1;
      continue;
    }

    const buf: string[] = [line];
    i += 1;
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].startsWith("#") &&
      !lines[i].startsWith("```") &&
      !lines[i].trim().startsWith("|") &&
      !/^[-*] /.test(lines[i]) &&
      !/^\d+\. /.test(lines[i]) &&
      lines[i].trim() !== "---"
    ) {
      buf.push(lines[i]);
      i += 1;
    }
    out.push(
      <p key={key++} className="vf-docs-p">
        {inline(buf.join(" "), `p-${key}`)}
      </p>,
    );
  }

  return out;
}
