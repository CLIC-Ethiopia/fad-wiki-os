import { Wrench } from "lucide-react";

interface ToolActivityProps {
  tools: any[];
}

export function ToolActivity({ tools }: ToolActivityProps) {
  if (!tools || tools.length === 0) return null;

  return (
    <div className="mt-2 text-xs text-zinc-400 bg-zinc-800/50 p-2 rounded border border-zinc-700 max-w-2xl">
      <div className="flex items-center gap-1 mb-1 font-semibold text-zinc-300">
        <Wrench size={12} />
        Agent used {tools.length} tool(s):
      </div>
      <ul className="list-disc list-inside space-y-1 ml-1">
        {tools.map((t, i) => (
          <li key={i}>
            <span className="text-blue-400 font-mono">{t.name}</span>
            {t.arguments && (
              <span className="text-zinc-500 ml-1">
                ({Object.keys(t.arguments).join(', ')})
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
