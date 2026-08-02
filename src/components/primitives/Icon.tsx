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

/* The HMS shield's own blue and pale field, overridable from the token file. */
const HMS_MARK = 'var(--c-hms-mark, #0046c7)';
const HMS_FIELD = 'var(--c-hms-field, #e7effd)';

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

  /*
   * Drawn on the 41-unit thumbnail box rather than the 24-unit grid the other
   * icons use, so the glyph's inset inside the tile comes from the artwork and
   * doesn't have to be reproduced in CSS. The tile itself is .iconBox.
   */
  truck: (
    <g fill="currentColor">
      <path d="M9.625 20.4043H20.5V22.2168H9.625V20.4043ZM7.8125 15.873H16.875V17.6855H7.8125V15.873Z" />
      <path d="M33.114 20.9535L30.3953 14.6097C30.3254 14.4468 30.2092 14.3078 30.0612 14.2102C29.9132 14.1126 29.7397 14.0606 29.5624 14.0605H26.8437V12.248C26.8437 12.0077 26.7482 11.7772 26.5782 11.6072C26.4083 11.4373 26.1778 11.3418 25.9374 11.3418H11.4374V13.1543H25.0312V24.5332C24.6185 24.7733 24.2573 25.0925 23.9683 25.4726C23.6793 25.8527 23.4683 26.2862 23.3473 26.748H17.6525C17.4319 25.8938 16.9073 25.1493 16.1771 24.6541C15.4469 24.1589 14.5611 23.947 13.6858 24.0582C12.8105 24.1694 12.0059 24.5959 11.4226 25.258C10.8394 25.92 10.5176 26.772 10.5176 27.6543C10.5176 28.5366 10.8394 29.3886 11.4226 30.0506C12.0059 30.7127 12.8105 31.1392 13.6858 31.2504C14.5611 31.3616 15.4469 31.1497 16.1771 30.6545C16.9073 30.1593 17.4319 29.4148 17.6525 28.5605H23.3473C23.5445 29.3383 23.9953 30.0282 24.6286 30.5209C25.2618 31.0137 26.0413 31.2812 26.8437 31.2812C27.646 31.2812 28.4255 31.0137 29.0587 30.5209C29.692 30.0282 30.1428 29.3383 30.34 28.5605H32.2812C32.5215 28.5605 32.752 28.4651 32.922 28.2951C33.0919 28.1252 33.1874 27.8946 33.1874 27.6543V21.3105C33.1874 21.1878 33.1624 21.0663 33.114 20.9535ZM14.1562 29.4668C13.7977 29.4668 13.4473 29.3605 13.1492 29.1613C12.8511 28.9622 12.6188 28.6791 12.4816 28.3479C12.3444 28.0167 12.3085 27.6523 12.3785 27.3007C12.4484 26.9491 12.621 26.6262 12.8745 26.3727C13.128 26.1192 13.451 25.9466 13.8026 25.8766C14.1541 25.8067 14.5186 25.8426 14.8498 25.9798C15.181 26.117 15.464 26.3493 15.6632 26.6473C15.8624 26.9454 15.9687 27.2958 15.9687 27.6543C15.9687 28.135 15.7777 28.596 15.4378 28.9359C15.0979 29.2758 14.6369 29.4668 14.1562 29.4668ZM26.8437 15.873H28.9643L30.9073 20.4043H26.8437V15.873ZM26.8437 29.4668C26.4852 29.4668 26.1348 29.3605 25.8367 29.1613C25.5386 28.9622 25.3063 28.6791 25.1691 28.3479C25.0319 28.0167 24.996 27.6523 25.066 27.3007C25.1359 26.9491 25.3085 26.6262 25.562 26.3727C25.8155 26.1192 26.1385 25.9466 26.4901 25.8766C26.8416 25.8067 27.2061 25.8426 27.5373 25.9798C27.8685 26.117 28.1515 26.3493 28.3507 26.6473C28.5499 26.9454 28.6562 27.2958 28.6562 27.6543C28.6562 28.135 28.4652 28.596 28.1253 28.9359C27.7854 29.2758 27.3244 29.4668 26.8437 29.4668ZM31.3749 26.748H30.34C30.1403 25.9718 29.6888 25.2837 29.056 24.7917C28.4233 24.2997 27.6452 24.0315 26.8437 24.0293V22.2168H31.3749V26.748Z" />
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

  /*
   * The home-monitoring shield in the plan lockup. Two overlapping shields —
   * a pale field set down and left, an outlined one up and right — with the
   * wyze wordmark across the middle. Redrawn from the layer geometry on a
   * 140×170 box (the mark is 14×17 at its mobile size, so 1px = 10 units,
   * which is why the 0.5px outline is a stroke of 5).
   *
   * It paints itself rather than inheriting currentColor: the design gives it
   * its own blue, which is not the wyze purple used around it.
   */
  wyze: (
    <g>
      {/* Pale field: rounded shoulders, sides tapering to a soft point. */}
      <path
        d="M0.93907 2.54734C0.93907 2.54734 0 2.71817 0 3.51161V9.29343C0 12.3836 4.53073 15.8231 6.06841 16.8481C6.3752 17.0531 6.77178 17.0531 7.07857 16.8481C8.61999 15.8269 13.147 12.3874 13.147 9.29343V3.51161C13.147 2.71817 12.2079 2.54734 12.2079 2.54734L7.13095 0.945281C6.76804 0.831391 6.37894 0.831391 6.01604 0.945281L0.93907 2.54734Z"
        fill={HMS_FIELD}
      />
      {/* The same shield offset up and right, drawn as a hairline outline. */}
      <path
        d="M2.08006 1.8716C2.08006 1.8716 2.10999 1.864 2.12869 1.86021L7.20566 0.258153C7.49 0.167041 7.79678 0.167041 8.08112 0.258153L13.1581 1.86021C13.1581 1.86021 13.188 1.8678 13.2067 1.8716C13.2067 1.8716 13.2142 1.8716 13.2254 1.87539C13.2441 1.87919 13.2703 1.88678 13.304 1.89817C13.3713 1.92095 13.4574 1.95512 13.5434 2.00447C13.7081 2.10317 13.8166 2.23225 13.8166 2.42966V8.21148C13.8166 8.88343 13.5696 9.60474 13.1394 10.345C12.7129 11.0815 12.1217 11.8066 11.4745 12.4786C10.1763 13.8263 8.68348 14.9234 7.93147 15.4207C7.75937 15.5346 7.53863 15.5346 7.36653 15.4207C6.61079 14.9196 5.12174 13.8225 3.82351 12.4748C3.17626 11.8028 2.58513 11.0777 2.15862 10.3412C1.73211 9.60474 1.48145 8.88343 1.48145 8.20768V2.42966C1.48145 2.23225 1.5862 2.10317 1.75456 2.00447C1.83687 1.95512 1.92292 1.92095 1.99401 1.89817C2.02768 1.88678 2.05387 1.87919 2.07257 1.87539C2.08006 1.87539 2.08754 1.87539 2.09128 1.8716H2.08006Z"
        fill="none"
        stroke={HMS_MARK}
        strokeWidth={0.5}
      />
      {/* Wordmark: w, y and z are filled outlines; the e is three bars. */}
      <g fill={HMS_MARK}>
        <path d="M4.38483 5.95264H4.00696L4.38483 6.85616L4.05186 7.63821L3.34101 5.95264H2.96313L3.93588 8.276H4.17158L4.57564 7.31932L4.9797 8.276H5.21541L6.18815 5.95264H5.81028L5.09943 7.6534L4.38858 5.95264H4.38483Z" />
        <path d="M7.98387 5.95264L7.33288 7.12191L6.68189 5.95264H6.27783L7.16826 7.53571V8.26461H7.51247V7.53571L8.38793 5.95264H7.98387Z" />
        <path d="M8.49276 5.95264V6.33986H9.67875L8.35059 8.27979H10.2811V7.89636H9.06144L10.4008 5.95643H8.49276V5.95264Z" />
        <path d="M10.5093 6.35125H12.3089V5.95264H10.5093V6.35125Z" />
        <path d="M10.5093 7.30792H12.3089V6.9093H10.5093V7.30792Z" />
        <path d="M10.5093 8.27593H12.3089V7.87732H10.5093V8.27593Z" />
      </g>
    </g>
  ),
};

/** Icons that aren't square carry their own box; `size` then sets the height. */
const GEOMETRY: Partial<Record<IconId, { viewBox: string; ratio: number }>> = {
  wyze: { viewBox: '0 0 14 17', ratio: 14 / 17 },
  truck: { viewBox: '0 0 41 41', ratio: 1 },
};

export function Icon({ name, size = 24, title, ...rest }: IconProps) {
  const geometry = GEOMETRY[name];
  return (
    <svg
      viewBox={geometry?.viewBox ?? '0 0 24 24'}
      width={geometry ? size * geometry.ratio : size}
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
