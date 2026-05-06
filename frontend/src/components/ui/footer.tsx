import { resolvePublicPath } from "@/lib/public-path";

interface FooterProps {
  copyright?: string;
}

export const Footer = ({
  copyright = "© 2026 KDS Soccer Tournament. All rights reserved.",
}: FooterProps) => {
  const quickLinks = [
    { name: "Home", href: resolvePublicPath("/") },
    { name: "Schedule", href: resolvePublicPath("/schedule") },
    { name: "Standings", href: resolvePublicPath("/standings") },
    { name: "Bracket", href: resolvePublicPath("/bracket") },
  ];

  return (
    <footer className="bg-white" style={{ borderTop: "1px solid #e2e8f0" }}>
      <div className="container mx-auto px-8 lg:px-16 py-12">
        <div className="flex flex-col lg:flex-row justify-between gap-10">
          {/* Left: Logo + description */}
          <div className="max-w-xs">
            <a
              href={resolvePublicPath("/")}
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                fontSize: "20px",
                color: "#1a1a1a",
                textDecoration: "none",
                display: "block",
                marginBottom: "12px",
              }}
            >
              KDS Soccer
            </a>
            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "14px",
                color: "#718096",
                lineHeight: "1.6",
              }}
            >
              The premier soccer tournament bringing together the best teams for an exciting competition.
            </p>
          </div>

          {/* Center: Quick Links */}
          <div>
            <h3
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 600,
                fontSize: "14px",
                color: "#1a1a1a",
                marginBottom: "16px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Quick Links
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "14px",
                      color: "#4a5568",
                      textDecoration: "none",
                    }}
                    className="hover:opacity-70 transition-opacity"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: Resources */}
          <div>
            <h3
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 600,
                fontSize: "14px",
                color: "#1a1a1a",
                marginBottom: "16px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Resources
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://usfa.ca/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:opacity-70 transition-opacity"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "14px",
                    color: "#4a5568",
                    textDecoration: "none",
                  }}
                >
                  UFSA Rules
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-10 pt-8 flex items-center justify-center"
          style={{ borderTop: "1px solid #e2e8f0" }}
        >
          <p
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "13px",
              color: "#718096",
              textAlign: "center",
            }}
          >
            {copyright}
          </p>
        </div>
      </div>
    </footer>
  );
};
