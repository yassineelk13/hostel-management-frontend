import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaWhatsapp, FaEnvelope, FaPhone, FaMapMarkerAlt, FaUserShield, FaClock, FaHeart, FaArrowUp } from 'react-icons/fa';
import logo from '../../assets/logo.png';
import { settingsAPI } from '../../services/api';


const Footer = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    address: 'Imsouane, Morocco',
    phone: '+212 6 65 47 33 15',
    email: 'contact@shamshouse.com',
    checkOutTime: '12:00',
    hostelName: 'ShamsHouse'
  });
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    fetchSettings();
    
    // Détection scroll pour bouton "Retour en haut"
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await settingsAPI.getSettings();
      setSettings(response.data.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleSectionClick = (e, sectionId) => {
    e.preventDefault();
    navigate('/');
    setTimeout(() => {
      if (sectionId === 'hero') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const element = document.getElementById(sectionId);
        if (element) {
          const navbarHeight = 80;
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = elementPosition - navbarHeight;
          window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
      }
    }, 100);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ✅ Navigation links en anglais
  const navigationLinks = [
    { name: 'Home', anchor: 'hero' },
    { name: 'Packages', anchor: 'packs' },
    { name: 'Rooms', anchor: 'chambres' },
    { name: 'Services', anchor: 'services' },
    { name: 'Contact', anchor: 'contact' },
  ];

  const socialLinks = [
    { 
      icon: FaFacebook, 
      url: 'https://facebook.com/shamshouse',
      color: 'hover:bg-blue-600',
      label: 'Facebook'
    },
    { 
      icon: FaInstagram, 
      url: 'https://instagram.com/shamshouse',
      color: 'hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-600',
      label: 'Instagram'
    },
    { 
      icon: FaWhatsapp, 
      url: `https://wa.me/${settings.phone.replace(/[\s+]/g, '')}`,
      color: 'hover:bg-green-600',
      label: 'WhatsApp'
    },
  ];

  return (
    <>
      <footer className="relative bg-gradient-to-b from-dark via-dark to-black text-white overflow-hidden">
        {/* ✅ Decorative elements - Cachés sur mobile */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 hidden md:block" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 hidden md:block" />

        {/* ✅ Container avec padding responsive */}
        <div className="container-custom relative z-10 px-4 sm:px-6">
          {/* ✅ Main footer content - Grid responsive */}
          <div className="py-10 sm:py-12 md:py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 md:gap-12">
            
            {/* ✅ Logo & Description */}
            <div className="space-y-4 sm:space-y-6">
              <div className="group">
                <img 
                  src={logo} 
                  alt={settings.hostelName || 'Shams House'} 
                  className="h-16 sm:h-20 w-auto object-contain transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <p className="text-gray-400 text-sm leading-relaxed break-words">
                Your oasis of tranquility in Imsouane. Discover surfing, relaxation and authentic Moroccan hospitality.
              </p>
              <div className="flex items-center gap-2 text-primary">
                <FaHeart className="animate-pulse flex-shrink-0" />
                <span className="text-sm font-semibold">Welcome Home</span>
              </div>
            </div>

            {/* ✅ Navigation rapide - Anglais */}
            <div>
              <h4 className="font-bold text-base sm:text-lg mb-4 sm:mb-6 relative inline-block">
                Navigation
                <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-primary rounded-full" />
              </h4>
              <ul className="space-y-2 sm:space-y-3">
                {navigationLinks.map((link) => (
                  <li key={link.anchor}>
                    <a 
                      href={`/#${link.anchor}`} 
                      onClick={(e) => handleSectionClick(e, link.anchor)} 
                      className="group flex items-center gap-2 text-gray-300 hover:text-primary transition-all duration-300 text-sm sm:text-base"
                    >
                      <span className="w-0 h-px bg-primary transition-all duration-300 group-hover:w-4" />
                      <span className="transform transition-transform duration-300 group-hover:translate-x-1 break-words">
                        {link.name}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* ✅ Contact Info - Responsive + Anglais */}
            <div>
              <h4 className="font-bold text-base sm:text-lg mb-4 sm:mb-6 relative inline-block">
                Contact
                <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-primary rounded-full" />
              </h4>
              <ul className="space-y-3 sm:space-y-4">
                <li>
                  <a 
                    href="#" 
                    className="group flex items-start gap-2 sm:gap-3 text-gray-300 hover:text-primary transition-colors duration-300"
                  >
                    <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <FaMapMarkerAlt className="text-primary text-xs sm:text-sm" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-gray-500 mb-1">Address</div>
                      <span className="text-xs sm:text-sm break-words">{settings.address}</span>
                    </div>
                  </a>
                </li>
                <li>
                  <a 
                    href={`tel:${settings.phone.replace(/\s/g, '')}`}
                    className="group flex items-start gap-2 sm:gap-3 text-gray-300 hover:text-primary transition-colors duration-300"
                  >
                    <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <FaPhone className="text-primary text-xs sm:text-sm" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-gray-500 mb-1">Phone</div>
                      <span className="text-xs sm:text-sm break-words">{settings.phone}</span>
                    </div>
                  </a>
                </li>
                <li>
                  <a 
                    href={`mailto:${settings.email}`}
                    className="group flex items-start gap-2 sm:gap-3 text-gray-300 hover:text-primary transition-colors duration-300"
                  >
                    <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <FaEnvelope className="text-primary text-xs sm:text-sm" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-gray-500 mb-1">Email</div>
                      <span className="text-xs sm:text-sm break-all">{settings.email}</span>
                    </div>
                  </a>
                </li>
              </ul>
            </div>

            {/* ✅ Réseaux sociaux & Horaires - Responsive + Anglais */}
            <div>
              <h4 className="font-bold text-base sm:text-lg mb-4 sm:mb-6 relative inline-block">
                Follow Us
                <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-primary rounded-full" />
              </h4>
              
              {/* ✅ Social icons - Tailles ajustées */}
              <div className="flex gap-2 sm:gap-3 mb-6 sm:mb-8">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.label}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`group relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/5 backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg ${social.color}`}
                      title={social.label}
                      aria-label={social.label}
                    >
                      <Icon className="text-base sm:text-xl text-gray-300 group-hover:text-white transition-colors" />
                    </a>
                  );
                })}
              </div>

              {/* ✅ Horaires - Responsive + Anglais */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <FaClock className="text-primary text-xs sm:text-sm flex-shrink-0" />
                  <h5 className="font-semibold text-sm sm:text-base">Hours</h5>
                </div>
                <div className="space-y-2 text-xs sm:text-sm text-gray-300">
                  <div className="flex justify-between gap-2">
                    <span>Check-in</span>
                    <span className="font-semibold text-primary whitespace-nowrap">24/7</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span>Check-out</span>
                    <span className="font-semibold text-primary whitespace-nowrap">{settings.checkOutTime}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ✅ Footer Bottom - Responsive + Anglais */}
          <div className="border-t border-white/10 py-4 sm:py-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4">
              <p className="text-gray-400 text-xs sm:text-sm flex flex-wrap items-center justify-center md:justify-start gap-1 sm:gap-2 text-center md:text-left">
                <span>&copy; {new Date().getFullYear()} {settings.hostelName || 'Shams House'}.</span>
                <span>All rights reserved.</span>
                <span className="hidden md:inline">•</span>
                <span className="hidden md:inline text-gray-500">Made with</span>
                <FaHeart className="hidden md:inline text-red-500 text-xs animate-pulse" />
                <span className="hidden md:inline text-gray-500">in Imsouane</span>
              </p>
              
              <Link 
                to="/admin/login" 
                className="group flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all duration-300 border border-white/10 hover:border-primary/50 flex-shrink-0"
                title="Admin Access"
              >
                <FaUserShield className="text-primary group-hover:scale-110 transition-transform text-xs sm:text-sm" />
                <span className="text-xs sm:text-sm text-gray-400 group-hover:text-white whitespace-nowrap">Admin</span>
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* ✅ Scroll to top button - Responsive + Anglais */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-40 w-10 h-10 sm:w-12 sm:h-12 bg-primary hover:bg-primary-dark text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 ${
          showScrollTop 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-16 pointer-events-none'
        }`}
        aria-label="Back to top"
      >
        <FaArrowUp className="text-sm sm:text-lg" />
      </button>
    </>
  );
};

export default Footer;
