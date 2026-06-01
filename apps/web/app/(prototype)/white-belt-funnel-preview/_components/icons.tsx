import type { SVGProps } from "react";

/**
 * Local inline icon set for the prototype. Matches the Sigmafy logo's
 * stroke aesthetic — stroke="currentColor", strokeWidth 1.6, round caps and
 * joins, no fill. All icons are 24×24 viewBox; size with width/height or
 * className.
 *
 * Not exported from `packages/ui` on purpose — these are local to the
 * prototype only.
 */

const baseProps: SVGProps<SVGSVGElement> = {
  viewBox: "0 0 24 24",
  xmlns: "http://www.w3.org/2000/svg",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

export type IconProps = Omit<SVGProps<SVGSVGElement>, "viewBox" | "fill" | "stroke">;

function I(props: IconProps, children: React.ReactNode) {
  return (
    <svg
      {...baseProps}
      {...props}
      className={`h-4 w-4 ${props.className ?? ""}`}
    >
      {children}
    </svg>
  );
}

/* Funnel-stage icons */
export const IconCheckCircle = (p: IconProps) =>
  I(p, (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 3 3 5-6" />
    </>
  ));
export const IconAward = (p: IconProps) =>
  I(p, (
    <>
      <circle cx="12" cy="9" r="6" />
      <path d="m9 14-2 7 5-3 5 3-2-7" />
    </>
  ));
export const IconShare = (p: IconProps) =>
  I(p, (
    <>
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="6" r="2.5" />
      <circle cx="18" cy="18" r="2.5" />
      <path d="m8.2 10.8 7.6-3.6M8.2 13.2l7.6 3.6" />
    </>
  ));
export const IconCompass = (p: IconProps) =>
  I(p, (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m15 9-2.5 5.5L7 17l2.5-5.5z" />
    </>
  ));
export const IconRadio = (p: IconProps) =>
  I(p, (
    <>
      <circle cx="12" cy="12" r="2" />
      <path d="M8.5 8.5a5 5 0 0 0 0 7M15.5 8.5a5 5 0 0 1 0 7M5.5 5.5a9 9 0 0 0 0 13M18.5 5.5a9 9 0 0 1 0 13" />
    </>
  ));
export const IconBullhorn = (p: IconProps) =>
  I(p, (
    <>
      <path d="M3 11v2a1 1 0 0 0 1 1h3l8 4V6L7 10H4a1 1 0 0 0-1 1z" />
      <path d="M18 9a3 3 0 0 1 0 6" />
    </>
  ));
export const IconPhone = (p: IconProps) =>
  I(p, (
    <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A14 14 0 0 1 4 7a3 3 0 0 1 1-3z" />
  ));
export const IconTarget = (p: IconProps) =>
  I(p, (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" />
    </>
  ));

/* Portal / CTA icons */
export const IconArrowUp = (p: IconProps) =>
  I(p, <path d="M12 19V5m0 0-6 6m6-6 6 6" />);
export const IconBuilding = (p: IconProps) =>
  I(p, (
    <>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M9 7h0.01M15 7h0.01M9 11h0.01M15 11h0.01M9 15h0.01M15 15h0.01M10 21v-3h4v3" />
    </>
  ));
export const IconUsers = (p: IconProps) =>
  I(p, (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20a6 6 0 0 1 12 0" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M14 17.5a4.5 4.5 0 0 1 7 0" />
    </>
  ));
export const IconGift = (p: IconProps) =>
  I(p, (
    <>
      <rect x="3" y="9" width="18" height="11" rx="1.5" />
      <path d="M12 9V21M3 13h18M8.5 5a2.5 2.5 0 1 1 3.5 3.5A2.5 2.5 0 1 1 15.5 5" />
    </>
  ));
export const IconHandshake = (p: IconProps) =>
  I(p, (
    <>
      <path d="M3 11 7 7l3 2 3-3 8 8-3 3-3-3-2 2-3-3-2 2z" />
    </>
  ));
export const IconStats = (p: IconProps) =>
  I(p, (
    <>
      <path d="M4 20V8M10 20V4M16 20v-8M22 20H2" />
    </>
  ));
export const IconCalendar = (p: IconProps) =>
  I(p, (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </>
  ));
export const IconDownload = (p: IconProps) =>
  I(p, (
    <>
      <path d="M12 4v12m0 0-4-4m4 4 4-4M5 20h14" />
    </>
  ));
export const IconCompare = (p: IconProps) =>
  I(p, (
    <>
      <rect x="3" y="4" width="8" height="16" rx="1.5" />
      <rect x="13" y="4" width="8" height="16" rx="1.5" />
    </>
  ));

/* Sigmafy-stats icons */
export const IconFlag = (p: IconProps) =>
  I(p, <path d="M5 21V4h12l-2 4 2 4H5" />);
export const IconCoins = (p: IconProps) =>
  I(p, (
    <>
      <ellipse cx="9" cy="8" rx="6" ry="3" />
      <path d="M3 8v5c0 1.7 2.7 3 6 3M3 13v5c0 1.7 2.7 3 6 3" />
      <ellipse cx="15" cy="14" rx="6" ry="3" />
      <path d="M9 14v5c0 1.7 2.7 3 6 3 3.3 0 6-1.3 6-3v-5" />
    </>
  ));
export const IconCheckDouble = (p: IconProps) =>
  I(p, <path d="m3 12 4 4 7-9M11 16l3 3 7-12" />);
export const IconLadder = (p: IconProps) =>
  I(p, (
    <>
      <path d="M7 3v18M17 3v18M7 7h10M7 12h10M7 17h10" />
    </>
  ));
export const IconPulse = (p: IconProps) =>
  I(p, <path d="M3 12h4l2-6 4 12 2-6h6" />);

/* Email icons */
export const IconMail = (p: IconProps) =>
  I(p, (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </>
  ));
export const IconMailOpen = (p: IconProps) =>
  I(p, (
    <>
      <path d="m3 9 9-6 9 6v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path d="m3 9 9 6 9-6" />
    </>
  ));
export const IconCursorClick = (p: IconProps) =>
  I(p, (
    <>
      <path d="M4 4l5 12 2-5 5-2z" />
      <path d="m13 13 5 5" />
    </>
  ));
export const IconReply = (p: IconProps) =>
  I(p, <path d="M9 7 4 12l5 5M4 12h10a6 6 0 0 1 6 6v1" />);

/* Architecture icons */
export const IconTerminal = (p: IconProps) =>
  I(p, (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="m7 9 3 3-3 3M13 15h4" />
    </>
  ));
export const IconDatabase = (p: IconProps) =>
  I(p, (
    <>
      <ellipse cx="12" cy="5" rx="8" ry="3" />
      <path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />
    </>
  ));
export const IconCloud = (p: IconProps) =>
  I(p, (
    <path d="M7 18a5 5 0 1 1 .7-9.95A6 6 0 0 1 19 11.5a4.5 4.5 0 0 1-1 8.5z" />
  ));
export const IconCog = (p: IconProps) =>
  I(p, (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2" />
    </>
  ));
export const IconShield = (p: IconProps) =>
  I(p, <path d="M12 3 4 6v5c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6z" />);
export const IconLink = (p: IconProps) =>
  I(p, (
    <>
      <path d="M10 14a4 4 0 0 0 5.7 0l3.3-3.3a4 4 0 0 0-5.7-5.7l-1 1" />
      <path d="M14 10a4 4 0 0 0-5.7 0L5 13.3a4 4 0 0 0 5.7 5.7l1-1" />
    </>
  ));

/* Funnel / sales icons */
export const IconFunnel = (p: IconProps) =>
  I(p, <path d="M3 5h18l-7 8v6l-4-2v-4z" />);
export const IconSparkle = (p: IconProps) =>
  I(p, (
    <path d="m12 3 2 6 6 2-6 2-2 6-2-6-6-2 6-2zM19 4l.7 2 2 .7-2 .7L19 9.4 18.3 7.4l-2-.7 2-.7z" />
  ));
export const IconBolt = (p: IconProps) =>
  I(p, <path d="M13 3 4 14h7l-1 7 9-11h-7z" />);

/* Helper: map icon name → component, so callers can look up by key. */
export const iconMap = {
  checkCircle: IconCheckCircle,
  award: IconAward,
  share: IconShare,
  compass: IconCompass,
  radio: IconRadio,
  bullhorn: IconBullhorn,
  phone: IconPhone,
  target: IconTarget,
  arrowUp: IconArrowUp,
  building: IconBuilding,
  users: IconUsers,
  gift: IconGift,
  handshake: IconHandshake,
  stats: IconStats,
  calendar: IconCalendar,
  download: IconDownload,
  compare: IconCompare,
  flag: IconFlag,
  coins: IconCoins,
  checkDouble: IconCheckDouble,
  ladder: IconLadder,
  pulse: IconPulse,
  mail: IconMail,
  mailOpen: IconMailOpen,
  cursorClick: IconCursorClick,
  reply: IconReply,
  terminal: IconTerminal,
  database: IconDatabase,
  cloud: IconCloud,
  cog: IconCog,
  shield: IconShield,
  link: IconLink,
  funnel: IconFunnel,
  sparkle: IconSparkle,
  bolt: IconBolt,
} as const;

export type IconKey = keyof typeof iconMap;
