'use client';

// Pure frontend UI shell. No submission logic yet — this is intentionally
// left for the AWS serverless backend (e.g. API Gateway + Lambda) to be
// wired in later via a form action or fetch call in handleSubmit.
export default function Reservations() {
  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: connect to AWS backend (API Gateway + Lambda, or Amplify Data).
  };

  return (
    <section id="reservations" className="relative bg-ivory dark:bg-charcoal py-28 lg:py-36">
      <div className="mx-auto max-w-3xl px-6 lg:px-10">
        <div className="text-center mb-14">
          <span className="eyebrow">Reserve a Table</span>
          <h2 className="font-display text-4xl sm:text-5xl text-charcoal dark:text-ivory mt-4">
            Save Your Seat at the Table
          </h2>
          <p className="mt-5 font-body text-charcoal/65 dark:text-ivory/65 leading-relaxed max-w-md mx-auto">
            Tell us who&rsquo;s joining and when &mdash; we&rsquo;ll hold your
            place at the table.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-emerald/15 dark:border-gold/15 bg-white/70 dark:bg-charcoal-light/60 backdrop-blur-sm p-8 sm:p-12 grid sm:grid-cols-2 gap-6"
        >
          <div className="sm:col-span-2">
            <label
              htmlFor="name"
              className="font-body text-xs uppercase tracking-wide text-charcoal/50 dark:text-ivory/50"
            >
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="e.g. Ama Owusu"
              className="mt-2 w-full bg-transparent border-b border-charcoal/20 dark:border-ivory/20 focus:border-emerald dark:focus:border-gold outline-none py-3 font-body text-charcoal dark:text-ivory placeholder:text-charcoal/30 dark:placeholder:text-ivory/30 transition-colors duration-300"
            />
          </div>

          <div>
            <label
              htmlFor="guests"
              className="font-body text-xs uppercase tracking-wide text-charcoal/50 dark:text-ivory/50"
            >
              Guests
            </label>
            <select
              id="guests"
              name="guests"
              defaultValue="2"
              className="mt-2 w-full bg-transparent border-b border-charcoal/20 dark:border-ivory/20 focus:border-emerald dark:focus:border-gold outline-none py-3 font-body text-charcoal dark:text-ivory transition-colors duration-300"
            >
              {[1, 2, 3, 4, 5, 6, '7+'].map((n) => (
                <option key={n} value={n} className="bg-ivory dark:bg-charcoal text-charcoal dark:text-ivory">
                  {n} {n === 1 ? 'Guest' : 'Guests'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="date"
              className="font-body text-xs uppercase tracking-wide text-charcoal/50 dark:text-ivory/50"
            >
              Date
            </label>
            <input
              id="date"
              name="date"
              type="date"
              className="mt-2 w-full bg-transparent border-b border-charcoal/20 dark:border-ivory/20 focus:border-emerald dark:focus:border-gold outline-none py-3 font-body text-charcoal dark:text-ivory transition-colors duration-300"
            />
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="time"
              className="font-body text-xs uppercase tracking-wide text-charcoal/50 dark:text-ivory/50"
            >
              Time
            </label>
            <input
              id="time"
              name="time"
              type="time"
              className="mt-2 w-full bg-transparent border-b border-charcoal/20 dark:border-ivory/20 focus:border-emerald dark:focus:border-gold outline-none py-3 font-body text-charcoal dark:text-ivory transition-colors duration-300"
            />
          </div>

          <button
            type="submit"
            className="sm:col-span-2 mt-4 bg-gold hover:bg-gold-light text-charcoal font-body font-semibold tracking-wide py-4 rounded-full transition-colors duration-300"
          >
            Request Reservation
          </button>
        </form>
      </div>
    </section>
  );
}
