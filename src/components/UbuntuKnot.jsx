// Three interlocking rings — no ring complete without the other two.
// A visual shorthand for "Umuntu ngumuntu ngabantu": I am because we are.
export default function UbuntuKnot({ className = 'h-8 w-8', color = '#D4AF37' }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`ubuntu-knot ${className}`}
      aria-hidden="true"
    >
      <circle cx="24" cy="24" r="14" stroke={color} strokeWidth="2.5" />
      <circle cx="40" cy="24" r="14" stroke={color} strokeWidth="2.5" />
      <circle cx="32" cy="38" r="14" stroke={color} strokeWidth="2.5" />
    </svg>
  );
}
