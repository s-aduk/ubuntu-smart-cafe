import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import UbuntuStory from '@/components/UbuntuStory';
import Menu from '@/components/Menu';
import Reservations from '@/components/Reservations';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <UbuntuStory />
        <Menu />
        <Reservations />
      </main>
      <Footer />
    </>
  );
}
