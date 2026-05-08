import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { resolvePublicPath } from "@/lib/public-path";

interface NavigationItem {
  label: string;
  hasDropdown?: boolean;
  href?: string;
  external?: boolean;
  onClick?: () => void;
}

interface MatchCard {
  image: string;
  category: string;
  title: string;
  onClick?: () => void;
}

interface SoccerHeroProps {
  logo?: string;
  navigation?: NavigationItem[];
  ctaButton?: {
    label: string;
    onClick: () => void;
  };
  title: string;
  subtitle: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  disclaimer?: string;
  matches?: MatchCard[];
  className?: string;
  children?: React.ReactNode;
}

export function SoccerHero({
  logo = "KDS Soccer",
  navigation = [
    { label: "Home", href: "/" },
    { label: "Schedule", href: "/schedule" },
    { label: "Kids Schedule", href: "/kids-schedule" },
    { label: "Standings", href: "/standings" },
    { label: "Bracket", href: "/bracket" },
    { label: "UFSA Rules", href: "https://usfa.ca/", external: true },
  ],
  ctaButton,
  title,
  subtitle,
  primaryAction,
  secondaryAction,
  disclaimer,
  matches = [],
  className,
  children,
}: SoccerHeroProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <section
      className={cn(
        "relative w-full min-h-screen flex flex-col overflow-hidden",
        className
      )}
      style={{
        background: "linear-gradient(180deg, #E8F0FF 0%, #F5F9FF 50%, #FFFFFF 100%)",
      }}
      role="banner"
      aria-label="Hero section"
    >
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-20 flex flex-row justify-between items-center px-6 lg:px-16"
        style={{ paddingTop: "28px", paddingBottom: "28px" }}
      >
        {/* Logo */}
        <a
          href={resolvePublicPath("/")}
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            fontSize: "22px",
            color: "#1a1a1a",
            textDecoration: "none",
          }}
        >
          {logo}
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex flex-row items-center gap-8" aria-label="Main navigation">
          {navigation.map((item, index) => (
            <a
              key={index}
              href={item.external ? item.href : resolvePublicPath(item.href || "/")}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
              onClick={item.onClick}
              className="flex flex-row items-center gap-1 hover:opacity-70 transition-opacity"
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "15px",
                fontWeight: 400,
                color: "#4a5568",
                textDecoration: "none",
              }}
            >
              {item.label}
              {item.hasDropdown && (
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              {item.external && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              )}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {/* CTA Button */}
          {ctaButton && (
            <button
              onClick={ctaButton.onClick}
              className="hidden lg:block px-5 py-2.5 rounded-full transition-all hover:scale-105"
              style={{
                background: "#FFFFFF",
                border: "1px solid #e2e8f0",
                fontFamily: "Inter, sans-serif",
                fontSize: "15px",
                fontWeight: 500,
                color: "#1a1a1a",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
              }}
            >
              {ctaButton.label}
            </button>
          )}

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2"
            aria-label="Toggle menu"
            onClick={() => setMobileMenuOpen((o) => !o)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </motion.header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:hidden z-10 bg-white shadow-lg mx-4 rounded-xl px-6 py-4 flex flex-col gap-4"
          style={{ border: "1px solid #e2e8f0" }}
        >
          {navigation.map((item, index) => (
            <a
              key={index}
              href={item.external ? item.href : resolvePublicPath(item.href || "/")}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "16px",
                fontWeight: 400,
                color: "#1a1a1a",
                textDecoration: "none",
                padding: "8px 0",
                borderBottom: "1px solid #f0f0f0",
              }}
            >
              {item.label}
            </a>
          ))}
        </motion.div>
      )}

      {/* Main Content */}
      {children ? (
        <div className="relative z-10 flex-1 flex items-center justify-center w-full">
          {children}
        </div>
      ) : (
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col items-center text-center max-w-4xl"
            style={{ gap: "28px" }}
          >
            {/* Title */}
            <h1
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                fontSize: "clamp(32px, 5.5vw, 68px)",
                lineHeight: "1.1",
                color: "#1a1a1a",
                letterSpacing: "-0.02em",
              }}
            >
              {title}
            </h1>

            {/* Subtitle */}
            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 400,
                fontSize: "clamp(15px, 1.8vw, 19px)",
                lineHeight: "1.6",
                color: "#4a5568",
                maxWidth: "580px",
              }}
            >
              {subtitle}
            </p>

            {/* Action Buttons */}
            {(primaryAction || secondaryAction) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-col sm:flex-row items-center gap-4"
              >
                {primaryAction && (
                  <button
                    onClick={primaryAction.onClick}
                    className="flex flex-row items-center gap-2 px-8 py-4 rounded-full transition-all hover:scale-105"
                    style={{
                      background: "#1a1a1a",
                      fontFamily: "Inter, sans-serif",
                      fontSize: "17px",
                      fontWeight: 500,
                      color: "#FFFFFF",
                      boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
                    }}
                  >
                    {primaryAction.label}
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                      <path d="M7 10H13M13 10L10 7M13 10L10 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                )}
                {secondaryAction && (
                  <button
                    onClick={secondaryAction.onClick}
                    className="px-8 py-4 rounded-full transition-all hover:scale-105"
                    style={{
                      background: "transparent",
                      border: "1px solid #cbd5e0",
                      fontFamily: "Inter, sans-serif",
                      fontSize: "17px",
                      fontWeight: 500,
                      color: "#1a1a1a",
                    }}
                  >
                    {secondaryAction.label}
                  </button>
                )}
              </motion.div>
            )}

            {/* Disclaimer */}
            {disclaimer && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "13px",
                  fontWeight: 400,
                  color: "#718096",
                  fontStyle: "italic",
                }}
              >
                {disclaimer}
              </motion.p>
            )}
          </motion.div>
        </div>
      )}

      {/* Match Cards Carousel */}
      {matches.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="relative z-10 w-full overflow-hidden"
          style={{ paddingTop: "48px", paddingBottom: "60px" }}
        >
          {/* Edge fade overlays */}
          <div
            className="absolute left-0 top-0 bottom-0 z-10 pointer-events-none"
            style={{ width: "120px", background: "linear-gradient(90deg, #FFFFFF 0%, rgba(255,255,255,0) 100%)" }}
          />
          <div
            className="absolute right-0 top-0 bottom-0 z-10 pointer-events-none"
            style={{ width: "120px", background: "linear-gradient(270deg, #FFFFFF 0%, rgba(255,255,255,0) 100%)" }}
          />

          <motion.div
            className="flex items-center"
            animate={{ x: [0, -((matches.length * 380) / 2)] }}
            transition={{
              x: { repeat: Infinity, repeatType: "loop", duration: matches.length * 3, ease: "linear" },
            }}
            style={{ gap: "24px", paddingLeft: "24px" }}
          >
            {[...matches, ...matches].map((match, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.04, y: -8 }}
                transition={{ duration: 0.3 }}
                onClick={match.onClick}
                className="flex-shrink-0 cursor-pointer relative overflow-hidden"
                style={{ width: "340px", height: "460px", borderRadius: "20px", boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}
              >
                <img src={match.image} alt={match.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%)" }} />
                <div className="absolute bottom-0 left-0 right-0 p-6" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 500, color: "rgba(255,255,255,0.75)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    {match.category}
                  </span>
                  <h3 style={{ fontFamily: "Inter, sans-serif", fontSize: "22px", fontWeight: 600, color: "#FFFFFF", lineHeight: "1.3" }}>
                    {match.title}
                  </h3>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}
    </section>
  );
}
