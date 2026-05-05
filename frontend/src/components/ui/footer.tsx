import React from "react";
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";

interface FooterProps {
  logo?: {
    url: string;
    title: string;
  };
  sections?: Array<{
    title: string;
    links: Array<{ name: string; href: string }>;
  }>;
  description?: string;
  socialLinks?: Array<{
    icon: React.ReactElement;
    href: string;
    label: string;
  }>;
  copyright?: string;
  legalLinks?: Array<{
    name: string;
    href: string;
  }>;
}

const defaultSections = [
  {
    title: "Tournament",
    links: [
      { name: "Live Scores", href: "/live-scores" },
      { name: "Bracket", href: "/bracket" },
      { name: "Teams", href: "/teams" },
      { name: "Schedule", href: "/schedule" },
    ],
  },
  {
    title: "Information",
    links: [
      { name: "About", href: "/about" },
      { name: "Rules", href: "https://ufsa.com" },
      { name: "Venues", href: "/venues" },
      { name: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Resources",
    links: [
      { name: "Help", href: "/help" },
      { name: "FAQ", href: "/faq" },
      { name: "Media Kit", href: "/media" },
      { name: "Sponsors", href: "/sponsors" },
    ],
  },
];

const defaultSocialLinks = [
  { icon: <FaInstagram className="size-5" />, href: "#", label: "Instagram" },
  { icon: <FaFacebook className="size-5" />, href: "#", label: "Facebook" },
  { icon: <FaTwitter className="size-5" />, href: "#", label: "Twitter" },
  { icon: <FaYoutube className="size-5" />, href: "#", label: "YouTube" },
];

const defaultLegalLinks = [
  { name: "Terms and Conditions", href: "#" },
  { name: "Privacy Policy", href: "#" },
];

export const Footer = ({
  logo = {
    url: "/",
    title: "KDS Soccer",
  },
  sections = defaultSections,
  description = "The premier soccer tournament bringing together the best teams for an exciting competition.",
  socialLinks = defaultSocialLinks,
  copyright = "© 2026 KDS Soccer Tournament. All rights reserved.",
  legalLinks = defaultLegalLinks,
}: FooterProps) => {
  return (
    <section className="py-16 lg:py-32 bg-white">
      <div className="container mx-auto px-8 lg:px-16">
        <div className="flex w-full flex-col justify-between gap-10 lg:flex-row lg:items-start lg:text-left">
          <div className="flex w-full flex-col justify-between gap-6 lg:items-start lg:max-w-xs">
            {/* Logo */}
            <div className="flex items-center gap-2 lg:justify-start">
              <a href={logo.url}>
                <h2 
                  className="text-xl font-bold"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    color: "#1a1a1a",
                  }}
                >
                  {logo.title}
                </h2>
              </a>
            </div>
            <p 
              className="text-sm"
              style={{
                fontFamily: "Inter, sans-serif",
                color: "#718096",
              }}
            >
              {description}
            </p>
            <ul className="flex items-center space-x-6">
              {socialLinks.map((social, idx) => (
                <li key={idx} className="hover:opacity-70 transition-opacity">
                  <a 
                    href={social.href} 
                    aria-label={social.label}
                    style={{ color: "#4a5568" }}
                  >
                    {social.icon}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid w-full gap-6 md:grid-cols-3 lg:gap-20">
            {sections.map((section, sectionIdx) => (
              <div key={sectionIdx}>
                <h3 
                  className="mb-4 font-bold"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    color: "#1a1a1a",
                  }}
                >
                  {section.title}
                </h3>
                <ul className="space-y-3 text-sm">
                  {section.links.map((link, linkIdx) => (
                    <li
                      key={linkIdx}
                      className="font-medium hover:opacity-70 transition-opacity"
                    >
                      <a 
                        href={link.href}
                        style={{
                          fontFamily: "Inter, sans-serif",
                          color: "#4a5568",
                          textDecoration: "none",
                        }}
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div 
          className="mt-8 flex flex-col justify-between gap-4 border-t py-8 text-xs font-medium md:flex-row md:items-center md:text-left"
          style={{ borderColor: "#e2e8f0" }}
        >
          <p 
            className="order-2 lg:order-1"
            style={{
              fontFamily: "Inter, sans-serif",
              color: "#718096",
            }}
          >
            {copyright}
          </p>
          <ul className="order-1 flex flex-col gap-2 md:order-2 md:flex-row md:gap-4">
            {legalLinks.map((link, idx) => (
              <li key={idx} className="hover:opacity-70 transition-opacity">
                <a 
                  href={link.href}
                  style={{
                    fontFamily: "Inter, sans-serif",
                    color: "#718096",
                    textDecoration: "none",
                  }}
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
