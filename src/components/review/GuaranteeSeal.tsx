import styles from './GuaranteeSeal.module.css';

/**
 * The scalloped satisfaction seal. Drawn rather than exported as an asset:
 * the lobed outline is generated from a polar equation, and the ring of copy
 * rides a circular <textPath>.
 */

const LOBES = 16;
const BASE_RADIUS = 45;
const LOBE_DEPTH = 3.6;
const SAMPLES = 480;

function scallopedPath(): string {
  const points: string[] = [];
  for (let i = 0; i <= SAMPLES; i += 1) {
    const angle = (i / SAMPLES) * Math.PI * 2;
    const radius = BASE_RADIUS + LOBE_DEPTH * Math.cos(LOBES * angle);
    const x = 50 + radius * Math.cos(angle);
    const y = 50 + radius * Math.sin(angle);
    points.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return `${points.join(' ')} Z`;
}

const SEAL_PATH = scallopedPath();
/** Counter-clockwise so the ring of text reads the right way up. */
const TEXT_ARC = 'M 50 12 A 38 38 0 1 1 49.9 12';

interface GuaranteeSealProps {
  ringText: string;
  size?: number;
  className?: string;
}

export function GuaranteeSeal({ ringText, size = 112, className }: GuaranteeSealProps) {
  const ring = `${ringText}   ·   `.repeat(3);

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={[styles.seal, className].filter(Boolean).join(' ')}
      role="img"
      aria-label="100% Wyze satisfaction guarantee"
    >
      <path d={SEAL_PATH} className={styles.body} />

      <defs>
        <path id="guaranteeArc" d={TEXT_ARC} fill="none" />
      </defs>
      <text className={styles.ring}>
        <textPath href="#guaranteeArc" startOffset="0">
          {ring}
        </textPath>
      </text>

      <text x="50" y="44" textAnchor="middle" className={styles.percent}>
        100%
      </text>
      <text x="50" y="55" textAnchor="middle" className={styles.brand}>
        Wyze
      </text>
      <text x="50" y="64" textAnchor="middle" className={styles.caption}>
        satisfaction
      </text>
      <text x="50" y="72" textAnchor="middle" className={styles.caption}>
        guarantee
      </text>
    </svg>
  );
}
