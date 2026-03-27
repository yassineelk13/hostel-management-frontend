const SCHEDULE = [
  { time: '08:00', icon: '🧘', label: 'Sunrise Yoga Session' },
  { time: '09:00', icon: '🍳', label: 'Hearty Breakfast' },
  { time: '10:00', icon: '🏄', label: 'Morning Surf Lesson' },
  { time: '13:00', icon: '🍽️', label: 'Lunch at the port, typical of Imsouane' },
  { time: '14:30', icon: '🌊', label: 'Free Surf or Relax' },
  { time: '18:00', icon: '🌅', label: 'Sunset Chill' },
  { time: '20:00', icon: '🎥', label: 'Group Dinner & Video Analysis' },
  { time: '21:30', icon: '✨', label: 'Free Evening / Stargazing' },
];

const DayAtShamsHouse = () => {
  return (
    <section className="py-20 md:py-28 bg-[#f5f0eb]">
      <div className="max-w-2xl mx-auto px-4 sm:px-8">

        {/* Header */}
        <h2 className="text-3xl md:text-4xl font-display font-bold text-dark text-center mb-12 md:mb-16">
          A Day at Shams House
        </h2>

        {/* Timeline */}
        <div className="relative">

          {/* Vertical line */}
          <div className="absolute left-[68px] top-3 bottom-3 w-px bg-dark/10" />

          <div className="space-y-0">
            {SCHEDULE.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-6 group py-3"
                style={{
                  animation: 'fadeInLeft 0.4s ease-out both',
                  animationDelay: `${index * 80}ms`
                }}
              >
                {/* Time */}
                <div className="w-14 flex-shrink-0 text-right">
                  <span className="text-sm font-bold text-primary tabular-nums">
                    {item.time}
                  </span>
                </div>

                {/* Dot */}
                <div className="relative z-10 flex-shrink-0">
                  <div className="w-3.5 h-3.5 rounded-full bg-primary group-hover:scale-125 transition-transform duration-200 shadow-sm" />
                </div>

                {/* Icon + Label */}
                <div className="flex items-center gap-3 flex-1 py-1">
                  <span className="text-xl leading-none flex-shrink-0">{item.icon}</span>
                  <span className="text-sm md:text-base text-dark/80 group-hover:text-dark transition-colors">
                    {item.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-dark/40 italic mt-10">
          * This is a typical day. Activities can be adjusted based on the week's vibe and your requests!
        </p>
      </div>

      <style jsx>{`
        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-16px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </section>
  );
};

export default DayAtShamsHouse;