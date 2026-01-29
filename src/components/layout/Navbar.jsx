import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaCalendarCheck } from 'react-icons/fa';
import logo from '../../assets/logo.png';


const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ Navigation links en anglais
  const navLinks = [
    { name: 'Home', path: '/', anchor: 'hero', type: 'anchor' },
    { name: 'Packages', path: '/#packs', anchor: 'packs', type: 'anchor' },
    { name: 'Rooms', path: '/#chambres', anchor: 'chambres', type: 'anchor' },
    { name: 'Services', path: '/#services', anchor: 'services', type: 'anchor' },
    { name: 'Contact', path: '/#contact', anchor: 'contact', type: 'anchor' },
  ];

  // Détection du scroll pour effet glassmorphism
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      
      // Détection section active
      const sections = ['hero', 'packs', 'chambres', 'services', 'contact'];
      const scrollPosition = window.scrollY + 100;

      if (window.scrollY < 100) {
        setActiveSection('hero');
        return;
      }

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (location.hash) {
      const sectionId = location.hash.replace('#', '');
      setTimeout(() => scrollToSection(sectionId), 100);
    }
  }, [location]);

  const handleNavClick = (e, link) => {
    if (link.type === 'anchor') {
      e.preventDefault();
      
      if (location.pathname === '/') {
        scrollToSection(link.anchor);
      } else {
        navigate('/');
        setTimeout(() => scrollToSection(link.anchor), 100);
      }
      
      setIsOpen(false);
    }
  };

  const scrollToSection = (sectionId) => {
    if (sectionId === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const element = document.getElementById(sectionId);
    if (element) {
      const navbarHeight = 80;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - navbarHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const isActive = (link) => {
    if (location.pathname !== '/') return false;
    return activeSection === link.anchor;
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg' 
        : 'bg-white shadow-md'
    }`}>
      {/* ✅ Container avec padding responsive */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6">
        {/* ✅ Hauteur navbar adaptative */}
        <div className="flex justify-between items-center h-16 sm:h-18 md:h-20">
          {/* ✅ Logo avec taille responsive */}
          <Link 
            to="/" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
            className="flex items-center group flex-shrink-0"
          >
            <div className="relative">
              <img 
                src={logo} 
                alt="Shams House" 
                className="h-12 sm:h-14 md:h-16 w-auto object-contain transition-transform duration-300 group-hover:scale-110"
              />
              {scrolled && (
                <div className="absolute inset-0 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors" />
              )}
            </div>
          </Link>

          {/* ✅ Desktop Menu - Espacement réduit */}
          <div className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={(e) => handleNavClick(e, link)}
                className={`relative px-3 xl:px-4 py-2 font-semibold transition-all duration-300 rounded-lg group text-sm xl:text-base whitespace-nowrap ${
                  isActive(link)
                    ? 'text-primary'
                    : 'text-dark hover:text-primary'
                }`}
              >
                {link.name}
                
                {/* Hover background effect */}
                <span className={`absolute inset-0 bg-primary/5 rounded-lg transform scale-0 group-hover:scale-100 transition-transform duration-300 -z-10 ${
                  isActive(link) ? 'scale-100' : ''
                }`} />
                
                {/* Active indicator - line bottom */}
                {isActive(link) && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full animate-pulse" />
                )}
              </Link>
            ))}
            
            {/* ✅ CTA Button - Responsive + Anglais */}
            <Link
              to="/booking"
              className="ml-2 xl:ml-4 group relative overflow-hidden flex-shrink-0"
            >
              <div className="relative px-4 xl:px-6 py-2 xl:py-3 bg-gradient-to-r from-primary to-primary-dark text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 text-sm xl:text-base whitespace-nowrap">
                <FaCalendarCheck className="group-hover:rotate-12 transition-transform text-xs xl:text-sm" />
                <span>Book Now</span>
                
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </div>
            </Link>
          </div>

          {/* ✅ Mobile Menu Button - Taille ajustée */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-dark focus:outline-none group flex-shrink-0"
            aria-label="Toggle menu"
          >
            <div className="absolute inset-0 bg-primary/5 rounded-lg scale-0 group-hover:scale-100 transition-transform" />
            <div className="relative">
              {isOpen ? (
                <FaTimes className="text-xl sm:text-2xl transition-transform duration-300 rotate-90" />
              ) : (
                <FaBars className="text-xl sm:text-2xl transition-transform duration-300" />
              )}
            </div>
          </button>
        </div>

        {/* ✅ Mobile Menu - Design premium + Anglais */}
        <div className={`lg:hidden overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-[32rem] opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="py-3 sm:py-4 space-y-1">
            {navLinks.map((link, index) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={(e) => handleNavClick(e, link)}
                className={`block py-2.5 sm:py-3 px-3 sm:px-4 font-semibold rounded-lg transition-all duration-300 transform text-sm sm:text-base ${
                  isActive(link)
                    ? 'text-primary bg-primary/10 translate-x-2'
                    : 'text-dark hover:bg-accent/20 hover:translate-x-1'
                }`}
                style={{ 
                  transitionDelay: isOpen ? `${index * 50}ms` : '0ms',
                  opacity: isOpen ? 1 : 0,
                  transform: isOpen ? 'translateX(0)' : 'translateX(-10px)'
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="break-words">{link.name}</span>
                  {isActive(link) && (
                    <span className="w-2 h-2 bg-primary rounded-full animate-pulse flex-shrink-0 ml-2" />
                  )}
                </div>
              </Link>
            ))}
            
            {/* ✅ CTA Button Mobile - Responsive + Anglais */}
            <div className="px-3 sm:px-4 pt-3 sm:pt-4">
              <Link
                to="/booking"
                onClick={() => setIsOpen(false)}
                className="block w-full py-3 sm:py-4 px-3 sm:px-4 bg-gradient-to-r from-primary to-primary-dark text-white font-bold rounded-xl text-center transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base"
              >
                <div className="flex items-center justify-center gap-2">
                  <FaCalendarCheck className="flex-shrink-0" />
                  <span className="whitespace-nowrap">Book Now</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
