import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSun, FaWater, FaHeart, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Button from '../common/Button';


const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: 'https://images.unsplash.com/photo-1502933691298-84fc14542831?q=80&w=2070',
      title: 'Surf Paradise',
      subtitle: 'Les plus longues vagues d\'Afrique',
    },
    {
      image: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?q=80&w=2126',
      title: 'Plage de Rêve',
      subtitle: 'Face à l\'océan Atlantique',
    },
    {
      image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=2070',
      title: 'Yoga & Détente',
      subtitle: 'Reconnectez avec vous-même',
    },
    {
      image: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?q=80&w=2070',
      title: 'Village Authentique',
      subtitle: 'L\'esprit marocain traditionnel',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative h-screen overflow-hidden">
      {/* ✅ SLIDESHOW BACKGROUND */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40 md:from-black/70 md:via-black/50 md:to-transparent z-10" />
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
          />
        </div>
      ))}

      {/* ✅ CONTENU - Padding augmenté pour éviter les flèches */}
      <div className="container-custom h-full relative z-20 flex items-center px-16 sm:px-6 md:px-8">
        <div className="max-w-3xl text-white animate-fade-in-up w-full">
          <div className="flex items-center gap-2 mb-3 md:mb-4">
            <FaHeart className="text-accent text-sm md:text-base" />
            <span className="text-accent font-medium text-sm md:text-base">Bienvenue à Imsouane</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-display font-bold mb-4 md:mb-6 leading-tight">
            Votre Refuge<br />
            <span className="text-accent">Entre Yoga & Surf</span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl mb-6 md:mb-8 text-white/90 leading-relaxed max-w-2xl">
            Découvrez Shams House, un hostel unique face à l'océan Atlantique.
            Profitez de nos chambres confortables, sessions de yoga au lever du soleil
            et des meilleures vagues du Maroc.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Link to="/booking" className="w-full sm:w-auto">
              <Button size="lg" className="shadow-xl hover:shadow-2xl w-full sm:w-auto">
                Réserver maintenant
              </Button>
            </Link>
            <Link to="/rooms" className="w-full sm:w-auto">
              <Button 
                variant="outline" 
                size="lg" 
                className="bg-white/10 backdrop-blur-sm border-white hover:bg-white hover:text-primary shadow-xl w-full sm:w-auto"
              >
                Découvrir nos chambres
              </Button>
            </Link>
          </div>

          <div className="mt-8 md:mt-12 hidden sm:flex items-center gap-4">
            <div className="text-xs md:text-sm font-medium opacity-90">
              {slides[currentSlide].title} — {slides[currentSlide].subtitle}
            </div>
          </div>
        </div>
      </div>

      {/* ✅ NAVIGATION ARROWS - Plus petites et translucides sur mobile */}
      <button
        onClick={prevSlide}
        className="absolute left-1 sm:left-4 top-1/2 -translate-y-1/2 z-30 bg-white/10 hover:bg-white/30 backdrop-blur-sm p-2 sm:p-4 rounded-full text-white transition-all touch-manipulation"
        aria-label="Previous slide"
      >
        <FaChevronLeft className="text-sm sm:text-xl" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-1 sm:right-4 top-1/2 -translate-y-1/2 z-30 bg-white/10 hover:bg-white/30 backdrop-blur-sm p-2 sm:p-4 rounded-full text-white transition-all touch-manipulation"
        aria-label="Next slide"
      >
        <FaChevronRight className="text-sm sm:text-xl" />
      </button>

      {/* ✅ DOTS NAVIGATION */}
      <div className="absolute bottom-20 sm:bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2 sm:gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-3 sm:h-3 rounded-full transition-all touch-manipulation ${
              index === currentSlide
                ? 'bg-white w-8 sm:w-10'
                : 'bg-white/50 hover:bg-white/75 w-3 sm:w-3'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* ✅ SCROLL INDICATOR */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce hidden md:block">
        <div className="flex flex-col items-center gap-2 text-white/70">
          <span className="text-xs uppercase tracking-wider">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-white/70 to-transparent" />
        </div>
      </div>

      {/* ✅ WAVE DIVIDER */}
      <div className="absolute bottom-0 left-0 w-full z-20">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          <path 
            d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" 
            fill="#FAF8F4"
          />
        </svg>
      </div>
    </div>
  );
};

export default Hero;
