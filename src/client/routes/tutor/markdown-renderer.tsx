import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

function extractFrontmatter(raw: string): { frontmatter: Record<string, any> | null; body: string } {
  if (!raw) return { frontmatter: null, body: '' };
  const trimmedRaw = raw.trim();
  const match = trimmedRaw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { frontmatter: null, body: raw };

  const yamlBlock = match[1];
  const body = match[2];
  const fm: Record<string, any> = {};

  const lines = yamlBlock.split('\n');
  let currentKey = '';
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith('- ') && currentKey) {
      if (!Array.isArray(fm[currentKey])) fm[currentKey] = [];
      fm[currentKey].push(trimmed.substring(2).trim());
    } else {
      const colonIdx = line.indexOf(':');
      if (colonIdx > 0) {
        currentKey = line.substring(0, colonIdx).trim();
        const val = line.substring(colonIdx + 1).trim();
        if (val) {
          fm[currentKey] = val;
        } else {
          fm[currentKey] = [];
        }
      }
    }
  }

  return { frontmatter: fm, body };
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const { frontmatter, body } = extractFrontmatter(content);

  return (
    <div className={`prose prose-invert max-w-none text-zinc-200 text-sm md:text-base leading-relaxed ${className}`}>
      
      {/* Frontmatter Header Card */}
      {frontmatter && Object.keys(frontmatter).length > 0 && (
        <div className="mb-8 p-5 bg-zinc-950/90 border border-zinc-800/90 rounded-2xl shadow-lg not-prose space-y-3 font-sans">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-emerald-500/15 text-emerald-300 rounded-full text-xs font-medium border border-emerald-500/30">
                {frontmatter.type || 'Document'}
              </span>
              {frontmatter.title && (
                <span className="text-zinc-200 font-medium text-sm">
                  {frontmatter.title}
                </span>
              )}
            </div>
            {frontmatter.date && (
              <span className="text-zinc-500 text-xs font-mono">
                {frontmatter.date}
              </span>
            )}
          </div>

          {frontmatter.description && (
            <p className="text-xs text-zinc-400 leading-relaxed italic">
              {frontmatter.description}
            </p>
          )}

          {Array.isArray(frontmatter.tags) && frontmatter.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {frontmatter.tags.map((tag: string, idx: number) => (
                <span key={idx} className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-400 text-[11px] rounded-md">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {Array.isArray(frontmatter.aliases) && frontmatter.aliases.length > 0 && (
            <div className="text-[11px] text-zinc-500 flex items-center gap-1.5 pt-1">
              <span className="font-medium text-zinc-400">Aliases:</span>
              <span>{frontmatter.aliases.join(', ')}</span>
            </div>
          )}
        </div>
      )}

      {/* Markdown Body */}
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl md:text-3xl font-display font-light text-zinc-50 border-b border-zinc-800 pb-3 mt-6 mb-4 first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl md:text-2xl font-display font-light text-zinc-100 mt-6 mb-3 border-b border-zinc-800/60 pb-2">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg md:text-xl font-medium text-emerald-400 mt-5 mb-2">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-base font-semibold text-zinc-200 mt-4 mb-2">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="mb-4 text-zinc-300 leading-relaxed last:mb-0">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-outside pl-5 mb-4 space-y-1.5 text-zinc-300">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-outside pl-5 mb-4 space-y-1.5 text-zinc-300">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-zinc-300 leading-relaxed">
              {children}
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-emerald-500/80 bg-zinc-900/60 px-4 py-3 rounded-r-xl my-4 text-zinc-300 shadow-sm">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-6 rounded-xl border border-zinc-800 shadow-lg">
              <table className="w-full text-left text-sm border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-200 font-semibold">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-zinc-800/60 bg-zinc-950/40">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-zinc-800/40 transition-colors">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-4 py-3 text-xs uppercase tracking-wider text-emerald-400 font-medium">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-3 text-zinc-300">
              {children}
            </td>
          ),
          code: ({ className: codeClassName, children, ...props }) => {
            const isInline = !codeClassName && typeof children === 'string' && !children.includes('\n');
            if (isInline) {
              return (
                <code className="bg-zinc-800 text-emerald-300 px-1.5 py-0.5 rounded text-xs md:text-sm font-mono border border-zinc-700/50">
                  {children}
                </code>
              );
            }
            return (
              <div className="my-4 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950">
                <pre className="p-4 overflow-x-auto text-xs md:text-sm font-mono text-zinc-200">
                  <code {...props}>{children}</code>
                </pre>
              </div>
            );
          },
          hr: () => (
            <hr className="border-t border-zinc-800 my-6" />
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2 transition-colors"
            >
              {children}
            </a>
          ),
        }}
      >
        {body}
      </ReactMarkdown>
    </div>
  );
}
