import Link from 'next/link';
import UbuntuKnot from './UbuntuKnot';
import PatternDivider from './PatternDivider';

const SOCIALS = [
  { label: 'Instagram', href: 'https://instagram.com' },
  { label: 'Facebook', href: 'https://facebook.com' },
  { label: 'TikTok', href: 'https://tiktok.com' },
];

export default function Footer() {
  return (
    <footer id="footer" className="relative bg-charcoal-dark">
      <PatternDivider />

      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-16 grid sm:grid-cols-3 gap-10">
        <div>
          <div className="flex items-center gap-3">
            <UbuntuKnot className="h-6 w-6" />
            <span className="font-display text-lg text-ivory">
              Ubuntu Cafe &amp; Lounge
            </span>
          </div>
          <p className="mt-4 font-body text-sm text-ivory/50 leading-relaxed max-w-xs">
            A modern African table, built on one idea: I am because we are.
          </p>
        </div>

        <div>
          <h3 className="font-display text-sm text-gold uppercase tracking-wide mb-4">
            Visit
          </h3>
          <p className="font-body text-sm text-ivory/50 leading-relaxed">
            14 Adum Terrace
            <br />
            Kumasi, Ashanti Region, Ghana
            <br />
            +233 24 000 0000
          </p>
        </div>

        <div>
          <h3 className="font-display text-sm text-gold uppercase tracking-wide mb-4">
            Follow
          </h3>
          <ul className="flex flex-col gap-2">
            {SOCIALS.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body text-sm text-ivory/50 hover:text-gold transition-colors duration-300"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-ivory/10">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-6 flex flex-wrap items-center justify-between gap-3">
          <p className="font-body text-xs text-ivory/35 tracking-wide">
            &copy; {new Date().getFullYear()} Ubuntu Cafe &amp; Lounge. All
            rights reserved.
          </p>
          <Link
            href="/admin"
            className="font-body text-xs text-ivory/25 hover:text-gold/70 tracking-wide transition-colors duration-300"
          >
            Cafe Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
