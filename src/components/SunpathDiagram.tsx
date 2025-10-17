import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sun } from "lucide-react";

interface SegmentOverlay {
  pitchDegrees: number;            // panel tilt (0 = flat, 90 = vertical)
  azimuthDegrees: number;          // 0=N, 90=E, 180=S, 270=W
  areaMeters2?: number;            // size cue
  sunshineQuantiles?: number[];    // quality cue (e.g., median sunshine)
  label?: string;
}

interface SunpathDiagramProps {
  latitude: number;
  longitude: number;
  date?: Date;
  segments?: SegmentOverlay[];           // optional overlays from Solar API
  maxSunshineHoursPerYear?: number;      // for color scaling
}

// Util: degrees/radians
function toRadians(deg: number): number { return (deg * Math.PI) / 180; }
function toDegrees(rad: number): number { return (rad * 180) / Math.PI; }

// Given latitude (deg) and solar declination (deg),
// generate sun altitude/azimuth pairs for the day at 5-min steps.
function generateSunCurve(latitudeDeg: number, declinationDeg: number): Array<{ az: number; alt: number }> {
  const lat = toRadians(latitudeDeg);
  const dec = toRadians(declinationDeg);

  // Hour angle at sunrise/sunset (radians). If no sunrise, clamp to [0, pi].
  const cosH0 = -Math.tan(lat) * Math.tan(dec);
  const H0 = Math.acos(Math.max(-1, Math.min(1, cosH0)));

  const points: Array<{ az: number; alt: number }> = [];
  const steps = 120; // ~5 min resolution
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const H = -H0 + 2 * H0 * t; // hour angle sweep [-H0, +H0]

    // Altitude (spherical astronomy):
    const sinAlt = Math.sin(lat) * Math.sin(dec) + Math.cos(lat) * Math.cos(dec) * Math.cos(H);
    const alt = Math.max(-90, Math.min(90, toDegrees(Math.asin(sinAlt))));

    // Azimuth (measured from South, positive West):
    // Use atan2 form ensuring correct quadrant.
    const y = Math.sin(H);
    const x = Math.cos(H) * Math.sin(lat) - Math.tan(dec) * Math.cos(lat);
    let azSouth = toDegrees(Math.atan2(y, x)); // -180..+180 (0 = South)

    // Convert to MCS-style side view: -90 (East) .. 0 (South) .. +90 (West)
    // Clamp to [-90, +90] for side-view usability.
    azSouth = Math.max(-90, Math.min(90, azSouth));

    if (alt > -1e-6) points.push({ az: azSouth, alt });
  }
  return points;
}

// Render an SVG polyline path from points in az/alt degrees into pixel coords.
function buildPath(points: Array<{ az: number; alt: number }>, xScale: (d: number) => number, yScale: (d: number) => number): string {
  if (points.length === 0) return "";
  return points.map((p, idx) => `${idx === 0 ? "M" : "L"}${xScale(p.az)},${yScale(p.alt)}`).join(" ");
}

/**
 * SunpathDiagram (Cartesian side-view)
 * X-axis: azimuth relative to South (°) -90° (East) .. 0° (South) .. +90° (West)
 * Y-axis: altitude above horizon (°) 0..90
 * Includes MCS-style "Do not count" masks at very low altitude and extreme azimuths.
 */
export function SunpathDiagram({ latitude, longitude, date = new Date(), segments = [], maxSunshineHoursPerYear = 1100 }: SunpathDiagramProps) {
  // Layout
  const width = 760;
  const height = 420;
  const margin = { top: 24, right: 20, bottom: 40, left: 48 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  // Scales
  const xMin = -90, xMax = 90; // azimuth relative to South
  const yMin = 0, yMax = 90; // altitude
  const xScale = (az: number) => margin.left + ((az - xMin) / (xMax - xMin)) * innerW;
  const yScale = (alt: number) => margin.top + innerH - ((alt - yMin) / (yMax - yMin)) * innerH;

  // Seasonal curves (approx declinations): winter, equinox, summer.
  const curves = [
    { label: "Winter", dec: -23.44, color: "#64748b" },
    { label: "Equinox", dec: 0, color: "#0ea5e9" },
    { label: "Summer", dec: 23.44, color: "#f59e0b" },
  ].map(c => ({ ...c, pts: generateSunCurve(latitude, c.dec) }));

  // Grid lines
  const azLines = [-90, -75, -60, -45, -30, -15, 0, 15, 30, 45, 60, 75, 90];
  const altLines = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90];

  // MCS-style do-not-count masks (configurable):
  const bottomCutAlt = 10; // ignore shading below 10° altitude
  const sideCutAz = 80; // ignore beyond ±80° azimuth

  // Bottom mask polygon
  const bottomMask = `M${xScale(xMin)},${yScale(bottomCutAlt)} L${xScale(xMax)},${yScale(bottomCutAlt)} L${xScale(xMax)},${yScale(yMin)} L${xScale(xMin)},${yScale(yMin)} Z`;
  // Side mask polygons
  const leftMask = `M${xScale(xMin)},${yScale(yMax)} L${xScale(-sideCutAz)},${yScale(yMax)} L${xScale(-sideCutAz)},${yScale(yMin)} L${xScale(xMin)},${yScale(yMin)} Z`;
  const rightMask = `M${xScale(sideCutAz)},${yScale(yMax)} L${xScale(xMax)},${yScale(yMax)} L${xScale(xMax)},${yScale(yMin)} L${xScale(sideCutAz)},${yScale(yMin)} Z`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sun className="h-5 w-5 text-yellow-500" />
          <span>Sun Path (Side View)</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full overflow-x-auto">
          <svg width={width} height={height} role="img" aria-label="Sun path side-view diagram">
            {/* Grid background */}
            <rect x={margin.left} y={margin.top} width={innerW} height={innerH} rx={8} className="fill-white stroke-gray-200" />

            {/* Altitude horizontal grid */}
            {altLines.map((alt) => (
              <g key={`alt-${alt}`}>
                <line x1={xScale(xMin)} x2={xScale(xMax)} y1={yScale(alt)} y2={yScale(alt)} className="stroke-gray-200" />
                <text x={xScale(xMin) - 8} y={yScale(alt) + 4} className="fill-gray-500 text-[10px]" textAnchor="end">{alt}°</text>
              </g>
            ))}

            {/* Azimuth vertical grid */}
            {azLines.map((az) => (
              <g key={`az-${az}`}>
                <line x1={xScale(az)} x2={xScale(az)} y1={yScale(yMin)} y2={yScale(yMax)} className="stroke-gray-200" />
                <text x={xScale(az)} y={yScale(yMin) + 16} className="fill-gray-500 text-[10px]" textAnchor="middle">{az}°</text>
              </g>
            ))}

            {/* Axes labels */}
            <text x={xScale(0)} y={yScale(yMin) + 30} className="fill-gray-700 text-[11px]" textAnchor="middle">South (0°)</text>
            <text x={xScale(-90)} y={yScale(yMin) + 30} className="fill-gray-700 text-[11px]" textAnchor="start">East (-90°)</text>
            <text x={xScale(90)} y={yScale(yMin) + 30} className="fill-gray-700 text-[11px]" textAnchor="end">West (+90°)</text>
            <text x={xScale(xMin) - 22} y={yScale((yMin + yMax) / 2)} className="fill-gray-700 text-[11px]" transform={`rotate(-90 ${xScale(xMin) - 22},${yScale((yMin + yMax) / 2)})`} textAnchor="middle">Altitude (° above horizon)</text>

            {/* Do-not-count masks */}
            <path d={bottomMask} className="fill-gray-300/60" />
            <path d={leftMask} className="fill-gray-300/60" />
            <path d={rightMask} className="fill-gray-300/60" />
            <text x={xScale(-85)} y={yScale(50)} className="fill-gray-600 text-[10px]" transform={`rotate(-90 ${xScale(-85)},${yScale(50)})`} textAnchor="middle">Do not count</text>
            <text x={xScale(85)} y={yScale(50)} className="fill-gray-600 text-[10px]" transform={`rotate(90 ${xScale(85)},${yScale(50)})`} textAnchor="middle">Do not count</text>

            {/* Seasonal sun paths */}
            {curves.map((c) => (
              <g key={c.label}>
                <path d={buildPath(c.pts, xScale, yScale)} className="fill-none" stroke={c.color} strokeWidth={2} />
                {/* Label near the highest point of the curve */}
                {(() => {
                  const maxAltPt = c.pts.reduce((a, b) => (b.alt > a.alt ? b : a), c.pts[0] ?? { az: 0, alt: 0 });
                  if (!maxAltPt) return null;
                  return (
                    <text x={xScale(maxAltPt.az)} y={yScale(maxAltPt.alt) - 6} className="text-[10px]" fill={c.color} textAnchor="middle">{c.label}</text>
                  );
                })()}
              </g>
            ))}

            {/* Segment overlays from Solar API */}
            {segments.map((s, idx) => {
              // Convert azimuth from North-referenced to South-relative.
              // South-relative azimuth: azSouth = az - 180 → clamp to [-90, +90]
              let azSouth = ((s.azimuthDegrees ?? 180) - 180);
              if (azSouth < -180) azSouth += 360; if (azSouth > 180) azSouth -= 360;
              azSouth = Math.max(-90, Math.min(90, azSouth));

              // Optimal altitude when incidence ≈ 0 is roughly 90 - tilt.
              const altOpt = Math.max(0, Math.min(90, 90 - (s.pitchDegrees ?? 0)));

              // Size by area (m²) → 4..12 px
              const r = (() => {
                const a = Math.max(0, Math.min(200, s.areaMeters2 ?? 0));
                return 4 + (Math.sqrt(a) / Math.sqrt(200)) * 8;
              })();

              // Color by median sunshine (relative to site max) → red→yellow→green
              const median = (s.sunshineQuantiles && s.sunshineQuantiles.length > 0)
                ? s.sunshineQuantiles[Math.floor(s.sunshineQuantiles.length / 2)]
                : maxSunshineHoursPerYear * 0.5;
              const t = Math.max(0, Math.min(1, median / maxSunshineHoursPerYear));
              const hue = 0 + 120 * t; // 0=red, 120=green
              const fill = `hsl(${hue} 80% 45%)`;

              const cx = xScale(azSouth);
              const cy = yScale(altOpt);

              return (
                <g key={`seg-${idx}`}>
                  {/* guide line to x-axis */}
                  <line x1={cx} y1={yScale(yMin)} x2={cx} y2={cy} className="stroke-gray-300" strokeDasharray="2 3" />
                  {/* dot */}
                  <circle cx={cx} cy={cy} r={r} fill={fill} className="stroke-white" />
                  <title>
                    {`${s.label ?? `Segment ${idx + 1}`}\nAzimuth: ${s.azimuthDegrees.toFixed?.(1) ?? s.azimuthDegrees}° (south-relative ${azSouth.toFixed(1)}°)\nPitch: ${s.pitchDegrees.toFixed?.(1) ?? s.pitchDegrees}°\nArea: ${s.areaMeters2 ?? 0} m²\nMedian sunshine: ${median.toFixed(1)} h/yr`}
                  </title>
                </g>
              );
            })}

            {/* Caption */}
            <text x={xScale(0)} y={margin.top - 6} textAnchor="middle" className="fill-gray-700 text-[12px] font-medium">
              Sun paths (Winter / Equinox / Summer) — Latitude {latitude.toFixed(2)}°
            </text>
          </svg>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Note: Shaded regions indicate MCS-style areas to exclude when assessing overshading (very low altitude and extreme azimuths).
        </p>
        <p className="text-xs text-muted-foreground">Lat {latitude.toFixed(4)}°, Lon {longitude.toFixed(4)}° • {date.toLocaleDateString()}</p>
      </CardContent>
    </Card>
  );
}

