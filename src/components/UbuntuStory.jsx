import PatternDivider from './PatternDivider';

const HOURS = [
  { day: 'Monday \u2013 Thursday', time: '5:00 PM \u2013 11:00 PM' },
  { day: 'Friday \u2013 Saturday', time: '5:00 PM \u2013 1:00 AM' },
  { day: 'Sunday', time: '12:00 PM \u2013 9:00 PM (Communal Brunch)' },
];

export default function UbuntuStory() {
  return (
    <section id="story" className="relative bg-ivory dark:bg-charcoal py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 grid lg:grid-cols-2 gap-16 lg:gap-20 items-start">
        {/* Column 1 — philosophy */}
        <div>
          <span className="eyebrow">The Ubuntu Story</span>
          <h2 className="font-display text-4xl sm:text-5xl text-charcoal dark:text-ivory mt-4 leading-tight">
            &ldquo;I am because
            <span className="text-emerald dark:text-emerald-light"> we are.</span>&rdquo;
          </h2>

          <div className="mt-8 space-y-5 font-body text-charcoal/70 dark:text-ivory/75 leading-relaxed max-w-lg">
            <p>
              Ubuntu is a philosophy carried across Southern and East Africa
              &mdash; a belief that our humanity is bound up in one another&rsquo;s.
              No dish here is meant to be eaten alone; every plate at Ubuntu
              Cafe &amp; Lounge is built for the center of the table, to be
              torn, shared, and passed hand to hand.
            </p>
            <p>
              That same spirit shapes the room itself: long communal tables
              beside intimate lounge corners, a bar built for lingering
              conversation, and a kitchen that treats every regional
              tradition &mdash; West African, East African, North African,
              Southern African &mdash; as part of one continuous table.
            </p>
          </div>

          <PatternDivider className="mt-10 max-w-xs" />
        </div>

        {/* Column 2 — hours & location, paired with image */}
        <div className="relative">
          <div className="rounded-2xl overflow-hidden shadow-md border border-emerald/10 dark:border-gold/10 group">
            <img
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80"
              alt="Communal dining table set with African-inspired dishes"
              className="w-full h-72 sm:h-96 object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          <div className="mt-10 grid sm:grid-cols-2 gap-10">
            <div>
              <h3 className="font-display text-xl text-emerald dark:text-gold mb-4">
                Hours of Gathering
              </h3>
              <ul className="space-y-3">
                {HOURS.map((h) => (
                  <li
                    key={h.day}
                    className="font-body text-sm text-charcoal/60 dark:text-ivory/70 flex flex-col"
                  >
                    <span className="text-charcoal/85 dark:text-ivory/90">{h.day}</span>
                    <span>{h.time}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-display text-xl text-emerald dark:text-gold mb-4">
                Find the Table
              </h3>
              <p className="font-body text-sm text-charcoal/60 dark:text-ivory/70 leading-relaxed">
                14 Adum Terrace
                <br />
                Kumasi, Ashanti Region
                <br />
                Ghana
              </p>
              <p className="font-body text-sm text-charcoal/60 dark:text-ivory/70 mt-4">
                +233 24 000 0000
                <br />
                hello@ubuntucafelounge.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
