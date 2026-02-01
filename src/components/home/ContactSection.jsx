import { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaWhatsapp, FaInstagram, FaFacebook } from 'react-icons/fa';
import Card from '../common/Card';
import { settingsAPI } from '../../services/api';


const ContactSection = () => {
  const [settings, setSettings] = useState({
    address: 'Imsouane, Morocco',
    phone: '+212 6 65 47 33 15',
    email: 'contact@shamshouse.com',
    checkOutTime: '12:00'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await settingsAPI.getSettings();
      setSettings(response.data.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="section bg-white">
        <div className="container-custom text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
        </div>
      </section>
    );
  }

  const contactItems = [
    {
      icon: FaMapMarkerAlt,
      title: 'Address',
      content: settings.address,
      color: 'red',
      link: null,
    },
    {
      icon: FaPhone,
      title: 'Phone',
      content: settings.phone,
      color: 'green',
      link: `tel:${settings.phone.replace(/\s/g, '')}`,
    },
    {
      icon: FaEnvelope,
      title: 'Email',
      content: settings.email,
      color: 'blue',
      link: `mailto:${settings.email}`,
    },
    {
      icon: FaClock,
      title: 'Hours',
      content: `Check-in: 24/7\nCheck-out: ${settings.checkOutTime}`,
      color: 'purple',
      link: null,
    },
  ];

  const colorClasses = {
    red: { bg: 'bg-red-50', icon: 'text-red-500', border: 'border-red-200', hover: 'hover:border-red-400' },
    green: { bg: 'bg-green-50', icon: 'text-green-500', border: 'border-green-200', hover: 'hover:border-green-400' },
    blue: { bg: 'bg-blue-50', icon: 'text-blue-500', border: 'border-blue-200', hover: 'hover:border-blue-400' },
    purple: { bg: 'bg-purple-50', icon: 'text-purple-500', border: 'border-purple-200', hover: 'hover:border-purple-400' },
  };

  return (
    <section className="section bg-gradient-to-b from-background to-white relative overflow-hidden">
      {/* ✅ Decorations - Cachées sur mobile */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 hidden md:block" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 hidden md:block" />

      <div className="container-custom relative z-10 px-4 sm:px-6">
        {/* ✅ Header - Responsive + Anglais */}
        <div className="text-center mb-12 md:mb-16">
          <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/10 text-primary rounded-full text-xs sm:text-sm font-semibold mb-3 sm:mb-4">
            Keep in Touch
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-dark mb-3 md:mb-4 px-4">
            Contact Us
          </h2>
          <p className="text-base sm:text-lg text-dark-light max-w-2xl mx-auto leading-relaxed px-4">
            Our team is available to answer all your questions
          </p>
        </div>

        {/* ✅ Contact Cards - Grid optimisé mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10 md:mb-12">
          {contactItems.map((item, index) => {
            const Icon = item.icon;
            const colors = colorClasses[item.color];
            const CardWrapper = item.link ? 'a' : 'div';
            
            return (
              <Card 
                key={index}
                className={`group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-2 ${colors.border} ${colors.hover}`}
              >
                <CardWrapper
                  {...(item.link ? { href: item.link } : {})}
                  className="block p-4 sm:p-6 text-center"
                >
                  {/* ✅ Icône - Plus petite sur mobile */}
                  <div className={`inline-flex p-3 sm:p-5 ${colors.bg} rounded-2xl shadow-lg border-2 ${colors.border} mb-3 sm:mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                    <Icon className={`text-3xl sm:text-4xl ${colors.icon}`} />
                  </div>
                  
                  <h3 className="font-bold text-dark mb-2 sm:mb-3 text-base sm:text-lg">
                    {item.title}
                  </h3>
                  
                  <p className={`text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                    item.link ? 'text-primary hover:underline font-medium' : 'text-dark-light'
                  }`}>
                    {item.content}
                  </p>
                </CardWrapper>
              </Card>
            );
          })}
        </div>

        {/* ✅ Social Media - Responsive + Anglais */}
        <div className="mb-10 md:mb-12">
          <Card className="p-5 sm:p-8 text-center border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
            <h3 className="text-lg sm:text-xl font-bold text-dark mb-3 sm:mb-4">Follow us on social media</h3>
            <div className="flex justify-center gap-3 sm:gap-4">
              <a
                href={`https://wa.me/${settings.phone.replace(/[\s+]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-green-500 hover:bg-green-600 text-white rounded-full transition-all duration-300 hover:scale-110 hover:shadow-xl"
                aria-label="WhatsApp"
              >
                <FaWhatsapp className="text-xl sm:text-2xl" />
              </a>
              <a
                href="https://www.instagram.com/shams_housesurf/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full transition-all duration-300 hover:scale-110 hover:shadow-xl"
                aria-label="Instagram"
              >
                <FaInstagram className="text-xl sm:text-2xl" />
              </a>
              {/* <a
                href="https://facebook.com/shamshouse"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-all duration-300 hover:scale-110 hover:shadow-xl"
                aria-label="Facebook"
              >
                <FaFacebook className="text-xl sm:text-2xl" />
              </a> */}
            </div>
          </Card>
        </div>

        {/* ✅ Map - Hauteur réduite sur mobile + Anglais */}
        <Card className="overflow-hidden border-2 border-primary/20 shadow-2xl">
          <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-4 sm:p-6">
            <h3 className="text-xl sm:text-2xl font-bold flex items-center gap-2 sm:gap-3">
              <FaMapMarkerAlt className="text-lg sm:text-xl" />
              Our Location
            </h3>
            <p className="text-white/80 mt-1 sm:mt-2 text-xs sm:text-base">
              Find us in Imsouane, the surfers' paradise in Morocco
            </p>
          </div>
          <div className="relative h-64 sm:h-80 md:h-96">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3447.891!2d-9.8176!3d30.8447!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzDCsDUwJzQwLjkiTiA5wrA0OScwMy40Ilc!5e0!3m2!1sen!2sma!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              title="Shams House Location"
              className="absolute inset-0"
            />
          </div>
        </Card>

        {/* ✅ CTA Bottom - Responsive + Anglais */}
        <div className="mt-10 md:mt-12 text-center">
          <Card className="inline-block p-5 sm:p-8 bg-gradient-warm text-white shadow-2xl mx-4">
            <p className="text-base sm:text-lg mb-2 opacity-90">
              Ready to book your stay?
            </p>
            <a 
              href={`tel:${settings.phone.replace(/\s/g, '')}`}
              className="text-2xl sm:text-3xl font-bold hover:underline break-all sm:break-normal"
            >
              {settings.phone}
            </a>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
