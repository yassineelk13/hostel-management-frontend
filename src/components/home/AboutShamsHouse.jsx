// components/home/AboutShamsHouse.jsx
import { Sun } from 'lucide-react'; // ou ton icône préférée

const AboutShamsHouse = () => {
  return (
    <section className="py-16 px-4 bg-gradient-to-b from-orange-50 to-white">
      <div className="max-w-4xl mx-auto text-center">
        {/* Icône Soleil */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-orange-400 rounded-full flex items-center justify-center shadow-lg">
            <Sun className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Titre principal */}
        <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          Shams House
        </h2>
        <p className="text-xl md:text-2xl text-orange-600 font-semibold mb-8 italic">
          Where Hope Is Born
        </p>

        {/* Histoire */}
        <div className="space-y-6 text-gray-700 text-lg leading-relaxed">
          <p>
            Shams House is more than just a hostel; it is a story of hope and warmth.
            The name was chosen after Shams, my daughter, who was born during one of the most 
            difficult periods of my life. In the midst of those challenging circumstances, her 
            birth came like a light that restored meaning to life. Shams, which means sun, became 
            a symbol of hope, new beginnings, and the strength to move forward.
          </p>

          <p>
            For this reason, the place was named Shams House — a home that welcomes travelers 
            from all over the world and offers them comfort, peace, and warmth, just like the 
            sun does every morning.
          </p>

          <p>
            Located in a calm and natural setting, the hostel is perfect for lovers of the ocean, 
            yoga, and those seeking inner peace. At Shams House, we believe that a place is not 
            only walls, but also energy, stories, and genuine human connection.
          </p>

          {/* Message de bienvenue */}
          <div className="mt-8 pt-6 border-t border-orange-200">
            <p className="text-2xl font-semibold text-orange-700 flex items-center justify-center gap-2">
              🌿 Welcome to Shams House — where comfort meets hope.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutShamsHouse;
