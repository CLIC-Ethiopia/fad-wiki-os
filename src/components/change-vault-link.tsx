import { Link } from "react-router-dom";

export function ChangeVaultLink({ className = "" }: { className?: string }) {
  return (
    <Link
      to="/setup?change=1"
      className={`inline-flex items-center rounded-lg bg-gradient-to-r from-purple-700 to-rose-600 hover:from-purple-800 hover:to-rose-700 text-white shadow-md hover:shadow-lg px-3 py-2 text-xs font-medium transition-all active:scale-95 sm:px-4 sm:text-sm ${className}`.trim()}
    >
      <span className="sm:hidden">Vault</span>
      <span className="hidden sm:inline">Change vault</span>
    </Link>
  );
}
