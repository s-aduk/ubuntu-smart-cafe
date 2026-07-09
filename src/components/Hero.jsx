import UbuntuKnot from './UbuntuKnot';

export default function Hero() {
  return (
    <section
      id="top"
      className="relative min-h-[100svh] flex items-end overflow-hidden bg-ivory dark:bg-charcoal"
    >
      {/* Placeholder imagery — swap these src values for licensed photography
          of the actual interior and plated dishes before launch. */}
      <div className="absolute inset-0">
        <img
          src="https://res.cloudinary.com/dnqbicyyh/image/upload/v1783430578/my-hero-image_s8zpsu.png"
          alt="Warm, modern African-inspired lounge interior with textured lighting"
          className="h-full w-full object-cover object-center opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/60 to-charcoal/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/70 via-transparent to-charcoal/40" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl w-full px-6 lg:px-10 pb-24 pt-40">
        <div className="flex items-center gap-3 mb-8">
          <UbuntuKnot className="h-6 w-6" />
          <span className="eyebrow-on-image">Modern African Dining &amp; Lounge</span>
        </div>

        <h1 className="font-display text-5xl sm:text-6xl lg:text-8xl leading-[1.02] text-ivory max-w-4xl">
          Gather. Sip. Savor.
          <span className="block text-terracotta mt-2">
            Authentic African Cuisine.
          </span>
        </h1>

        <p className="mt-8 max-w-xl font-body text-base sm:text-lg text-ivory/75 leading-relaxed">
          Ubuntu Cafe &amp; Lounge brings the continent&rsquo;s bold flavours and
          communal spirit to one table &mdash; where every plate is shared and
          every guest belongs.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-5">
          <a
            href="#menu"
            className="inline-flex items-center gap-2 bg-terracotta hover:bg-terracotta-light text-ivory font-body font-semibold px-8 py-4 rounded-full transition-colors duration-300"
          >
            Explore Our Menu
            <span aria-hidden="true">&rarr;</span>
          </a>
          <a
            href="#reservations"
            className="inline-flex items-center gap-2 border border-ivory/25 hover:border-gold text-ivory font-body font-medium px-8 py-4 rounded-full transition-colors duration-300"
          >
            Reserve a Table
          </a>
        </div>
      </div>
    </section>
  );
}
