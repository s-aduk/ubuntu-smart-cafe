import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { CartProvider } from '@/context/CartContext';
import { ToastProvider } from '@/context/ToastContext';
import './globals.css';

// Elegant serif for headings — set as a CSS variable so Tailwind's
// `font-display` utility (see tailwind.config.js) can reference it.
const display = Playfair_Display({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});

// Clean, ultra-readable sans-serif for body copy and UI chrome.
const body = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata = {
  title: 'Ubuntu Cafe & Lounge — Gather. Sip. Savor.',
  description:
    'A premium modern African restaurant and lounge. Authentic West, East, North, and Southern African cuisine, artisan drinks, and communal hospitality rooted in Ubuntu — I am because we are.',
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable}`}
      suppressHydrationWarning
    >
      <body className="font-body bg-charcoal text-ivory antialiased">
        {/* Dark is the brand's default "core luxury look"; next-themes
            persists the visitor's choice in localStorage from there on. */}
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <ToastProvider>
            <CartProvider>{children}</CartProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
