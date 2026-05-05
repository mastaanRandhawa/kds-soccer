MASTER PROMPT:
You are given a task to integrate an existing React component in the codebase

The codebase should support:
- shadcn project structure  
- Tailwind CSS
- Typescript

If it doesn't, provide instructions on how to setup project via shadcn CLI, install Tailwind or Typescript.

Determine the default path for components and styles. 
If default path for components is not /components/ui, provide instructions on why it's important to create this folder
Copy-paste this component to /components/ui folder:
```tsx
pulse-fit-hero.tsx
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface NavigationItem {
  label: string;
  hasDropdown?: boolean;
  onClick?: () => void;
}

interface ProgramCard {
  image: string;
  category: string;
  title: string;
  onClick?: () => void;
}

interface PulseFitHeroProps {
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
  socialProof?: {
    avatars: string[];
    text: string;
  };
  programs?: ProgramCard[];
  className?: string;
  children?: React.ReactNode;
}

export function PulseFitHero({
  logo = "PulseFit",
  navigation = [
    { label: "Features" },
    { label: "Programs", hasDropdown: true },
    { label: "Testimonials" },
    { label: "Pricing" },
    { label: "Contact" },
  ],
  ctaButton,
  title,
  subtitle,
  primaryAction,
  secondaryAction,
  disclaimer,
  socialProof,
  programs = [],
  className,
  children,
}: PulseFitHeroProps) {
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
        className="relative z-20 flex flex-row justify-between items-center px-8 lg:px-16"
        style={{
          paddingTop: "32px",
          paddingBottom: "32px",
        }}
      >
        {/* Logo */}
        <div
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            fontSize: "24px",
            color: "#1a1a1a",
          }}
        >
          {logo}
        </div>

        {/* Navigation */}
        <nav className="hidden lg:flex flex-row items-center gap-8" aria-label="Main navigation">
          {navigation.map((item, index) => (
            <button
              key={index}
              onClick={item.onClick}
              className="flex flex-row items-center gap-1 hover:opacity-70 transition-opacity"
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "16px",
                fontWeight: 400,
                color: "#4a5568",
              }}
            >
              {item.label}
              {item.hasDropdown && (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M4 6L8 10L12 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          ))}
        </nav>

        {/* CTA Button */}
        {ctaButton && (
          <button
            onClick={ctaButton.onClick}
            className="px-6 py-3 rounded-full transition-all hover:scale-105"
            style={{
              background: "#FFFFFF",
              border: "1px solid #e2e8f0",
              fontFamily: "Inter, sans-serif",
              fontSize: "16px",
              fontWeight: 500,
              color: "#1a1a1a",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
            }}
          >
            {ctaButton.label}
          </button>
        )}
      </motion.header>

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
            style={{ gap: "32px" }}
          >
            {/* Title */}
            <h1
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                fontSize: "clamp(36px, 6vw, 72px)",
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
                fontSize: "clamp(16px, 2vw, 20px)",
                lineHeight: "1.6",
                color: "#4a5568",
                maxWidth: "600px",
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
                      fontSize: "18px",
                      fontWeight: 500,
                      color: "#FFFFFF",
                      boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
                    }}
                  >
                    {primaryAction.label}
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M7 10H13M13 10L10 7M13 10L10 13"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
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
                      fontSize: "18px",
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

            {/* Social Proof */}
            {socialProof && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="flex flex-row items-center gap-3"
              >
                <div className="flex flex-row -space-x-2">
                  {socialProof.avatars.map((avatar, index) => (
                    <img
                      key={index}
                      src={avatar}
                      alt={`User ${index + 1}`}
                      className="rounded-full border-2 border-white"
                      style={{
                        width: "40px",
                        height: "40px",
                        objectFit: "cover",
                      }}
                    />
                  ))}
                </div>
                <span
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#4a5568",
                  }}
                >
                  {socialProof.text}
                </span>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}

      {/* Program Cards Carousel */}
      {programs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="relative z-10 w-full overflow-hidden"
          style={{
            paddingTop: "60px",
            paddingBottom: "60px",
          }}
        >
          {/* Gradient Overlays */}
          <div
            className="absolute left-0 top-0 bottom-0 z-10 pointer-events-none"
            style={{
              width: "150px",
              background: "linear-gradient(90deg, #FFFFFF 0%, rgba(255, 255, 255, 0) 100%)",
            }}
          />
          <div
            className="absolute right-0 top-0 bottom-0 z-10 pointer-events-none"
            style={{
              width: "150px",
              background: "linear-gradient(270deg, #FFFFFF 0%, rgba(255, 255, 255, 0) 100%)",
            }}
          />

          {/* Scrolling Container */}
          <motion.div
            className="flex items-center"
            animate={{
              x: [0, -((programs.length * 380) / 2)],
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: programs.length * 3,
                ease: "linear",
              },
            }}
            style={{
              gap: "24px",
              paddingLeft: "24px",
            }}
          >
            {/* Duplicate programs for seamless loop */}
            {[...programs, ...programs].map((program, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05, y: -10 }}
                transition={{ duration: 0.3 }}
                onClick={program.onClick}
                className="flex-shrink-0 cursor-pointer relative overflow-hidden"
                style={{
                  width: "356px",
                  height: "480px",
                  borderRadius: "24px",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
                }}
              >
                {/* Image */}
                <img
                  src={program.image}
                  alt={program.title}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />

                {/* Gradient Overlay */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.7) 100%)",
                  }}
                />

                {/* Text Content */}
                <div
                  className="absolute bottom-0 left-0 right-0 p-6"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "12px",
                      fontWeight: 500,
                      color: "rgba(255, 255, 255, 0.8)",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                    }}
                  >
                    {program.category}
                  </span>
                  <h3
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "24px",
                      fontWeight: 600,
                      color: "#FFFFFF",
                      lineHeight: "1.3",
                    }}
                  >
                    {program.title}
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


demo.tsx
import { PulseFitHero } from "@/components/ui/pulse-fit-hero";


export default function PulseFitHeroDemo() {
  return (
    <PulseFitHero
      logo="PulseFit"
      navigation={[
        { label: "Features", onClick: () => console.log("Features") },
        { label: "Programs", hasDropdown: true, onClick: () => console.log("Programs") },
        { label: "Testimonials", onClick: () => console.log("Testimonials") },
        { label: "Pricing", onClick: () => console.log("Pricing") },
        { label: "Contact", onClick: () => console.log("Contact") },
      ]}
      ctaButton={{
        label: "Get Free Trial",
        onClick: () => console.log("Get Free Trial"),
      }}
      title="Train smarter. Anywhere. Anytime."
      subtitle="Guided fitness sessions tailored to your goals - whether it's strength, endurance, or flexibility. Streamlined, motivating, and accessible 24/7."
      primaryAction={{
        label: "Start training",
        onClick: () => console.log("Start training"),
      }}
      secondaryAction={{
        label: "Browse programs",
        onClick: () => console.log("Browse programs"),
      }}
      disclaimer="*No credit card required"
      socialProof={{
        avatars: [
          "https://i.pravatar.cc/150?img=1",
          "https://i.pravatar.cc/150?img=2",
          "https://i.pravatar.cc/150?img=3",
          "https://i.pravatar.cc/150?img=4",
        ],
        text: "Join over 10,000+ people",
      }}
      programs={[
        {
          image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=500&fit=crop",
          category: "BEGINNER",
          title: "Jumping challenge",
          onClick: () => console.log("Jumping challenge"),
        },
        {
          image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=500&fit=crop",
          category: "INTERMEDIATE",
          title: "Core stability flow",
          onClick: () => console.log("Core stability flow"),
        },
        {
          image: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=400&h=500&fit=crop",
          category: "ADVANCED",
          title: "Trail sprint challenge",
          onClick: () => console.log("Trail sprint challenge"),
        },
        {
          image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=500&fit=crop",
          category: "ALL LEVELS",
          title: "Full-body bootcamp",
          onClick: () => console.log("Full-body bootcamp"),
        },
        {
          image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=500&fit=crop",
          category: "RECOVERY",
          title: "Mobility & Recovery",
          onClick: () => console.log("Mobility & Recovery"),
        },
      ]}
    />
  );
}

```

Install NPM dependencies:
```bash
framer-motion
```

Implementation Guidelines
 1. Analyze the component structure and identify all required dependencies
 2. Review the component's argumens and state
 3. Identify any required context providers or hooks and install them
 4. Questions to Ask
 - What data/props will be passed to this component?
 - Are there any specific state management requirements?
 - Are there any required assets (images, icons, etc.)?
 - What is the expected responsive behavior?
 - What is the best place to use this component in the app?

Steps to integrate
 0. Copy paste all the code above in the correct directories
 1. Install external dependencies
 2. Fill image assets with Unsplash stock images you know exist
 3. Use lucide-react icons for svgs or logos if component requires them



Footer:
You are given a task to integrate an existing React component in the codebase

The codebase should support:
- shadcn project structure  
- Tailwind CSS
- Typescript

If it doesn't, provide instructions on how to setup project via shadcn CLI, install Tailwind or Typescript.

Determine the default path for components and styles. 
If default path for components is not /components/ui, provide instructions on why it's important to create this folder
Copy-paste this component to /components/ui folder:
```tsx
footer-7.tsx
import React from "react";
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa";

interface Footer7Props {
  logo?: {
    url: string;
    src: string;
    alt: string;
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
    title: "Product",
    links: [
      { name: "Overview", href: "#" },
      { name: "Pricing", href: "#" },
      { name: "Marketplace", href: "#" },
      { name: "Features", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "About", href: "#" },
      { name: "Team", href: "#" },
      { name: "Blog", href: "#" },
      { name: "Careers", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { name: "Help", href: "#" },
      { name: "Sales", href: "#" },
      { name: "Advertise", href: "#" },
      { name: "Privacy", href: "#" },
    ],
  },
];

const defaultSocialLinks = [
  { icon: <FaInstagram className="size-5" />, href: "#", label: "Instagram" },
  { icon: <FaFacebook className="size-5" />, href: "#", label: "Facebook" },
  { icon: <FaTwitter className="size-5" />, href: "#", label: "Twitter" },
  { icon: <FaLinkedin className="size-5" />, href: "#", label: "LinkedIn" },
];

const defaultLegalLinks = [
  { name: "Terms and Conditions", href: "#" },
  { name: "Privacy Policy", href: "#" },
];

export const Footer7 = ({
  logo = {
    url: "https://www.shadcnblocks.com",
    src: "https://www.shadcnblocks.com/images/block/logos/shadcnblockscom-icon.svg",
    alt: "logo",
    title: "Shadcnblocks.com",
  },
  sections = defaultSections,
  description = "A collection of components for your startup business or side project.",
  socialLinks = defaultSocialLinks,
  copyright = "© 2024 Shadcnblocks.com. All rights reserved.",
  legalLinks = defaultLegalLinks,
}: Footer7Props) => {
  return (
    <section className="py-32">
      <div className="container mx-auto">
        <div className="flex w-full flex-col justify-between gap-10 lg:flex-row lg:items-start lg:text-left">
          <div className="flex w-full flex-col justify-between gap-6 lg:items-start">
            {/* Logo */}
            <div className="flex items-center gap-2 lg:justify-start">
              <a href={logo.url}>
                <img
                  src={logo.src}
                  alt={logo.alt}
                  title={logo.title}
                  className="h-8"
                />
              </a>
              <h2 className="text-xl font-semibold">{logo.title}</h2>
            </div>
            <p className="max-w-[70%] text-sm text-muted-foreground">
              {description}
            </p>
            <ul className="flex items-center space-x-6 text-muted-foreground">
              {socialLinks.map((social, idx) => (
                <li key={idx} className="font-medium hover:text-primary">
                  <a href={social.href} aria-label={social.label}>
                    {social.icon}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid w-full gap-6 md:grid-cols-3 lg:gap-20">
            {sections.map((section, sectionIdx) => (
              <div key={sectionIdx}>
                <h3 className="mb-4 font-bold">{section.title}</h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  {section.links.map((link, linkIdx) => (
                    <li
                      key={linkIdx}
                      className="font-medium hover:text-primary"
                    >
                      <a href={link.href}>{link.name}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-8 flex flex-col justify-between gap-4 border-t py-8 text-xs font-medium text-muted-foreground md:flex-row md:items-center md:text-left">
          <p className="order-2 lg:order-1">{copyright}</p>
          <ul className="order-1 flex flex-col gap-2 md:order-2 md:flex-row">
            {legalLinks.map((link, idx) => (
              <li key={idx} className="hover:text-primary">
                <a href={link.href}> {link.name}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};



demo.tsx
import { Footer7 } from "@/components/ui/footer-7";

const DemoOne = () => {
  return (
    <Footer7 />
  );
};

export { DemoOne };

```

Install NPM dependencies:
```bash
react-icons
```

Implementation Guidelines
 1. Analyze the component structure and identify all required dependencies
 2. Review the component's argumens and state
 3. Identify any required context providers or hooks and install them
 4. Questions to Ask
 - What data/props will be passed to this component?
 - Are there any specific state management requirements?
 - Are there any required assets (images, icons, etc.)?
 - What is the expected responsive behavior?
 - What is the best place to use this component in the app?

Steps to integrate
 0. Copy paste all the code above in the correct directories
 1. Install external dependencies
 2. Fill image assets with Unsplash stock images you know exist
 3. Use lucide-react icons for svgs or logos if component requires them
