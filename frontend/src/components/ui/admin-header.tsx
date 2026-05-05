import { Link } from "react-router-dom";
import { LogOut } from "lucide-react";

interface AdminHeaderProps {
  user?: { username: string } | null;
  onLogout: () => void;
}

export function AdminHeader({ user, onLogout }: AdminHeaderProps) {
  return (
    <header
      className="bg-white shadow-sm sticky top-0 z-10"
      style={{ borderBottom: "1px solid #e2e8f0" }}
    >
      <div className="container mx-auto px-4 sm:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3 sm:gap-6">
          <Link
            to="/"
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 700,
              fontSize: "20px",
              color: "#1a1a1a",
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            KDS Soccer
          </Link>
          <span
            className="px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap"
            style={{
              backgroundColor: "#E8F0FF",
              color: "#3B82F6",
              fontFamily: "Inter, sans-serif",
            }}
          >
            Admin
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <span
            className="hidden sm:block"
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "14px",
              color: "#4a5568",
            }}
          >
            {user?.username}
          </span>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors hover:bg-gray-100"
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "14px",
              color: "#718096",
            }}
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
