import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BookOpen } from "lucide-react";
import { Link, redirect, useLoaderData, useNavigate } from "react-router-dom";
import Graph from "graphology";
import forceAtlas2 from "graphology-layout-forceatlas2";
import SigmaLib from "sigma";

import { useWikiConfig } from "@/client/wiki-config";
import { getTopicColor, type TopicAliasConfig } from "@/lib/wiki-config";
import type { GraphData, GraphNode } from "@/lib/wiki-shared";
import { fetchJson, isSetupRequiredResponse } from "../api";
import { RouteErrorBoundary } from "../route-error-boundary";

/* ── Colors & Folders ── */

const DEFAULT_NODE_COLOR = "#4d3d66";

const EDGE_DEFAULT = "rgba(168, 130, 255, 0.4)";
const EDGE_HOVER = "#a882ff";
const LABEL_COLOR = "#b3b3b3";
const BG_COLOR = "#09090b";

const FOLDER_COLORS: Record<string, string> = {
  Arts: "#e06c9f",
  Clippings: "#6ec6ca",
  Engineering: "#f4a261",
  Entrepreneurship: "#e76f51",
  Industry: "#2a9d8f",
  Innovation: "#a855f7",
  Interdisciplinary: "#06b6d4",
  Mathematics: "#eab308",
  Science: "#22c55e",
  Technology: "#3b82f6",
  raw: "#94a3b8",
  wiki: "#78716c",
  "(Root)": "#a882ff",
};

function getNodeColorFallback(backlinkCount: number): string {
  if (backlinkCount > 5) return "#691a88";
  if (backlinkCount > 0) return "#a882ff";
  return "#4d3d66";
}

function getFolderForSlug(slug: string): string {
  const parts = slug.split("/");
  if (parts.length <= 1) return "(Root)";
  return parts[0];
}

function getNodeColor(slug: string, backlinkCount: number): string {
  const rootFolder = getFolderForSlug(slug);
  return FOLDER_COLORS[rootFolder] || getNodeColorFallback(backlinkCount);
}

/* ── Folder Tree Logic ── */

interface FolderTreeNode {
  path: string;
  name: string;
  children: Map<string, FolderTreeNode>;
}

function buildFolderTree(data: GraphData): FolderTreeNode {
  const root: FolderTreeNode = { path: "", name: "(Root)", children: new Map() };
  
  // Collect all unique folder paths
  const paths = new Set<string>();
  for (const node of data.nodes) {
    const parts = node.slug.split("/");
    if (parts.length > 1) {
      // The last part is the file name, the rest is the folder path
      const folderParts = parts.slice(0, parts.length - 1);
      let currentPath = "";
      for (const part of folderParts) {
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        paths.add(currentPath);
      }
    } else {
      paths.add("(Root)");
    }
  }

  // Build the tree
  for (const path of Array.from(paths).sort()) {
    if (path === "(Root)") {
      root.children.set("(Root)", { path: "(Root)", name: "(Root)", children: new Map() });
      continue;
    }
    
    const parts = path.split("/");
    let current = root;
    let currentPath = "";
    
    for (const part of parts) {
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      if (!current.children.has(part)) {
        current.children.set(part, { path: currentPath, name: part, children: new Map() });
      }
      current = current.children.get(part)!;
    }
  }

  return root;
}

/* ── Graph building ── */

function buildGraph(
  data: GraphData,
  aliases: Record<string, TopicAliasConfig>,
): Graph {
  const graph = new Graph();

  for (const node of data.nodes) {
    const size = Math.max(5, Math.min(60, 5 + Math.pow(node.backlinkCount, 0.7) * 4));
    const color = getNodeColor(node.slug, node.backlinkCount);
    
    // Determine the folder for the node
    const parts = node.slug.split("/");
    const folderPath = parts.length > 1 ? parts.slice(0, parts.length - 1).join("/") : "(Root)";
    
    graph.addNode(node.slug, {
      label: node.title,
      size,
      color,
      originalColor: color,
      x: Math.random() * 1000,
      y: Math.random() * 1000,
      categories: node.categories,
      backlinkCount: node.backlinkCount,
      wordCount: node.wordCount,
      folderPath,
    });
  }

  for (const edge of data.edges) {
    if (graph.hasNode(edge.source) && graph.hasNode(edge.target)) {
      const key = `${edge.source}->${edge.target}`;
      if (!graph.hasEdge(key)) {
        const sourceColor = graph.getNodeAttribute(edge.source, "originalColor");
        // Convert hex to rgba for edges
        let edgeColor = EDGE_DEFAULT;
        if (sourceColor && sourceColor.startsWith("#")) {
          const r = parseInt(sourceColor.slice(1, 3), 16);
          const g = parseInt(sourceColor.slice(3, 5), 16);
          const b = parseInt(sourceColor.slice(5, 7), 16);
          edgeColor = `rgba(${r}, ${g}, ${b}, 0.4)`;
        }

        graph.addEdgeWithKey(key, edge.source, edge.target, {
          weight: edge.weight,
          size: 1.5,
          color: edgeColor,
          originalColor: edgeColor,
        });
      }
    }
  }

  return graph;
}

function runLayout(graph: Graph) {
  forceAtlas2.assign(graph, {
    iterations: 500,
    settings: {
      gravity: 1,
      scalingRatio: 10,
      barnesHutOptimize: true,
      strongGravityMode: true,
      slowDown: 3,
      outboundAttractionDistribution: false,
      linLogMode: true,
    },
  });
}

/* ── Folder Filter Panel ── */

function FolderFilterPanel({
  tree,
  enabledFolders,
  setEnabledFolders,
}: {
  tree: FolderTreeNode;
  enabledFolders: Set<string>;
  setEnabledFolders: React.Dispatch<React.SetStateAction<Set<string>>>;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleExpand = (path: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const getDescendantPaths = (node: FolderTreeNode): string[] => {
    let paths = [node.path];
    for (const child of Array.from(node.children.values())) {
      paths = paths.concat(getDescendantPaths(child));
    }
    return paths;
  };

  const toggleCheck = (node: FolderTreeNode, checked: boolean) => {
    const pathsToToggle = getDescendantPaths(node);
    setEnabledFolders(prev => {
      const next = new Set(prev);
      if (checked) {
        pathsToToggle.forEach(p => next.add(p));
      } else {
        pathsToToggle.forEach(p => next.delete(p));
      }
      return next;
    });
  };

  const renderNode = (node: FolderTreeNode, level: number) => {
    const hasChildren = node.children.size > 0;
    const isExpanded = expanded.has(node.path);
    const isChecked = enabledFolders.has(node.path);
    const topLevelFolder = node.path.split("/")[0] || "(Root)";
    const color = FOLDER_COLORS[topLevelFolder] || DEFAULT_NODE_COLOR;

    return (
      <div key={node.path} className="flex flex-col">
        <div 
          className="flex items-center gap-2 py-1.5 px-2 hover:bg-white/5 rounded-lg transition-colors group"
          style={{ paddingLeft: `${level * 12 + 8}px` }}
        >
          <div className="flex items-center justify-center w-4 h-4 shrink-0">
            {hasChildren && (
              <button
                type="button"
                onClick={() => toggleExpand(node.path)}
                className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors p-0.5"
              >
                <svg 
                  width="12" height="12" viewBox="0 0 12 12" fill="none"
                  className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                >
                  <path d="M4.5 2.5L8.5 6L4.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}
          </div>
          <input
            type="checkbox"
            checked={isChecked}
            onChange={(e) => toggleCheck(node, e.target.checked)}
            className="w-3.5 h-3.5 rounded-sm border appearance-none checked:bg-current bg-transparent transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--background)] shrink-0"
            style={{ color: color, borderColor: color }}
          />
          <span 
            className="text-[13px] text-[var(--foreground)] truncate select-none cursor-pointer flex-1 flex items-center gap-1.5"
            onClick={() => toggleCheck(node, !isChecked)}
          >
            <span style={{ color }}>📁</span> {node.name}
          </span>
        </div>
        {hasChildren && isExpanded && (
          <div className="flex flex-col">
            {Array.from(node.children.values()).map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative z-10 flex flex-col flex-1 surface-raised rounded-2xl shadow-xl overflow-hidden w-full sm:w-64 mt-4 min-h-0">
      <div className="px-4 py-2 border-b border-[var(--border)] bg-black/20 flex shrink-0 items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Folders</span>
      </div>
      <div className="overflow-y-auto p-2 scroll-smooth-touch">
        {Array.from(tree.children.values()).map(child => renderNode(child, 0))}
      </div>
    </div>
  );
}

/* ── Search ── */

function GraphSearch({
  graph,
  sigmaRef,
  onSelect,
}: {
  graph: Graph | null;
  sigmaRef: React.RefObject<SigmaLib | null>;
  onSelect: (slug: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ slug: string; label: string }[]>([]);

  useEffect(() => {
    if (!graph || !query.trim()) {
      setResults([]);
      return;
    }
    const q = query.toLowerCase();
    const matched: { slug: string; label: string }[] = [];
    graph.forEachNode((slug, attrs) => {
      // Don't search hidden nodes
      if (attrs.hidden) return;
      if (attrs.label?.toLowerCase().includes(q)) {
        matched.push({ slug, label: attrs.label });
      }
    });
    matched.sort((a, b) => a.label.localeCompare(b.label));
    setResults(matched.slice(0, 8));
  }, [graph, query]);

  const handleSelect = (slug: string) => {
    const sigma = sigmaRef.current;
    if (sigma) {
      const pos = sigma.getNodeDisplayData(slug);
      if (pos) {
        sigma.getCamera().animate({ x: pos.x, y: pos.y, ratio: 0.3 }, { duration: 400 });
      }
    }
    onSelect(slug);
    setQuery("");
    setResults([]);
  };

  return (
    <div className="relative z-20 w-full sm:w-64 shrink-0">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Find a concept..."
        className="surface w-full rounded-full px-4 py-2.5 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted-foreground)] shadow-sm focus:ring-2 focus:ring-[var(--teal)] transition-shadow"
      />
      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 surface-raised overflow-hidden rounded-2xl shadow-xl">
          {results.map((r) => (
            <button
              key={r.slug}
              type="button"
              onClick={() => handleSelect(r.slug)}
              className="block w-full px-4 py-2 text-left text-sm font-display text-[var(--foreground)] transition-colors hover:bg-[var(--teal-soft)]/50"
            >
              {r.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Info panel (shown when a node is focused) ── */

function InfoPanel({
  node,
  neighborNodes,
  onClose,
  onClickNeighbor,
  onNavigate,
  aliases,
}: {
  node: GraphNode;
  neighborNodes: GraphNode[];
  onClose: () => void;
  onClickNeighbor: (slug: string) => void;
  onNavigate: (slug: string) => void;
  aliases: Record<string, TopicAliasConfig>;
}) {
  const catColor = getNodeColor(node.slug, node.backlinkCount);

  return (
    <div
      className="surface-raised absolute left-4 right-4 z-20 overflow-hidden rounded-3xl sm:left-auto sm:right-8 sm:w-80 shadow-2xl border border-[var(--border)]"
      style={{ top: "calc(env(safe-area-inset-top) + 5rem)" }}
    >
      {/* Header */}
      <div className="border-b border-[var(--border)] px-5 py-4 bg-black/10">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate font-display text-[1.1rem] text-[var(--foreground)]">
              {node.title}
            </h3>
            <div className="mt-1.5 flex items-center gap-2">
              {node.categories.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: catColor, boxShadow: `0 0 8px ${catColor}80` }}
                  />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                    {node.categories[0]}
                  </span>
                </div>
              )}
              <span className="text-[10px] text-[var(--muted-foreground)]">
                {node.backlinkCount} · {node.wordCount}w
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full p-1 text-[var(--muted-foreground)] transition-colors hover:bg-[var(--secondary)] hover:text-[var(--foreground)]"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M3 3l8 8M11 3l-8 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Summary */}
      {node.summary && (
        <div className="border-b border-[var(--border)] px-5 py-3">
          <p className="max-h-32 overflow-y-auto text-[0.8rem] leading-relaxed text-[var(--muted-foreground)] scroll-smooth-touch">
            {node.summary}
          </p>
        </div>
      )}

      {/* Open article button */}
      <div className="border-b border-[var(--border)] px-5 py-3 bg-black/5">
        <button
          type="button"
          onClick={() => onNavigate(node.slug)}
          className="w-full rounded-full bg-[var(--foreground)] px-4 py-2 text-xs font-semibold text-[var(--background)] transition-[background,transform] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-[var(--teal)] active:scale-[0.97] shadow-md"
        >
          Open article →
        </button>
      </div>

      {/* Connections list */}
      {neighborNodes.length > 0 && (
        <div className="max-h-56 overflow-y-auto scroll-smooth-touch">
          <p className="px-5 pb-1.5 pt-3 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
            Connections ({neighborNodes.length})
          </p>
          {neighborNodes.map((n) => (
            <button
              key={n.slug}
              type="button"
              onClick={() => onClickNeighbor(n.slug)}
              className="group flex w-full items-center gap-2.5 px-5 py-2 text-left transition-colors hover:bg-white/10 focus:bg-white/10 outline-none"
            >
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full transition-all duration-200 group-hover:scale-125 group-focus:scale-125"
                style={{
                  backgroundColor: getNodeColor(n.slug, n.backlinkCount),
                  boxShadow: `0 0 6px ${getNodeColor(n.slug, n.backlinkCount)}60`,
                }}
              />
              <span className="truncate font-display text-[0.85rem] text-[var(--foreground)]">
                {n.title}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Tooltip ── */

function NodeTooltip({
  node,
  position,
  aliases,
}: {
  node: { label: string; categories: string[]; backlinkCount: number; wordCount: number; slug: string } | null;
  position: { x: number; y: number };
  aliases: Record<string, TopicAliasConfig>;
}) {
  if (!node) return null;
  const catColor = getNodeColor(node.slug, node.backlinkCount);

  return (
    <div
      className="surface-raised pointer-events-none absolute z-20 max-w-xs rounded-2xl px-4 py-2.5 shadow-lg"
      style={{ left: position.x + 14, top: position.y - 12 }}
    >
      <p className="font-display text-[0.95rem] text-[var(--foreground)]">{node.label}</p>
      <div className="mt-1 flex items-center gap-1.5 text-[0.7rem] font-medium text-[var(--muted-foreground)]">
        <span>{node.backlinkCount} connections</span>
        <span>·</span>
        <span>{node.wordCount} words</span>
      </div>
      {node.categories.length > 0 && (
        <div className="mt-1.5 flex items-center gap-1.5">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: catColor, boxShadow: `0 0 8px ${catColor}80` }}
          />
          <span className="text-[0.7rem] font-semibold text-[var(--muted-foreground)]">
            {node.categories.join(", ")}
          </span>
        </div>
      )}
    </div>
  );
}

/* ── Main Component ── */

export async function loader() {
  try {
    return await fetchJson<GraphData>("/api/graph");
  } catch (error) {
    if (isSetupRequiredResponse(error)) {
      throw redirect("/setup");
    }

    throw error;
  }
}

export function Component() {
  const data = useLoaderData() as GraphData;
  const config = useWikiConfig();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const sigmaRef = useRef<SigmaLib | null>(null);
  const graphRef = useRef<Graph | null>(null);
  const hoveredRef = useRef<string | null>(null);
  const selectedRef = useRef<string | null>(null);
  const focusedRef = useRef<string | null>(null);
  const [focusedSlug, setFocusedSlug] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{
    node: { label: string; categories: string[]; backlinkCount: number; wordCount: number; slug: string };
    position: { x: number; y: number };
  } | null>(null);
  const [graphReady, setGraphReady] = useState(false);

  // Folder state
  const folderTree = useMemo(() => buildFolderTree(data), [data]);
  const [enabledFolders, setEnabledFolders] = useState<Set<string>>(() => {
    // Initial state: all checked except raw, wiki, and Clippings
    const enabled = new Set<string>();
    const uncheckedRoots = new Set(["raw", "wiki", "Clippings"]);

    const traverse = (node: FolderTreeNode) => {
      // The top-level folder for this node
      const rootFolder = node.path.split("/")[0] || "(Root)";
      if (!uncheckedRoots.has(rootFolder)) {
        enabled.add(node.path);
      }
      for (const child of Array.from(node.children.values())) {
        traverse(child);
      }
    };
    
    for (const child of Array.from(folderTree.children.values())) {
      traverse(child);
    }
    return enabled;
  });

  // Re-apply folder filter whenever enabledFolders changes
  useEffect(() => {
    if (sigmaRef.current && graphReady) {
      sigmaRef.current.refresh();
    }
  }, [enabledFolders, graphReady]);

  // Build a lookup map for node data
  const nodeMap = useRef(new Map<string, GraphNode>());
  useEffect(() => {
    const map = new Map<string, GraphNode>();
    for (const n of data.nodes) map.set(n.slug, n);
    nodeMap.current = map;
  }, [data]);

  const focusedNode = focusedSlug ? nodeMap.current.get(focusedSlug) ?? null : null;
  const focusedNeighbors = focusedNode
    ? focusedNode.neighbors
      .map((s) => nodeMap.current.get(s))
      .filter((n): n is GraphNode => n !== undefined)
      .sort((a, b) => b.backlinkCount - a.backlinkCount)
    : [];

  const handleSearchSelect = useCallback((slug: string) => {
    focusedRef.current = slug;
    setFocusedSlug(slug);
    sigmaRef.current?.refresh();
  }, []);

  const handleInfoClose = useCallback(() => {
    focusedRef.current = null;
    setFocusedSlug(null);
    sigmaRef.current?.refresh();
  }, []);

  const handleInfoNeighborClick = useCallback((slug: string) => {
    focusedRef.current = slug;
    setFocusedSlug(slug);
    sigmaRef.current?.refresh();
    const pos = sigmaRef.current?.getNodeDisplayData(slug);
    if (pos) {
      sigmaRef.current?.getCamera().animate({ x: pos.x, y: pos.y, ratio: 0.5 }, { duration: 300 });
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const graph = buildGraph(data, config.categories.aliases);
    runLayout(graph);
    graphRef.current = graph;

    const sigma = new SigmaLib(graph, containerRef.current, {
      allowInvalidContainer: true,
      renderLabels: true,
      renderEdgeLabels: false,
      labelColor: { color: LABEL_COLOR },
      labelFont: '"Urbanist", -apple-system, BlinkMacSystemFont, sans-serif',
      labelSize: 11,
      labelWeight: "500",
      labelRenderedSizeThreshold: 6,
      defaultEdgeColor: EDGE_DEFAULT,
      defaultEdgeType: "line",
      defaultNodeColor: DEFAULT_NODE_COLOR,
      stagePadding: 60,
      edgeReducer(edge, edgeData) {
        const active = focusedRef.current ?? hoveredRef.current;
        const res = { ...edgeData };

        const src = graph.source(edge);
        const tgt = graph.target(edge);

        // Hide edge if either node is filtered out by folder
        const srcFolder = graph.getNodeAttribute(src, "folderPath") as string;
        const tgtFolder = graph.getNodeAttribute(tgt, "folderPath") as string;
        if (!enabledFolders.has(srcFolder) || !enabledFolders.has(tgtFolder)) {
           res.hidden = true;
           return res;
        }

        if (active) {
          if (src === active || tgt === active) {
            res.color = edgeData.originalColor || EDGE_HOVER;
            res.size = 1;
            res.hidden = false;
          } else {
            res.hidden = true;
          }
        }
        return res;
      },
      nodeReducer(node, nodeData) {
        const active = focusedRef.current ?? hoveredRef.current;
        const selected = selectedRef.current;
        const res = { ...nodeData };

        // Hide node if its folder is unchecked
        const nodeFolder = nodeData.folderPath as string;
        if (!enabledFolders.has(nodeFolder)) {
          res.hidden = true;
          return res;
        }

        if (active) {
          const isActive = node === active;
          const isNeighbor = graph.hasEdge(active, node) || graph.hasEdge(node, active);

          if (isActive) {
            res.highlighted = true;
            res.zIndex = 2;
            res.size = (res.size ?? 4) * 1.3;
          } else if (isNeighbor) {
            res.zIndex = 1;
            if (focusedRef.current) res.forceLabel = true;
          } else {
            res.color = "#2a2a2a";
            res.label = "";
            res.zIndex = 0;
          }
        }

        if (selected === node) {
          res.highlighted = true;
          res.zIndex = 3;
          res.size = (res.size ?? 4) * 1.4;
        }

        return res;
      },
    });

    sigmaRef.current = sigma;
    setGraphReady(true);

    sigma.on("enterNode", ({ node }) => {
      hoveredRef.current = node;
      sigma.refresh();
      containerRef.current!.style.cursor = "pointer";
    });

    sigma.on("leaveNode", () => {
      hoveredRef.current = null;
      sigma.refresh();
      setTooltip(null);
      containerRef.current!.style.cursor = "default";
    });

    sigma.on("clickNode", ({ node }) => {
      const focused = focusedRef.current;

      if (focused === node) {
        navigate(`/wiki/${node}`);
        return;
      }

      if (focused && (graph.hasEdge(focused, node) || graph.hasEdge(node, focused))) {
        navigate(`/wiki/${node}`);
        return;
      }

      focusedRef.current = node;
      setFocusedSlug(node);
      sigma.refresh();

      const pos = sigma.getNodeDisplayData(node);
      if (pos) {
        sigma.getCamera().animate({ x: pos.x, y: pos.y, ratio: 0.5 }, { duration: 300 });
      }
    });

    sigma.on("clickStage", () => {
      if (focusedRef.current) {
        focusedRef.current = null;
        setFocusedSlug(null);
        sigma.refresh();
      }
    });

    return () => {
      sigma.kill();
      sigmaRef.current = null;
      graphRef.current = null;
    };
  }, [config.categories.aliases, data, navigate, enabledFolders]);

  // Tooltip tracking
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const hovered = hoveredRef.current;
      if (!hovered || !graphRef.current || focusedRef.current) {
        if (!focusedRef.current) setTooltip(null);
        return;
      }
      const attrs = graphRef.current.getNodeAttributes(hovered);
      // Skip tooltip if node is hidden
      if (attrs.hidden) {
        setTooltip(null);
        return;
      }

      setTooltip({
        node: {
          label: attrs.label,
          categories: attrs.categories ?? [],
          backlinkCount: attrs.backlinkCount ?? 0,
          wordCount: attrs.wordCount ?? 0,
          slug: hovered,
        },
        position: { x: e.clientX, y: e.clientY },
      });
    };

    container.addEventListener("mousemove", handleMouseMove);
    return () => container.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col" style={{ background: BG_COLOR }}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[var(--background)]/85 backdrop-blur-md border-b border-[var(--border)] flex-none flex items-center justify-between gap-2 px-4 py-3 sm:px-6 sm:py-4 transition-all duration-300 relative">
        <Link to="/" className="font-display text-lg text-[var(--foreground)] sm:text-xl drop-shadow-md">
          {config.siteTitle}
        </Link>
        <Link
          to="/knowledge-center"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 text-sm font-semibold text-white transition-all px-5 py-2.5 rounded-xl shadow-lg hover:shadow-xl active:scale-95 overflow-hidden group z-10"
          style={{
            background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 40%, #10b981 100%)",
          }}
        >
          <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          <BookOpen className="h-4 w-4 relative z-10" />
          <span className="hidden sm:inline relative z-10">Knowledge Center</span>
        </Link>
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <span className="hidden items-center gap-2 rounded-lg bg-gradient-to-r from-purple-700 to-rose-600 px-4 py-2 text-sm text-white font-semibold sm:flex shadow-md border border-white/10">
            <span className="h-1.5 w-1.5 rounded-full bg-white shadow-sm" />
            <span className="font-bold tabular-nums">
              {data.nodes.length}
            </span>
            <span>{config.navigation.conceptsLabel}</span>
            <span>·</span>
            <span className="font-bold tabular-nums">
              {data.edges.length}
            </span>
            <span>{config.navigation.connectionsLabel}</span>
          </span>
          <Link
            to="/"
            className="rounded-lg text-white font-medium text-sm transition-all bg-gradient-to-r from-purple-700 to-rose-600 hover:from-purple-800 hover:to-rose-700 px-4 py-2 shadow-md hover:shadow-lg active:scale-95"
          >
            <span className="sm:hidden">Back</span>
            <span className="hidden sm:inline">{config.navigation.backToWikiLabel || "Back to Wiki"}</span>
          </Link>
        </div>
      </header>

      <div className="flex flex-col sm:flex-row flex-1 min-h-0 overflow-hidden p-4 gap-4">
        {/* Left Sidebar */}
        <div className="flex flex-col shrink-0 w-full sm:w-64 z-10">
          {/* Search */}
          <GraphSearch
            graph={graphReady ? graphRef.current : null}
            sigmaRef={sigmaRef}
            onSelect={handleSearchSelect}
          />
          
          {/* Folder Filter Panel */}
          <FolderFilterPanel
            tree={folderTree}
            enabledFolders={enabledFolders}
            setEnabledFolders={setEnabledFolders}
          />
        </div>

        {/* Sigma canvas in sub-window */}
        <div 
          className="flex-1 relative surface-raised rounded-2xl overflow-hidden shadow-2xl border border-[var(--border)] z-0"
          style={{ backgroundColor: BG_COLOR }}
        >
          <div ref={containerRef} className="h-full w-full" style={{ touchAction: 'none' }} />
        </div>
      </div>

      {/* Tooltip (only when not focused) */}
      {!focusedSlug && (
        <NodeTooltip
          node={tooltip?.node ?? null}
          position={tooltip?.position ?? { x: 0, y: 0 }}
          aliases={config.categories.aliases}
        />
      )}

      {/* Info panel (when focused) */}
      {focusedNode && (
        <InfoPanel
          node={focusedNode}
          neighborNodes={focusedNeighbors}
          onClose={handleInfoClose}
          onClickNeighbor={handleInfoNeighborClick}
          onNavigate={(slug) => navigate(`/wiki/${slug}`)}
          aliases={config.categories.aliases}
        />
      )}
    </div>
  );
}

export const ErrorBoundary = RouteErrorBoundary;
