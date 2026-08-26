import React, { useEffect, useRef, useState } from 'react';

interface MindMapNode {
  name: string;
  definition: string;
  description: string;
  children?: MindMapNode[];
}

interface DiagramRendererProps {
  type: 'diagram' | 'chart' | 'interactive' | 'mindmap';
  code: string;
  title: string;
}

// Vibrant color palettes per depth level
const LEVEL_STYLES: Array<{
  bg: string;
  border: string;
  shadow: string;
  hoverShadow: string;
  hoverBorder: string;
}> = [
  {
    bg: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
    border: '#34d399',
    shadow: '0 4px 20px rgba(16, 185, 129, 0.35)',
    hoverShadow: '0 6px 28px rgba(16, 185, 129, 0.55)',
    hoverBorder: '#6ee7b7',
  },
  {
    bg: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
    border: '#60a5fa',
    shadow: '0 4px 18px rgba(59, 130, 246, 0.3)',
    hoverShadow: '0 6px 26px rgba(59, 130, 246, 0.5)',
    hoverBorder: '#93c5fd',
  },
  {
    bg: 'linear-gradient(135deg, #7c3aed 0%, #c026d3 100%)',
    border: '#a78bfa',
    shadow: '0 4px 16px rgba(168, 85, 247, 0.25)',
    hoverShadow: '0 6px 24px rgba(168, 85, 247, 0.45)',
    hoverBorder: '#c4b5fd',
  },
  {
    bg: 'linear-gradient(135deg, #db2777 0%, #e11d48 100%)',
    border: '#f472b6',
    shadow: '0 4px 16px rgba(219, 39, 119, 0.25)',
    hoverShadow: '0 6px 24px rgba(219, 39, 119, 0.45)',
    hoverBorder: '#f9a8d4',
  },
  {
    bg: 'linear-gradient(135deg, #ea580c 0%, #d97706 100%)',
    border: '#fb923c',
    shadow: '0 4px 16px rgba(234, 88, 12, 0.25)',
    hoverShadow: '0 6px 24px rgba(234, 88, 12, 0.45)',
    hoverBorder: '#fdba74',
  },
];

function MindMapTreeNode({
  node,
  onNodeClick,
  level = 0,
}: {
  node: MindMapNode;
  onNodeClick: (n: MindMapNode) => void;
  level?: number;
}) {
  const [hovered, setHovered] = useState(false);
  const style = LEVEL_STYLES[Math.min(level, LEVEL_STYLES.length - 1)];

  const nodeCardStyle: React.CSSProperties = {
    background: style.bg,
    border: `2px solid ${hovered ? style.hoverBorder : style.border}`,
    borderRadius: '16px',
    padding: '16px 20px',
    width: '210px',
    textAlign: 'center' as const,
    cursor: 'pointer',
    boxShadow: hovered ? style.hoverShadow : style.shadow,
    transform: hovered ? 'scale(1.08)' : 'scale(1)',
    transition: 'all 0.25s ease',
    position: 'relative' as const,
    zIndex: 10,
    color: '#ffffff',
    userSelect: 'none' as const,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Node Card — fully clickable button with inline styles */}
      <div
        role="button"
        tabIndex={0}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onNodeClick(node);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onNodeClick(node);
          }
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={nodeCardStyle}
        title="Click to view concept details"
      >
        <div
          style={{
            fontWeight: 800,
            fontSize: '14px',
            lineHeight: '1.4',
            marginBottom: '4px',
            letterSpacing: '0.02em',
            wordBreak: 'break-word',
          }}
        >
          {node.name}
        </div>
        <div
          style={{
            fontSize: '11px',
            lineHeight: '1.5',
            opacity: 0.9,
            fontWeight: 600,
            wordBreak: 'break-word',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {node.definition}
        </div>
      </div>

      {/* Children branch */}
      {node.children && node.children.length > 0 && (
        <div style={{ marginTop: '32px', position: 'relative' }}>
          {/* Vertical connector from parent to horizontal rail */}
          <div
            style={{
              position: 'absolute',
              top: '-32px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '2px',
              height: '32px',
              backgroundColor: '#52525b',
            }}
          />

          <div style={{ display: 'flex', gap: '32px', position: 'relative' }}>
            {/* Horizontal rail connecting all children */}
            {node.children.length > 1 && (
              <div
                style={{
                  position: 'absolute',
                  top: '0',
                  left: '50%',
                  right: '50%',
                  height: '2px',
                  backgroundColor: '#52525b',
                }}
                ref={(el) => {
                  if (el && el.parentElement) {
                    const children = el.parentElement.querySelectorAll(':scope > [data-branch]');
                    if (children.length > 1) {
                      const first = children[0] as HTMLElement;
                      const last = children[children.length - 1] as HTMLElement;
                      const parentRect = el.parentElement.getBoundingClientRect();
                      const firstCenter = first.getBoundingClientRect().left + first.getBoundingClientRect().width / 2 - parentRect.left;
                      const lastCenter = last.getBoundingClientRect().left + last.getBoundingClientRect().width / 2 - parentRect.left;
                      el.style.left = `${firstCenter}px`;
                      el.style.right = `${parentRect.width - lastCenter}px`;
                    }
                  }
                }}
              />
            )}

            {node.children.map((child, idx) => (
              <div
                key={idx}
                data-branch
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  paddingTop: '16px',
                  position: 'relative',
                }}
              >
                {/* Vertical connector from rail to child */}
                <div
                  style={{
                    position: 'absolute',
                    top: '0',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '2px',
                    height: '16px',
                    backgroundColor: '#52525b',
                  }}
                />
                <MindMapTreeNode node={child} onNodeClick={onNodeClick} level={level + 1} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function DiagramRenderer({ type, code, title }: DiagramRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mermaidSvg, setMermaidSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<MindMapNode | null>(null);

  useEffect(() => {
    if (type !== 'diagram') return;

    let isMounted = true;
    const renderMermaid = async () => {
      try {
        setError(null);
        const { default: mermaid } = await import('mermaid');
        mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          securityLevel: 'loose',
          themeVariables: {
            background: '#09090b',
            primaryColor: '#10b981',
            primaryTextColor: '#f4f4f5',
            lineColor: '#3f3f46',
            actorBorder: '#10b981',
            signalColor: '#10b981',
            signalTextColor: '#f4f4f5',
          }
        });

        const id = `mermaid-${Math.random().toString(36).substring(2, 9)}`;
        let cleanCode = code
          .replace(/```mermaid/g, '')
          .replace(/```/g, '')
          .trim();

        // Preprocess Mermaid code to wrap unquoted labels containing parentheses in double quotes to prevent parser crashes
        cleanCode = cleanCode
          .replace(/([a-zA-Z0-9_-]+)\(\[\s*([^\]"\n]*\([^)]*\)[^\]"\n]*)\s*\]\)/g, '$1(["$2"])')
          .replace(/([a-zA-Z0-9_-]+)\[\(\s*([^)"\n]*\([^)]*\)[^)"\n]*)\s*\)\]/g, '$1([("$2")])')
          .replace(/([a-zA-Z0-9_-]+)\[\s*([^\]"\n]*\([^)]*\)[^\]"\n]*)\s*\]/g, '$1["$2"]')
          .replace(/([a-zA-Z0-9_-]+)\(\s*([^)"\n]*\([^)]*\)[^)"\n]*)\s*\)/g, '$1("$2")')
          .replace(/([a-zA-Z0-9_-]+)\{\s*([^}"\n]*\([^)]*\)[^}"\n]*)\s*\}/g, '$1{"$2"}');

        const { svg } = await mermaid.render(id, cleanCode);
        if (isMounted) {
          setMermaidSvg(svg);
        }
      } catch (err: any) {
        console.error('Mermaid render error:', err);
        if (isMounted) {
          setError(err.message || 'Failed to render Mermaid diagram.');
        }
      }
    };

    renderMermaid();
    return () => {
      isMounted = false;
    };
  }, [type, code]);

  if (type === 'diagram') {
    if (error) {
      return (
        <div className="p-4 bg-rose-950/20 border border-rose-900 rounded-xl text-rose-300 text-sm">
          <p className="font-semibold mb-1">Diagram render error:</p>
          <pre className="font-mono text-xs overflow-x-auto whitespace-pre-wrap">{error}</pre>
          <p className="text-zinc-500 text-xs mt-2">Raw Mermaid code:</p>
          <pre className="font-mono text-xs bg-zinc-950 p-3 rounded-lg border border-zinc-800 text-zinc-400 mt-1">
            {typeof code === 'object' ? JSON.stringify(code, null, 2) : String(code || '')}
          </pre>
        </div>
      );
    }

    if (!mermaidSvg) {
      return (
        <div className="flex flex-col items-center justify-center p-12 text-zinc-500 space-y-3">
          <svg className="animate-spin h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm font-medium">Generating SVG layout...</span>
        </div>
      );
    }

    return (
      <div
        ref={containerRef}
        className="w-full flex items-center justify-center overflow-x-auto p-4 bg-zinc-950/40 border border-zinc-800/80 rounded-xl"
        dangerouslySetInnerHTML={{ __html: mermaidSvg }}
      />
    );
  }

  if (type === 'chart') {
    let chartConfigStr = '';
    if (typeof code === 'object' && code !== null) {
      chartConfigStr = JSON.stringify(code);
    } else {
      chartConfigStr = String(code || '');
      if (chartConfigStr.includes('```json')) {
        chartConfigStr = chartConfigStr.substring(chartConfigStr.indexOf('```json') + 7);
        chartConfigStr = chartConfigStr.substring(0, chartConfigStr.lastIndexOf('```'));
      } else if (chartConfigStr.includes('```')) {
        chartConfigStr = chartConfigStr.substring(chartConfigStr.indexOf('```') + 3);
        chartConfigStr = chartConfigStr.substring(0, chartConfigStr.lastIndexOf('```'));
      }
      chartConfigStr = chartConfigStr.trim();
    }

    const iframeSrcDoc = `
      <!DOCTYPE html>
      <html>
      <head>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <style>
          body {
            background-color: #09090b;
            color: #f4f4f5;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            padding: 10px;
            box-sizing: border-box;
            overflow: hidden;
            font-family: ui-sans-serif, system-ui, sans-serif;
          }
          .chart-container {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          canvas {
            max-width: 100% !important;
            max-height: 100% !important;
          }
        </style>
      </head>
      <body>
        <div class="chart-container">
          <canvas id="canvasChart"></canvas>
        </div>
        <script>
          try {
            const config = ${chartConfigStr};
            if (config.options) {
              config.options.responsive = true;
              config.options.maintainAspectRatio = false;

              if (!config.options.plugins) config.options.plugins = {};
              if (!config.options.plugins.legend) config.options.plugins.legend = {};
              if (!config.options.plugins.legend.labels) config.options.plugins.legend.labels = {};
              config.options.plugins.legend.labels.color = '#e4e4e7';

              if (config.options.scales) {
                Object.keys(config.options.scales).forEach(scaleKey => {
                  const scale = config.options.scales[scaleKey];
                  if (!scale.grid) scale.grid = {};
                  scale.grid.color = '#27272a';
                  if (!scale.ticks) scale.ticks = {};
                  scale.ticks.color = '#a1a1aa';
                });
              }
            }
            new Chart(document.getElementById('canvasChart'), config);
          } catch (err) {
            document.body.innerHTML = '<div style="color: #f43f5e; padding: 20px; font-size: 14px;">Chart parse error: ' + err.message + '</div>';
          }
        </script>
      </body>
      </html>
    `;

    return (
      <div className="w-full bg-zinc-950/40 border border-zinc-800/80 rounded-xl overflow-hidden aspect-video relative">
        <iframe
          srcDoc={iframeSrcDoc}
          sandbox="allow-scripts"
          className="w-full h-full border-0 absolute inset-0"
          title={title}
        />
      </div>
    );
  }

  if (type === 'interactive') {
    let cleanHtml = '';
    if (typeof code === 'object' && code !== null) {
      cleanHtml = JSON.stringify(code);
    } else {
      cleanHtml = String(code || '');
      if (cleanHtml.includes('```html')) {
        cleanHtml = cleanHtml.substring(cleanHtml.indexOf('```html') + 7);
        cleanHtml = cleanHtml.substring(0, cleanHtml.lastIndexOf('```'));
      } else if (cleanHtml.includes('```')) {
        cleanHtml = cleanHtml.substring(cleanHtml.indexOf('```') + 3);
        cleanHtml = cleanHtml.substring(0, cleanHtml.lastIndexOf('```'));
      }
      cleanHtml = cleanHtml.trim();
    }

    return (
      <div className="w-full bg-zinc-950/40 border border-zinc-800/80 rounded-xl overflow-hidden aspect-video relative font-sans">
        <iframe
          srcDoc={cleanHtml}
          sandbox="allow-scripts"
          className="w-full h-full border-0 absolute inset-0"
          title={title}
        />
      </div>
    );
  }

  if (type === 'mindmap') {
    let rootNode: MindMapNode | null = null;
    try {
      if (typeof code === 'object' && code !== null) {
        rootNode = code as unknown as MindMapNode;
      } else {
        let cleanCode = String(code || '');
        if (cleanCode.includes('```json')) {
          cleanCode = cleanCode.substring(cleanCode.indexOf('```json') + 7);
          cleanCode = cleanCode.substring(0, cleanCode.lastIndexOf('```'));
        } else if (cleanCode.includes('```')) {
          cleanCode = cleanCode.substring(cleanCode.indexOf('```') + 3);
          cleanCode = cleanCode.substring(0, cleanCode.lastIndexOf('```'));
        }
        rootNode = JSON.parse(cleanCode.trim());
      }
    } catch (err: any) {
      return (
        <div className="p-4 bg-rose-950/20 border border-rose-900 rounded-xl text-rose-300 text-sm">
          <p className="font-semibold mb-1">Mind map parse error:</p>
          <pre className="font-mono text-xs overflow-x-auto whitespace-pre-wrap">{err.message}</pre>
          <p className="text-zinc-500 text-xs mt-2">Raw JSON code:</p>
          <pre className="font-mono text-xs bg-zinc-950 p-3 rounded-lg border border-zinc-800 text-zinc-400 mt-1">
            {typeof code === 'object' ? JSON.stringify(code, null, 2) : String(code || '')}
          </pre>
        </div>
      );
    }

    return (
      <div
        style={{
          width: '100%',
          background: 'rgba(9, 9, 11, 0.4)',
          border: '1px solid rgba(39, 39, 42, 0.8)',
          borderRadius: '12px',
          overflow: 'hidden',
          position: 'relative',
          minHeight: '450px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        {/* Mind Map Viewport */}
        <div
          style={{
            width: '100%',
            flex: 1,
            overflowX: 'auto',
            overflowY: 'auto',
            padding: '32px 16px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
          }}
        >
          {rootNode ? (
            <div style={{ margin: 'auto', paddingBottom: '24px' }}>
              <MindMapTreeNode node={rootNode} onNodeClick={setSelectedNode} />
            </div>
          ) : (
            <div style={{ color: '#71717a', fontSize: '14px', fontStyle: 'italic' }}>Empty Mind Map</div>
          )}
        </div>

        {/* Concept Detail Modal */}
        {selectedNode && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(6px)',
            }}
            onClick={() => setSelectedNode(null)}
          >
            <div
              style={{
                background: '#18181b',
                border: '1px solid rgba(63, 63, 70, 0.8)',
                borderRadius: '16px',
                padding: '24px',
                width: '100%',
                maxWidth: '520px',
                margin: '0 16px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
                animation: 'fadeInScale 0.2s ease-out',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '16px',
                  borderBottom: '1px solid #27272a',
                  paddingBottom: '12px',
                }}
              >
                <div>
                  <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#34d399', margin: 0 }}>
                    {selectedNode.name}
                  </h4>
                  <span
                    style={{
                      fontSize: '11px',
                      color: '#71717a',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      marginTop: '4px',
                      display: 'block',
                      fontFamily: 'ui-monospace, monospace',
                    }}
                  >
                    Concept Detail
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedNode(null)}
                  style={{
                    color: '#a1a1aa',
                    background: '#27272a',
                    border: 'none',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => { (e.target as HTMLElement).style.background = '#3f3f46'; }}
                  onMouseLeave={(e) => { (e.target as HTMLElement).style.background = '#27272a'; }}
                >
                  ✕
                </button>
              </div>

              {/* Definition */}
              <div style={{ marginBottom: '16px' }}>
                <h5
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#a1a1aa',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: '6px',
                    marginTop: 0,
                  }}
                >
                  Definition
                </h5>
                <p style={{ color: '#e4e4e7', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
                  {selectedNode.definition}
                </p>
              </div>

              {/* Description */}
              <div style={{ marginBottom: '24px' }}>
                <h5
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#a1a1aa',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: '6px',
                    marginTop: 0,
                  }}
                >
                  Description &amp; Application
                </h5>
                <p
                  style={{
                    color: '#d4d4d8',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {selectedNode.description}
                </p>
              </div>

              {/* Close button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setSelectedNode(null)}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '12px',
                    background: '#27272a',
                    border: 'none',
                    color: '#e4e4e7',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => { (e.target as HTMLElement).style.background = '#3f3f46'; }}
                  onMouseLeave={(e) => { (e.target as HTMLElement).style.background = '#27272a'; }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Keyframe animation injected via style tag */}
        <style>{`
          @keyframes fadeInScale {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
        `}</style>
      </div>
    );
  }

  return null;
}
