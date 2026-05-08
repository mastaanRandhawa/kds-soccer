import { resolvePublicPath } from "@/lib/public-path";

interface FooterProps {
  copyright?: string;
}

export const Footer = ({
  copyright = "© 2026 KDS Soccer Tournament. All rights reserved.",
}: FooterProps) => {
  const quickLinks = [
    { name: "Home",          href: resolvePublicPath("/") },
    { name: "Schedule",      href: resolvePublicPath("/schedule") },
    { name: "Kids Schedule", href: resolvePublicPath("/kids-schedule") },
    { name: "Standings",     href: resolvePublicPath("/standings") },
    { name: "Bracket",       href: resolvePublicPath("/bracket") },
  ];

  return (
    <footer style={{ background: "#0f0f0f", borderTop: "1px solid #1f1f1f" }}>
      <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 py-12 sm:py-14">
        <div className="flex flex-col lg:flex-row justify-between gap-10">

          {/* Brand */}
          <div className="max-w-xs">
            <a
              href={resolvePublicPath("/")}
              className="block mb-3 text-white font-bold text-xl tracking-tight hover:opacity-80 transition-opacity"
            >
              KDS Soccer
            </a>
            <p className="text-sm text-gray-500 leading-relaxed">
              The premier soccer tournament bringing together the best teams for an unforgettable competition.
            </p>
          </div>

          {/* Links grid */}
          <div className="flex gap-16 sm:gap-20">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-600 mb-4">
                Pages
              </p>
              <ul className="space-y-2.5">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-600 mb-4">
                Resources
              </p>
              <ul className="space-y-2.5">
                <li>
                  <a
                    href="https://usfa.ca/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    UFSA Rules
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                </li>
                <li>
                  <a
                    href={resolvePublicPath("/admin")}
                    className="text-sm text-gray-600 hover:text-gray-400 transition-colors"
                  >
                    Admin
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <p className="text-xs text-gray-600">{copyright}</p>
            <p className="text-xs text-gray-600">
              Created by{' '}
              <a
                href="https://mastaanrandhawa.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors underline underline-offset-2"
              >
                Mastaan Randhawa
              </a>
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-xs text-gray-600">All systems live</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
