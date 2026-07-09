import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MenuPicker from '@/components/order/MenuPicker';
import CartPanel from '@/components/order/CartPanel';

export const metadata = {
  title: 'Order Online — Ubuntu Cafe & Lounge',
  description:
    'Build your order from the Ubuntu Cafe & Lounge menu — for dine-in or pickup.',
};

export default function OrderPage() {
  return (
    <>
      <Navbar />
      <main className="bg-ivory dark:bg-charcoal min-h-screen pt-32 pb-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="max-w-2xl">
            <span className="eyebrow">Order Online</span>
            <h1 className="font-display text-4xl sm:text-5xl text-charcoal dark:text-ivory mt-4">
              Build Your Table
            </h1>
            <p className="mt-5 font-body text-charcoal/65 dark:text-ivory/65 leading-relaxed">
              Choose your dishes, tell us where to send them, and we&rsquo;ll
              take it from there.
            </p>
          </div>

          <div className="mt-14 grid lg:grid-cols-[1fr_400px] gap-12 lg:gap-16 items-start">
            <MenuPicker />

            <div className="lg:sticky lg:top-28">
              <CartPanel />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
