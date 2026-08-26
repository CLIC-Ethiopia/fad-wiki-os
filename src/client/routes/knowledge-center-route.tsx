import { useState, useMemo, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { BookOpen, FileText, Share2, ArrowLeft, Search, RefreshCw, GraduationCap } from "lucide-react";
import { useWikiConfig } from "@/client/wiki-config";
import { RouteErrorBoundary } from "../route-error-boundary";

/* ── Tab & Card Data ── */

interface KnowledgeCard {
  name: string;
  icon: string;
  description: string;
  color: string;
  span?: string; // bento grid span class
}

const STEAM_CARDS: KnowledgeCard[] = [
  {
    name: "Science",
    icon: "🔬",
    description: "Biology, Physics, Cognitive Science and the foundational disciplines that explain the natural world through observation and experimentation.",
    color: "from-blue-500 to-cyan-500",
    span: "col-span-2 row-span-2",
  },
  {
    name: "Technology",
    icon: "💻",
    description: "Software, AI, computing systems and the tools that extend human capability in the digital age.",
    color: "from-violet-500 to-purple-600",
    span: "col-span-1 row-span-1",
  },
  {
    name: "Engineering",
    icon: "⚙️",
    description: "Design, systems thinking, and the applied science of building solutions to real-world problems.",
    color: "from-amber-500 to-orange-500",
    span: "col-span-1 row-span-2",
  },
  {
    name: "Arts",
    icon: "🎨",
    description: "Creative expression, design thinking, and the humanities that fuel culture and innovation.",
    color: "from-rose-500 to-pink-500",
    span: "col-span-1 row-span-1",
  },
  {
    name: "Mathematics",
    icon: "📐",
    description: "The universal language of patterns, logic, and quantitative reasoning that underpins every STEAM discipline.",
    color: "from-emerald-500 to-teal-500",
    span: "col-span-2 row-span-1",
  },
];

const INDUSTRY_CARDS: KnowledgeCard[] = [
  { name: "Agriculture", icon: "🌾", description: "Farming, agribusiness, and sustainable agricultural technologies.", color: "from-green-500 to-emerald-600" },
  { name: "Construction", icon: "🏗️", description: "Building technologies, architectural designs, and civil systems.", color: "from-amber-600 to-yellow-500" },
  { name: "Education", icon: "📚", description: "Pedagogy, edtech platforms, and modern teaching methodologies.", color: "from-blue-500 to-indigo-500" },
  { name: "Energy", icon: "⚡", description: "Renewable energy, power systems, and sustainable grid setups.", color: "from-yellow-400 to-orange-500" },
  { name: "Environment", icon: "🌍", description: "Ecology, conservation efforts, and environmental engineering.", color: "from-emerald-500 to-green-600" },
  { name: "Finance", icon: "💰", description: "Fintech, economics, investment, and wealth management structures.", color: "from-sky-500 to-blue-600" },
  { name: "Governance", icon: "🏛️", description: "Civic technologies, institutional rules, and public policy.", color: "from-slate-500 to-zinc-600" },
  { name: "Healthcare", icon: "🏥", description: "Medical technologies, digital health, and diagnostic innovations.", color: "from-red-500 to-rose-600" },
  { name: "Infrastructure", icon: "🌉", description: "Civil networks, utilities, and smart urban systems.", color: "from-stone-500 to-neutral-600" },
  { name: "Lifestyle", icon: "🛍️", description: "Consumer technologies, hospitality, and wellbeing trends.", color: "from-pink-500 to-fuchsia-500" },
  { name: "Manufacturing", icon: "🏭", description: "Industry 4.0, smart factory systems, and supply chains.", color: "from-zinc-500 to-gray-600" },
  { name: "Mobility", icon: "🚗", description: "Smart mobility, electric vehicles, and future transport logistics.", color: "from-cyan-500 to-teal-600" },
];

const INNOVATION_CARDS: KnowledgeCard[] = [
  { name: "Disruptive Innovation", icon: "💡", description: "Technologies and business models that displace established market leaders.", color: "from-amber-500 to-yellow-500", span: "col-span-2 row-span-1" },
  { name: "Innovation Strategy", icon: "🎯", description: "Frameworks for systematic innovation management and strategic planning.", color: "from-violet-500 to-indigo-500", span: "col-span-1 row-span-1" },
  { name: "Design Thinking", icon: "🧩", description: "Human-centred problem solving and iterative prototyping methodology.", color: "from-rose-500 to-pink-500" },
  { name: "Open Innovation", icon: "🌐", description: "Collaborative R&D, crowdsourcing, and ecosystem-driven breakthroughs.", color: "from-blue-500 to-cyan-500" },
  { name: "R&D Management", icon: "🧪", description: "Research pipeline governance, technology readiness, and IP strategy.", color: "from-emerald-500 to-teal-500", span: "col-span-2 row-span-1" },
  { name: "Technology Transfer", icon: "🔄", description: "Moving innovations from labs to markets through licensing and spin-offs.", color: "from-orange-500 to-red-500" },
];

const ENTREPRENEURSHIP_CARDS: KnowledgeCard[] = [
  { name: "Lean Startup", icon: "🚀", description: "Build-measure-learn cycles, MVPs, and validated learning methodology.", color: "from-green-500 to-emerald-500", span: "col-span-1 row-span-2" },
  { name: "Product Management", icon: "📋", description: "Product strategy, roadmapping, user research and go-to-market planning.", color: "from-blue-500 to-indigo-500", span: "col-span-2 row-span-1" },
  { name: "Venture Capital", icon: "💎", description: "Fundraising, term sheets, investor relations and equity financing.", color: "from-purple-500 to-fuchsia-500" },
  { name: "Business Models", icon: "📊", description: "Revenue architecture, pricing strategies and value proposition design.", color: "from-amber-500 to-orange-500" },
  { name: "Growth Strategy", icon: "📈", description: "Scaling operations, market expansion and sustainable growth frameworks.", color: "from-cyan-500 to-blue-500", span: "col-span-2 row-span-1" },
  { name: "Startup Ecosystem", icon: "🌱", description: "Accelerators, incubators, mentorship networks and founder communities.", color: "from-rose-500 to-pink-500" },
];

type TabKey = "STEAM" | "INNOVATION" | "ENTREPRENEURSHIP" | "INDUSTRY";

const TABS: { key: TabKey; label: string; icon: string; color: string }[] = [
  { key: "STEAM", label: "STEAM", icon: "🔬", color: "from-blue-500 to-cyan-500" },
  { key: "INNOVATION", label: "INNOVATION", icon: "💡", color: "from-amber-500 to-yellow-500" },
  { key: "ENTREPRENEURSHIP", label: "ENTREPRENEURSHIP", icon: "🚀", color: "from-purple-500 to-fuchsia-500" },
  { key: "INDUSTRY", label: "INDUSTRY", icon: "🏭", color: "from-emerald-500 to-teal-500" },
];

const TAB_CARDS: Record<TabKey, KnowledgeCard[]> = {
  STEAM: STEAM_CARDS,
  INNOVATION: INNOVATION_CARDS,
  ENTREPRENEURSHIP: ENTREPRENEURSHIP_CARDS,
  INDUSTRY: INDUSTRY_CARDS,
};

/* ── Bento Card Component ── */

function BentoCard({ card, index, onSelect }: { card: KnowledgeCard; index: number; onSelect: () => void }) {
  const staggerClass = `stagger-${Math.min(index + 1, 8)}`;
  return (
    <div
      onClick={onSelect}
      className={`animate-in group relative overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-900/70 backdrop-blur-sm p-6 transition-all duration-300 hover:border-zinc-600/80 hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1 cursor-pointer h-full flex flex-col justify-between ${card.span || ""} ${staggerClass}`}
    >
      {/* Gradient accent top bar */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.color} opacity-60 group-hover:opacity-100 transition-opacity`}
      />
      {/* Background glow */}
      <div
        className={`absolute -top-12 -right-12 w-36 h-36 rounded-full bg-gradient-to-br ${card.color} opacity-[0.06] group-hover:opacity-[0.12] blur-3xl transition-opacity duration-500`}
      />

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-start gap-3 mb-3">
          <span className="text-3xl group-hover:scale-110 transition-transform duration-300 origin-bottom-left">
            {card.icon}
          </span>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white mb-1 tracking-tight">
              {card.name}
            </h3>
          </div>
        </div>
        <p className="text-sm text-zinc-400 leading-relaxed flex-1">
          {card.description}
        </p>
        <div className="mt-4 flex items-center gap-1.5 text-xs font-medium">
          <span className={`bg-gradient-to-r ${card.color} bg-clip-text text-transparent`}>
            Explore →
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Interactive Force-Directed Local Graph Component ── */

interface SimNode {
  slug: string;
  title: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
}

interface SimEdge {
  source: string;
  target: string;
  weight: number;
}

function LocalFolderGraph({
  nodes,
  edges,
  selectedSlug,
  onSelectNode,
  colorGradient,
}: {
  nodes: any[];
  edges: any[];
  selectedSlug: string | null;
  onSelectNode: (slug: string) => void;
  colorGradient: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Simulation state refs to avoid React renders during 60fps canvas ticks
  const simNodesRef = useRef<SimNode[]>([]);
  const simEdgesRef = useRef<SimEdge[]>([]);
  const panRef = useRef({ x: 0, y: 0 });
  const zoomRef = useRef(1);
  const isDraggingCanvasRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const draggedNodeRef = useRef<SimNode | null>(null);
  const hoveredNodeRef = useRef<SimNode | null>(null);

  // Map theme colors
  const gradientColor = useMemo(() => {
    if (colorGradient.includes("blue")) return "#3b82f6";
    if (colorGradient.includes("amber")) return "#d97706";
    if (colorGradient.includes("violet")) return "#8b5cf6";
    if (colorGradient.includes("rose")) return "#f43f5e";
    return "#10b981"; // default emerald
  }, [colorGradient]);

  // Sync / Initialize simulation nodes
  useEffect(() => {
    const existingMap = new Map(simNodesRef.current.map(n => [n.slug, n]));
    
    simNodesRef.current = nodes.map((n, i) => {
      const existing = existingMap.get(n.slug);
      if (existing) return existing;

      // Circle layout for initial positioning
      const angle = (i / (nodes.length || 1)) * Math.PI * 2;
      const radius = 60 + Math.random() * 30;
      return {
        slug: n.slug,
        title: n.title,
        x: 250 + Math.cos(angle) * radius,
        y: 180 + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
        size: Math.max(6, Math.min(15, 6 + (n.backlinkCount || 0) * 0.8)),
      };
    });

    simEdgesRef.current = edges.map(e => ({
      source: e.source,
      target: e.target,
      weight: e.weight || 1,
    }));
  }, [nodes, edges]);

  // Loop simulation & Canvas Drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animId: number;

    const tick = () => {
      const simNodes = simNodesRef.current;
      const simEdges = simEdgesRef.current;

      // 1. Repulsion force between all nodes
      for (let i = 0; i < simNodes.length; i++) {
        for (let j = i + 1; j < simNodes.length; j++) {
          const dx = simNodes[j].x - simNodes[i].x;
          const dy = simNodes[j].y - simNodes[i].y;
          const distSq = dx * dx + dy * dy || 1;
          const dist = Math.sqrt(distSq);
          if (dist < 180) {
            const force = 180 / distSq;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            simNodes[i].vx -= fx;
            simNodes[i].vy -= fy;
            simNodes[j].vx += fx;
            simNodes[j].vy += fy;
          }
        }
      }

      // 2. Attraction along connected edges
      simEdges.forEach(edge => {
        const s = simNodes.find(n => n.slug === edge.source);
        const t = simNodes.find(n => n.slug === edge.target);
        if (s && t) {
          const dx = t.x - s.x;
          const dy = t.y - s.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const targetDist = 90;
          const force = 0.04 * (dist - targetDist);
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          s.vx += fx;
          s.vy += fy;
          t.vx -= fx;
          t.vy -= fy;
        }
      });

      // 3. Center gravitational force & drag update
      const cx = canvas.width / (2 * (window.devicePixelRatio || 1));
      const cy = canvas.height / (2 * (window.devicePixelRatio || 1));
      
      simNodes.forEach(node => {
        if (node !== draggedNodeRef.current) {
          const dx = cx - node.x;
          const dy = cy - node.y;
          node.vx += dx * 0.006;
          node.vy += dy * 0.006;

          node.x += node.vx;
          node.y += node.vy;
        }
        node.vx *= 0.75;
        node.vy *= 0.75;
      });

      // 4. Render
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const dpr = window.devicePixelRatio || 1;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.save();
        ctx.scale(dpr, dpr);
        ctx.translate(panRef.current.x, panRef.current.y);
        ctx.scale(zoomRef.current, zoomRef.current);

        // Draw connections
        ctx.strokeStyle = "rgba(255, 255, 255, 0.07)";
        ctx.lineWidth = 0.8;
        simEdges.forEach(edge => {
          const s = simNodes.find(n => n.slug === edge.source);
          const t = simNodes.find(n => n.slug === edge.target);
          if (s && t) {
            ctx.beginPath();
            ctx.moveTo(s.x, s.y);
            ctx.lineTo(t.x, t.y);
            ctx.stroke();
          }
        });

        // Draw nodes
        simNodes.forEach(node => {
          const isSelected = node.slug === selectedSlug;
          const isHovered = hoveredNodeRef.current?.slug === node.slug;

          // Glowing border for selected or hovered
          if (isSelected || isHovered) {
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.size + 4, 0, Math.PI * 2);
            ctx.fillStyle = isSelected ? `${gradientColor}30` : "rgba(255, 255, 255, 0.06)";
            ctx.fill();
          }

          // Node body
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
          ctx.fillStyle = isSelected ? gradientColor : "rgba(255, 255, 255, 0.25)";
          ctx.fill();

          // Node Title
          ctx.font = `500 11px sans-serif`;
          ctx.fillStyle = isSelected ? "#ffffff" : "rgba(255, 255, 255, 0.65)";
          ctx.textAlign = "center";
          ctx.fillText(node.title, node.x, node.y + node.size + 14);
        });

        ctx.restore();
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [selectedSlug, gradientColor]);

  // Resize canvas handler
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !containerRef.current) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = containerRef.current!.clientWidth * dpr;
      canvas.height = containerRef.current!.clientHeight * dpr;
      canvas.style.width = `${containerRef.current!.clientWidth}px`;
      canvas.style.height = `${containerRef.current!.clientHeight}px`;

      // Set initial pan to center the graph
      panRef.current = {
        x: (containerRef.current!.clientWidth - 500) / 2,
        y: (containerRef.current!.clientHeight - 360) / 2,
      };
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Canvas Mouse Actions
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left - panRef.current.x) / zoomRef.current;
    const my = (e.clientY - rect.top - panRef.current.y) / zoomRef.current;

    // Detect click inside node
    const hitNode = simNodesRef.current.find(node => {
      const dx = node.x - mx;
      const dy = node.y - my;
      return dx * dx + dy * dy < (node.size + 6) * (node.size + 6);
    });

    if (hitNode) {
      draggedNodeRef.current = hitNode;
    } else {
      isDraggingCanvasRef.current = true;
      dragStartRef.current = {
        x: e.clientX - panRef.current.x,
        y: e.clientY - dragStartRef.current.y,
      };
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left - panRef.current.x) / zoomRef.current;
    const my = (e.clientY - rect.top - panRef.current.y) / zoomRef.current;

    if (draggedNodeRef.current) {
      draggedNodeRef.current.x = mx;
      draggedNodeRef.current.y = my;
      draggedNodeRef.current.vx = 0;
      draggedNodeRef.current.vy = 0;
    } else if (isDraggingCanvasRef.current) {
      panRef.current = {
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y,
      };
    } else {
      const hitNode = simNodesRef.current.find(node => {
        const dx = node.x - mx;
        const dy = node.y - my;
        return dx * dx + dy * dy < (node.size + 6) * (node.size + 6);
      });
      hoveredNodeRef.current = hitNode || null;
      canvas.style.cursor = hitNode ? "pointer" : "grab";
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (draggedNodeRef.current) {
      onSelectNode(draggedNodeRef.current.slug);
      draggedNodeRef.current = null;
    }
    isDraggingCanvasRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    const nextZoom = zoomRef.current - e.deltaY * 0.001;
    zoomRef.current = Math.max(0.3, Math.min(2.5, nextZoom));
  };

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-zinc-950/40 rounded-2xl border border-zinc-800/40">
      <div className="absolute top-4 left-4 z-10 bg-zinc-900/80 border border-zinc-800 px-3 py-1.5 rounded-lg text-xs text-zinc-400 select-none pointer-events-none backdrop-blur-sm flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Drag nodes or pan canvas. Scroll to zoom.
      </div>
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className="w-full h-full block"
      />
    </div>
  );
}

/* ── Main Component ── */

export function Component() {
  const config = useWikiConfig();
  const [activeTab, setActiveTab] = useState<TabKey>("STEAM");
  const [search, setSearch] = useState("");

  // Category page states
  const [selectedDomain, setSelectedDomain] = useState<KnowledgeCard | null>(null);
  const [selectedFileSlug, setSelectedFileSlug] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<any | null>(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const [detailTab, setDetailTab] = useState<"content" | "graph">("content");
  
  // File search in sidebar
  const [sidebarQuery, setSidebarQuery] = useState("");

  // Graph data state
  const [graphData, setGraphData] = useState<{ nodes: any[]; edges: any[] } | null>(null);
  const [loadingGraph, setLoadingGraph] = useState(false);

  // Fetch initial graph database
  useEffect(() => {
    setLoadingGraph(true);
    fetch("/api/graph")
      .then((res) => res.json())
      .then((data) => {
        setGraphData(data);
        setLoadingGraph(false);
      })
      .catch((err) => {
        console.error("Error fetching graph data:", err);
        setLoadingGraph(false);
      });
  }, []);

  const activeCards = TAB_CARDS[activeTab];

  const filteredCards = useMemo(() => {
    if (!search.trim()) return activeCards;
    const q = search.toLowerCase();
    return activeCards.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
    );
  }, [activeCards, search]);

  // Compute pages belonging to the active domain category
  const domainPages = useMemo(() => {
    if (!graphData || !selectedDomain) return [];
    let target = selectedDomain.name.toLowerCase();

    // Fallbacks for Innovation and Entrepreneurship placeholders to parent folder matching
    if (activeTab === "INNOVATION") {
      target = "innovation";
    } else if (activeTab === "ENTREPRENEURSHIP") {
      target = "entrepreneurship";
    }

    return graphData.nodes.filter((node) => {
      const matchesCategory = node.categories.some((cat) => cat.toLowerCase() === target);
      const matchesFolder = node.slug.toLowerCase().startsWith(target + "/");
      return matchesCategory || matchesFolder;
    });
  }, [graphData, selectedDomain, activeTab]);

  // Filter local sidebar files
  const filteredSidebarPages = useMemo(() => {
    if (!sidebarQuery.trim()) return domainPages;
    const q = sidebarQuery.toLowerCase();
    return domainPages.filter(p => p.title.toLowerCase().includes(q) || p.summary.toLowerCase().includes(q));
  }, [domainPages, sidebarQuery]);

  // Automatically select the first file when the domain changes
  useEffect(() => {
    if (domainPages.length > 0) {
      // Prioritize matching specific concepts (e.g. card name matches concept file slug)
      const matched = domainPages.find(p => 
        p.title.toLowerCase() === selectedDomain?.name.toLowerCase() || 
        p.slug.toLowerCase().endsWith(selectedDomain?.name.toLowerCase().replace(/\s+/g, "-"))
      );
      setSelectedFileSlug(matched ? matched.slug : domainPages[0].slug);
    } else {
      setSelectedFileSlug(null);
    }
  }, [domainPages, selectedDomain]);

  // Fetch page content
  useEffect(() => {
    if (!selectedFileSlug) {
      setFileContent(null);
      return;
    }
    setLoadingContent(true);
    fetch(`/api/wiki/${selectedFileSlug}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load page content");
        return res.json();
      })
      .then((data) => {
        setFileContent(data);
        setLoadingContent(false);
      })
      .catch((err) => {
        console.error(err);
        setLoadingContent(false);
      });
  }, [selectedFileSlug]);

  // Filter edges for local folder graph
  const localEdges = useMemo(() => {
    if (!graphData || domainPages.length === 0) return [];
    const localSlugs = new Set(domainPages.map(p => p.slug));
    return graphData.edges.filter(e => localSlugs.has(e.source) && localSlugs.has(e.target));
  }, [graphData, domainPages]);

  return (
    <div className="flex h-screen w-full flex-col bg-zinc-950 text-zinc-50 overflow-hidden">
      {/* ── Sticky Centered Header ── */}
      <header className="shrink-0 z-50 bg-zinc-950/85 backdrop-blur-md border-b border-zinc-800/60 flex items-center justify-between gap-2 px-4 py-3 sm:px-6 transition-all duration-300 relative">
        <Link to="/" className="font-display text-lg text-white sm:text-xl">
          {config.siteTitle} <span className="text-zinc-500 font-light ml-2">Knowledge Center</span>
        </Link>
        
        <Link
          to="/knowledge-center"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 text-sm font-semibold text-white transition-all px-5 py-2.5 rounded-xl shadow-lg hover:shadow-xl active:scale-95 overflow-hidden group z-10"
          style={{
            background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 40%, #10b981 100%)",
          }}
          onClick={(e) => {
            e.preventDefault();
            setSelectedDomain(null);
            setSelectedFileSlug(null);
          }}
        >
          <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          <BookOpen className="h-4 w-4 relative z-10" />
          <span className="hidden sm:inline relative z-10">Knowledge Center</span>
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <Link
            to="/"
            className="rounded-lg text-white font-medium text-sm transition-all bg-gradient-to-r from-purple-700 to-rose-600 hover:from-purple-800 hover:to-rose-700 px-4 py-2 shadow-md hover:shadow-lg active:scale-95"
          >
            {config.navigation.backToWikiLabel || "Back to Wiki"}
          </Link>
          <Link
            to="/tutor"
            className="rounded-lg text-white font-medium text-sm transition-all bg-gradient-to-r from-purple-700 to-rose-600 hover:from-purple-800 hover:to-rose-700 px-4 py-2 shadow-md hover:shadow-lg active:scale-95"
          >
            Fad.Tutor
          </Link>
        </div>
      </header>

      {/* ── Scrollable Body Area ── */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        {!selectedDomain ? (
          /* ── GRID BROWSE VIEW ── */
          <div className="flex-1 flex flex-col">
            {/* Hero Section */}
            <div className="relative overflow-hidden shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/80 via-zinc-950 to-emerald-950/50" />
              <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)",
                  backgroundSize: "40px 40px",
                }}
              />
              <div className="absolute top-10 left-[15%] w-64 h-64 rounded-full bg-purple-500/10 blur-[100px] animate-pulse" />
              <div className="absolute bottom-0 right-[20%] w-48 h-48 rounded-full bg-cyan-500/10 blur-[80px] animate-pulse" style={{ animationDelay: "1s" }} />

              <div className="relative px-6 py-14 sm:px-10 sm:py-20 max-w-5xl mx-auto text-center">
                <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-gradient-to-r from-indigo-500/15 to-emerald-500/15 border border-indigo-500/25 text-indigo-300 text-xs font-semibold uppercase tracking-[0.2em] mb-6">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  </span>
                  STEAM-IE Knowledge Vault
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-5 tracking-tight leading-[1.1]">
                  Knowledge{" "}
                  <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
                    Center
                  </span>
                </h1>

                <p className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
                  Explore the core of{" "}
                  <span className="text-indigo-300 font-medium">STEAM</span>,{" "}
                  <span className="text-amber-300 font-medium">Innovation</span>,{" "}
                  <span className="text-purple-300 font-medium">Entrepreneurship</span> &{" "}
                  <span className="text-emerald-300 font-medium">Industry</span>{" "}
                  — your structured knowledge vault connecting disciplines, sectors, and ideas.
                </p>

                <div className="relative max-w-lg mx-auto group">
                  <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-emerald-500/30 opacity-0 blur-sm transition-opacity duration-300 group-focus-within:opacity-100" />
                  <div className="relative">
                    <Search className="w-5 h-5 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search knowledge domains..."
                      className="w-full bg-zinc-900/80 border border-zinc-700/60 rounded-2xl pl-12 pr-4 py-4 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/60 transition-all text-base shadow-lg backdrop-blur-sm placeholder:text-zinc-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/60 shrink-0">
              <div className="max-w-5xl mx-auto px-4 sm:px-6">
                <div className="flex gap-1 overflow-x-auto py-2 scrollbar-hide">
                  {TABS.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => { setActiveTab(tab.key); setSearch(""); }}
                      className={`relative flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                        activeTab === tab.key
                          ? "bg-zinc-800 text-white shadow-lg shadow-purple-500/10"
                          : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/60"
                      }`}
                    >
                      <span className="text-base">{tab.icon}</span>
                      <span>{tab.label}</span>
                      {activeTab === tab.key && (
                        <span
                          className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-gradient-to-r ${tab.color}`}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Cards Grid */}
            <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">
              <div className="mb-6 flex items-center gap-3">
                <span className="text-2xl">{TABS.find((t) => t.key === activeTab)?.icon}</span>
                <h2 className="text-2xl font-bold text-white tracking-tight">{activeTab}</h2>
                <span className="text-sm text-zinc-500 ml-auto">{filteredCards.length} domains</span>
              </div>

              {loadingGraph ? (
                /* Loading State Shimmer */
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="animate-pulse bg-zinc-900 border border-zinc-800 rounded-2xl h-40" />
                  ))}
                </div>
              ) : (
                /* Bento Grid */
                <div>
                  {activeTab === "STEAM" ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 auto-rows-[160px] gap-4">
                      {filteredCards.map((card, i) => (
                        <BentoCard key={card.name} card={card} index={i} onSelect={() => setSelectedDomain(card)} />
                      ))}
                    </div>
                  ) : activeTab === "INDUSTRY" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {filteredCards.map((card, i) => (
                        <BentoCard key={card.name} card={{ ...card, span: undefined }} index={i} onSelect={() => setSelectedDomain(card)} />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 auto-rows-[160px] gap-4">
                      {filteredCards.map((card, i) => (
                        <BentoCard key={card.name} card={card} index={i} onSelect={() => setSelectedDomain(card)} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {filteredCards.length === 0 && (
                <div className="text-center py-20 text-zinc-500">
                  <span className="text-4xl block mb-4">🔍</span>
                  No domains found matching "<span className="text-zinc-300">{search}</span>"
                </div>
              )}

              {/* Footer */}
              <div className="mt-16 text-center shrink-0">
                <div className="inline-flex items-center gap-3 text-zinc-600 text-xs">
                  <span className="w-10 h-px bg-zinc-800" />
                  STEAM-IE Knowledge Vault · Fad.Wiki
                  <span className="w-10 h-px bg-zinc-800" />
                </div>
              </div>
            </main>
          </div>
        ) : (
          /* ── 2-COLUMN DETAIL VIEW ── */
          <div className="flex-1 flex flex-col h-full min-h-0 bg-zinc-950">
            {/* Top Toolbar */}
            <div className="px-6 py-4 border-b border-zinc-800/60 bg-zinc-900/30 flex items-center gap-4 shrink-0">
              <button
                onClick={() => { setSelectedDomain(null); setSelectedFileSlug(null); setSidebarQuery(""); }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-850 transition-all font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Domains
              </button>
              <div className="h-4 w-px bg-zinc-800" />
              <div className="flex items-center gap-2">
                <span className="text-xl">{selectedDomain.icon}</span>
                <span className="font-bold text-white text-base tracking-tight">{selectedDomain.name}</span>
                <span className="text-xs text-zinc-500 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-full">
                  {domainPages.length} concepts
                </span>
              </div>
            </div>

            {/* Content Body Grid */}
            <div className="flex-1 flex min-h-0">
              {/* Left Column: Sidebar Concept List */}
              <aside className="w-80 border-r border-zinc-800/60 flex flex-col min-h-0 bg-zinc-900/10 shrink-0">
                {/* Search files in this directory */}
                <div className="p-4 border-b border-zinc-800/40 shrink-0">
                  <div className="relative">
                    <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={sidebarQuery}
                      onChange={(e) => setSidebarQuery(e.target.value)}
                      placeholder="Search this folder..."
                      className="w-full bg-zinc-950 border border-zinc-800/80 rounded-xl pl-9 pr-3 py-2 text-sm text-zinc-300 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 placeholder:text-zinc-600 transition-all"
                    />
                  </div>
                </div>

                {/* List items */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {filteredSidebarPages.map((page, index) => {
                    const isSelected = selectedFileSlug === page.slug;
                    const accentColor = selectedDomain.color;
                    
                    return (
                      <div
                        key={page.slug}
                        onClick={() => setSelectedFileSlug(page.slug)}
                        className={`group relative rounded-xl p-4 border transition-all duration-300 cursor-pointer overflow-hidden ${
                          isSelected
                            ? "bg-zinc-900/90 border-zinc-700 shadow-md shadow-purple-500/5"
                            : "bg-zinc-950/40 border-zinc-900/60 hover:bg-zinc-900/40 hover:border-zinc-800/60"
                        }`}
                      >
                        {/* Selected Indicator Rail */}
                        <div
                          className={`absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b ${accentColor} transition-opacity duration-300 ${
                            isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-60"
                          }`}
                        />
                        <div className="relative z-10 flex justify-between items-start gap-2">
                          <h4 className={`text-sm font-semibold truncate ${isSelected ? "text-white" : "text-zinc-300 group-hover:text-white"}`}>
                            {page.title}
                          </h4>
                          <span className="shrink-0 text-[10px] font-semibold bg-zinc-900 border border-zinc-800/80 text-zinc-500 px-1.5 py-0.5 rounded-full tabular-nums">
                            {page.backlinkCount} links
                          </span>
                        </div>
                        {page.summary && (
                          <p className="text-[11px] text-zinc-500 leading-relaxed mt-1.5 line-clamp-2">
                            {page.summary}
                          </p>
                        )}
                      </div>
                    );
                  })}

                  {filteredSidebarPages.length === 0 && (
                    <div className="text-center py-10 text-zinc-600 text-xs">
                      No files found matching "{sidebarQuery}"
                    </div>
                  )}
                </div>
              </aside>

              {/* Right Column: Tabbed Content Panel */}
              <main className="flex-1 flex flex-col min-h-0 bg-zinc-950">
                {/* Tabs selection bar */}
                <div className="px-6 py-2 bg-zinc-900/20 border-b border-zinc-800/40 flex items-center justify-between shrink-0">
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setDetailTab("content")}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                        detailTab === "content"
                          ? "bg-zinc-800 text-white shadow-sm"
                          : "text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Document Content
                    </button>
                    <button
                      onClick={() => setDetailTab("graph")}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                        detailTab === "graph"
                          ? "bg-zinc-800 text-white shadow-sm"
                          : "text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      Knowledge Graph
                    </button>
                  </div>

                  {selectedFileSlug && (
                    <div className="text-xs text-zinc-500 font-mono select-all select-none">
                      {selectedFileSlug}.md
                    </div>
                  )}
                </div>

                {/* Tab content displays */}
                <div className="flex-1 min-h-0 p-6 overflow-y-auto">
                  {detailTab === "content" ? (
                    /* Tab 1: Page Content Reader */
                    <div className="max-w-3xl mx-auto h-full">
                      {loadingContent ? (
                        /* Content Shimmer loader */
                        <div className="space-y-4 animate-pulse">
                          <div className="h-8 w-2/3 bg-zinc-900 rounded-lg" />
                          <div className="h-4 w-1/4 bg-zinc-900 rounded" />
                          <div className="h-px bg-zinc-900 my-6" />
                          <div className="h-4 w-full bg-zinc-900 rounded" />
                          <div className="h-4 w-full bg-zinc-900 rounded" />
                          <div className="h-4 w-5/6 bg-zinc-900 rounded" />
                        </div>
                      ) : fileContent ? (
                        <article className="prose-wiki prose-invert pb-16">
                          <h1 className="text-4xl font-display font-light text-white mb-2 leading-tight">
                            {fileContent.title}
                          </h1>
                          <div className="flex items-center gap-2 text-xs text-zinc-500 mb-6">
                            <span>
                              {Math.max(1, Math.round(fileContent.contentMarkdown.split(/\s+/).length / 200))} min read
                            </span>
                            <span>·</span>
                            <span>{fileContent.contentMarkdown.split(/\s+/).length.toLocaleString()} words</span>
                            <span>·</span>
                            <Link to={`/wiki/${fileContent.slug}`} className="underline text-indigo-400 hover:text-indigo-300">
                              Open in Wiki Hub
                            </Link>
                          </div>
                          
                          <div className="h-px bg-zinc-800/80 mb-8" />
                          
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeHighlight]}
                            components={{
                              h1: ({ ...props }) => <h1 className="text-2xl font-display font-light mb-4 mt-8 text-white border-b border-zinc-800/60 pb-2" {...props} />,
                              h2: ({ ...props }) => <h2 className="text-xl font-display font-light mb-3 mt-6 text-zinc-100" {...props} />,
                              h3: ({ ...props }) => <h3 className="text-lg font-display font-light mb-2 mt-5 text-zinc-200" {...props} />,
                              p: ({ ...props }) => <p className="mb-4 text-zinc-300 leading-relaxed text-sm" {...props} />,
                              ul: ({ ...props }) => <ul className="mb-4 list-disc pl-5 space-y-1 text-sm text-zinc-300" {...props} />,
                              ol: ({ ...props }) => <ol className="mb-4 list-decimal pl-5 space-y-1 text-sm text-zinc-300" {...props} />,
                              li: ({ ...props }) => <li className="leading-relaxed" {...props} />,
                              code: ({ ...props }) => <code className="bg-zinc-900 border border-zinc-800 text-indigo-300 rounded px-1.5 py-0.5 text-xs font-mono" {...props} />,
                              pre: ({ ...props }) => <pre className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 overflow-x-auto my-4 font-mono text-xs text-zinc-300" {...props} />,
                            }}
                          >
                            {fileContent.contentMarkdown}
                          </ReactMarkdown>
                        </article>
                      ) : (
                        <div className="text-center py-20 text-zinc-600">
                          Select a file in the list to view its content.
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Tab 2: Interactive Local Knowledge Graph */
                    <div className="w-full h-full">
                      {domainPages.length > 0 ? (
                        <LocalFolderGraph
                          nodes={domainPages}
                          edges={localEdges}
                          selectedSlug={selectedFileSlug}
                          onSelectNode={(slug) => setSelectedFileSlug(slug)}
                          colorGradient={selectedDomain.color}
                        />
                      ) : (
                        <div className="text-center py-20 text-zinc-600">
                          No graph layout available for this category.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </main>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export const ErrorBoundary = RouteErrorBoundary;
