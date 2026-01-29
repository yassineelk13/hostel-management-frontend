import { useState, useEffect } from 'react';
import { FaUtensils, FaSpa, FaWifi, FaParking, FaSwimmer, FaCoffee, FaCheckCircle } from 'react-icons/fa';
import Card from '../common/Card';
import Loader from '../common/Loader';
import { servicesAPI } from '../../services/api';
import { formatPrice } from '../../utils/priceFormatter';


const iconMap = {
  MEAL: FaUtensils,
  ACTIVITY: FaSwimmer,
  WELLNESS: FaSpa,
  FACILITY: FaWifi,
  TRANSPORT: FaParking,
  OTHER: FaCoffee,
};


const categoryColors = {
  MEAL: { bg: 'bg-orange-50', icon: 'text-orange-500', border: 'border-orange-200' },
  ACTIVITY: { bg: 'bg-blue-50', icon: 'text-blue-500', border: 'border-blue-200' },
  WELLNESS: { bg: 'bg-purple-50', icon: 'text-purple-500', border: 'border-purple-200' },
  FACILITY: { bg: 'bg-green-50', icon: 'text-green-500', border: 'border-green-200' },
  TRANSPORT: { bg: 'bg-gray-50', icon: 'text-gray-500', border: 'border-gray-200' },
  OTHER: { bg: 'bg-pink-50', icon: 'text-pink-500', border: 'border-pink-200' },
};


const ServicesSection = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await servicesAPI.getAll();
      setServices(response.data.data.slice(0, 6));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;
  if (services.length === 0) return null;

  return (
    <section className="section bg-gradient-to-b from-white via-accent/10 to-white relative overflow-hidden">
      {/* ✅ Decorations - Cachées sur mobile */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl hidden md:block" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl hidden md:block" />
      
      <div className="container-custom relative z-10 px-4 sm:px-6">
        {/* ✅ Header - Responsive + Anglais */}
        <div className="text-center mb-12 md:mb-16">
          <span className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/10 text-primary rounded-full text-xs sm:text-sm font-semibold mb-3 sm:mb-4">
            <FaCheckCircle className="text-xs sm:text-sm" />
            Premium Services
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-dark mb-3 md:mb-4 px-4">
            Our Services
          </h2>
          <p className="text-base sm:text-lg text-dark-light max-w-2xl mx-auto leading-relaxed px-4">
            Everything to make your stay unforgettable in Imsouane
          </p>
        </div>

        {/* ✅ Grid - Gap réduit sur mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {services.map((service) => {
            const Icon = iconMap[service.category] || FaCoffee;
            const colors = categoryColors[service.category] || categoryColors.OTHER;
            
            return (
              <Card 
                key={service.id} 
                className={`group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-2 ${colors.border} overflow-hidden`}
              >
                {/* ✅ Header coloré - Padding réduit sur mobile */}
                <div className={`${colors.bg} p-4 sm:p-6 text-center relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent" />
                  <div className={`inline-flex p-3 sm:p-5 ${colors.bg} rounded-2xl shadow-lg border-2 ${colors.border} relative z-10 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`text-4xl sm:text-5xl ${colors.icon}`} />
                  </div>
                </div>

                {/* ✅ Contenu - Padding réduit */}
                <div className="p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-dark mb-2 sm:mb-3 group-hover:text-primary transition-colors">
                    {service.name}
                  </h3>
                  
                  <p className="text-dark-light text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed line-clamp-3">
                    {service.description}
                  </p>

                  {/* ✅ Prix - Compact sur mobile */}
                  <div className={`flex items-center justify-between p-3 sm:p-4 ${colors.bg} rounded-xl border ${colors.border}`}>
                    <span className="text-xs sm:text-sm text-dark-light font-medium">Price</span>
                    <div className="text-right">
                      <div className="text-xl sm:text-2xl font-bold text-primary">
                        {formatPrice(service.price)}
                      </div>
                      {service.priceType === 'PER_NIGHT' && (
                        <span className="text-[10px] sm:text-xs text-dark-light">/night</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Hover effect indicator */}
                <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              </Card>
            );
          })}
        </div>

        {/* ✅ CTA Section - Responsive + Anglais */}
        <div className="mt-12 md:mt-16 text-center">
          <Card className="inline-block p-5 sm:p-8 bg-gradient-to-r from-primary/5 to-accent/5 border-2 border-primary/20 mx-4">
            <p className="text-dark-light mb-2 text-sm sm:text-base">
              Want to know more about our services?
            </p>
            <p className="text-lg sm:text-2xl font-bold text-dark">
              Contact us at{' '}
              <a href="tel:+212665473315" className="text-primary hover:underline break-all sm:break-normal">
                +212 6 65 47 33 15
              </a>
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
