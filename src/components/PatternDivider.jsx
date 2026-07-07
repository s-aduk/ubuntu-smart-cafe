// A restrained, geometric strip inspired by kente weaving patterns —
// used as a border seam rather than a loud decorative band.
export default function PatternDivider({ className = '' }) {
  return (
    <svg
      viewBox="0 0 240 8"
      preserveAspectRatio="none"
      className={`w-full h-2 ${className}`}
      aria-hidden="true"
    >
      <pattern
        id="patternDividerTriangles"
        x="0"
        y="0"
        width="16"
        height="8"
        patternUnits="userSpaceOnUse"
      >
        <path d="M0 8 L8 0 L16 8 Z" fill="#D4AF37" fillOpacity="0.55" />
      </pattern>
      <rect width="240" height="8" fill="url(#patternDividerTriangles)" />
    </svg>
  );
}
