import type { ReactElement, SVGProps } from 'react';
import type { IconId } from '@/types/catalog';

/**
 * Icons are hand-authored SVG rather than exported assets: the Figma file was
 * View-only for the connected account, so these are redrawn from the design
 * screenshots. They inherit `currentColor` so a single CSS rule recolours them.
 */

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconId;
  size?: number;
  title?: string;
}

const STROKE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

/** Step 4's icon: a stack of dots widening toward the base. */
function DotPyramid() {
  const rows = [2, 3, 4, 5];
  const dots: { cx: number; cy: number }[] = [];
  rows.forEach((count, row) => {
    const y = 5.5 + row * 4.4;
    const spacing = 3.6;
    const startX = 12 - ((count - 1) * spacing) / 2;
    for (let i = 0; i < count; i += 1) dots.push({ cx: startX + i * spacing, cy: y });
  });
  return (
    <>
      {dots.map((dot) => (
        <circle key={`${dot.cx}-${dot.cy}`} cx={dot.cx} cy={dot.cy} r={1.15} fill="currentColor" />
      ))}
    </>
  );
}

const PATHS: Record<IconId, ReactElement> = {
  // Step 1 — a monitor-style security camera on a stand.
  camera: (
    <g {...STROKE}>
      <rect x="2.75" y="4" width="18.5" height="13.5" rx="3.2" />
      <circle cx="12" cy="10.75" r="3.3" />
      <circle cx="12" cy="10.75" r="1.1" fill="currentColor" stroke="none" />
      <path d="M12 17.5v3M8.75 20.5h6.5" />
    </g>
  ),

  // Step 2 — plan.
  shield: (
    <g {...STROKE}>
      <path d="M12 2.75 19.25 5.6v5.4c0 4.65-3.05 8.2-7.25 10.25C7.8 19.2 4.75 15.65 4.75 11V5.6L12 2.75Z" />
    </g>
  ),

  // Step 3 — a sensor with radiating detection waves.
  sensor: (
    <g {...STROKE}>
      <rect x="7.75" y="2.75" width="8.5" height="6.5" rx="3.25" />
      <circle cx="10.3" cy="6" r="0.85" fill="currentColor" stroke="none" />
      <circle cx="13.7" cy="6" r="0.85" fill="currentColor" stroke="none" />
      <path d="M3.75 13.4c2.6-2.15 13.9-2.15 16.5 0" />
      <path d="M6.1 17.05c2-1.6 9.8-1.6 11.8 0" />
      <path d="M8.6 20.4c1.35-1 5.45-1 6.8 0" />
    </g>
  ),

  // Step 4 — extra protection.
  grid: <DotPyramid />,

  truck: (
    <g {...STROKE}>
      <path d="M9.5 7.5h6.75v9H9.5z" />
      <path d="M16.25 10.75h2.6l2.4 2.6v3.15h-5z" />
      <circle cx="12" cy="18.4" r="1.85" />
      <circle cx="18.6" cy="18.4" r="1.85" />
      <path d="M2.5 9h4.5M1.25 12.25h5.75M3 15.5h4" />
    </g>
  ),

  chevron: <path d="M5.5 9 12 16l6.5-7z" fill="currentColor" />,

  minus: <path d="M5.5 12h13" {...STROKE} strokeWidth={2} />,

  plus: <path d="M12 5.5v13M5.5 12h13" {...STROKE} strokeWidth={2} />,

  seal: (
    <g {...STROKE}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 2.75 2.75L16 9.5" />
    </g>
  ),

  // Wyze shield mark used by the plan lockup.
  wyze: (
    <g>
      <path
        d="M12 2.6 19.4 5.5v5.6c0 4.7-3.1 8.3-7.4 10.3-4.3-2-7.4-5.6-7.4-10.3V5.5L12 2.6Z"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinejoin="round"
      />
      <text
        x="12"
        y="13.6"
        textAnchor="middle"
        fontSize="5.6"
        fontWeight="800"
        fill="currentColor"
        fontFamily="var(--font-sans)"
        letterSpacing="-0.2"
      >
        WYZE
      </text>
    </g>
  ),
};

export function Icon({ name, size = 24, title, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable="false"
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {PATHS[name]}
    </svg>
  );
}
