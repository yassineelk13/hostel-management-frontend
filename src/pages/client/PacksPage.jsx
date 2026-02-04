import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCheck, FaStar, FaArrowRight, FaFire } from 'react-icons/fa';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { packsAPI } from '../../services/api';
import { formatPrice } from '../../utils/priceFormatter';
import { bypassCloudinaryCache } from '../../utils/imageHelper'; // ✅ AJOUTE CETTE LIGNE


const PacksPage = () => {
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPacks();
  }, []);

  const fetchPacks = async () => {
    try {
      const response = await packsAPI.getAll();
      const activePacks = response.data.data.filter(pack => pack.isActive !== false);
      setPacks(activePacks);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ✅ Header - Responsive + Anglais */}
      <div className="relative bg-gradient-to-r from-primary via-primary-dark to-primary text-white py-16 sm:py-20 md:py-24 overflow-hidden">
        {/* ✅ Décorations - Ajustées pour mobile */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-5 sm:top-10 left-5 sm:left-10 w-20 sm:w-32 h-20 sm:h-32 border-2 sm:border-4 border-white rounded-full" />
          <div className="absolute bottom-5 sm:bottom-10 right-10 sm:right-20 w-24 sm:w-40 h-24 sm:h-40 border-2 sm:border-4 border-white rounded-full" />
          <div className="absolute top-1/2 right-1/3 w-16 sm:w-24 h-16 sm:h-24 border-2 sm:border-4 border-white rounded-full hidden sm:block" />
        </div>
        <div className="container-custom text-center relative z-10 px-4 sm:px-6">
          <span className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/20 backdrop-blur-sm rounded-full text-xs sm:text-sm font-semibold mb-3 sm:mb-4">
            <FaFire className="text-xs sm:text-sm" />
            Exclusive Offers
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold mb-3 sm:mb-4">Our Packages</h1>
          <p className="text-base sm:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
            All-inclusive packages for a unique experience in Imsouane
          </p>
        </div>
      </div>

      {/* ✅ Content - Padding ajusté */}
      <div className="container-custom py-8 sm:py-10 md:py-12 px-4 sm:px-6">
        {loading ? (
          <Loader />
        ) : packs.length === 0 ? (
          <Card className="p-8 sm:p-12 text-center">
            <p className="text-lg sm:text-xl text-dark-light">No packages available at the moment</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {packs.map((pack, index) => (
              <Card 
                key={pack.id} 
                className={`overflow-hidden group hover:shadow-2xl transition-all duration-500 border-2 ${
                  index === 1 
                    ? 'border-primary shadow-xl md:scale-105 md:shadow-2xl' 
                    : 'border-accent/30 hover:border-primary/50'
                }`}
              >
                {/* ✅ Badge populaire - Plus petit sur mobile */}
                {index === 1 && (
                  <div className="bg-gradient-to-r from-primary via-primary-dark to-primary text-white text-center py-2 sm:py-3 font-bold flex items-center justify-center gap-2 shadow-lg text-xs sm:text-sm">
                    <FaStar className="animate-pulse text-xs sm:text-sm" /> 
                    MOST POPULAR 
                    <FaStar className="animate-pulse text-xs sm:text-sm" />
                  </div>
                )}

                {/* ✅ Image - Hauteur réduite sur mobile */}
                <div className="relative h-52 sm:h-56 md:h-64 bg-gradient-warm overflow-hidden">
                  {pack.photos && pack.photos.length > 0 ? (
                    <>
                      <img 
      src={bypassCloudinaryCache(pack.photos[0])} // ✅ CHANGE ICI
      alt={pack.name}
      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
    />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FaStar className="text-5xl sm:text-6xl text-white/30" />
                    </div>
                  )}
                  
                  {/* ✅ Badge réduction - Compact sur mobile */}
                  {pack.originalPrice && (
                    <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-gradient-to-r from-red-500 to-red-600 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold shadow-xl animate-pulse">
                      -{Math.round((1 - pack.promoPrice / pack.originalPrice) * 100)}%
                    </div>
                  )}

                  {/* ✅ Badge durée - Compact sur mobile + Anglais */}
                  <div className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-white/90 backdrop-blur-sm text-dark px-2 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold shadow-lg">
                    {pack.durationDays} day{pack.durationDays > 1 ? 's' : ''}
                  </div>
                </div>

                {/* ✅ Content - Padding réduit */}
                <div className="p-4 sm:p-6">
                  <h3 className="text-xl sm:text-2xl font-display font-bold text-dark mb-2 sm:mb-3 group-hover:text-primary transition-colors">
                    {pack.name}
                  </h3>
                  
                  <p className="text-sm sm:text-base text-dark-light mb-4 sm:mb-6 leading-relaxed">
                    {pack.description}
                  </p>

                  {/* ✅ Services - Espacement réduit + Anglais */}
                  <div className="mb-4 sm:mb-6">
                    <div className="text-xs sm:text-sm font-semibold text-dark mb-2 sm:mb-3 flex items-center gap-2">
                      <div className="w-1 h-3 sm:h-4 bg-primary rounded-full" />
                      Included Services
                    </div>
                    <ul className="space-y-2">
                      {pack.includedServices && pack.includedServices.map((service) => (
                        <li key={service.id} className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm group/item">
                          <div className="flex-shrink-0 w-4 sm:w-5 h-4 sm:h-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 group-hover/item:bg-primary/20 transition-colors">
                            <FaCheck className="text-primary text-[10px] sm:text-xs" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-dark group-hover/item:text-primary transition-colors break-words">
                              {service.name}
                            </div>
                            {service.description && (
                              <div className="text-dark-light text-[10px] sm:text-xs mt-0.5 break-words">
                                {service.description}
                              </div>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* ✅ Prix - Compact sur mobile + Anglais */}
                  <div className="bg-gradient-to-r from-accent/20 to-accent/10 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 border border-accent/30">
                    {pack.originalPrice && (
                      <div className="flex items-center justify-between mb-1 sm:mb-2">
                        <span className="text-xs sm:text-sm text-dark-light">Regular Price</span>
                        <span className="text-sm sm:text-base text-dark-light line-through">
                          {formatPrice(pack.originalPrice)}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-semibold text-dark">Package Price</span>
                      <div className="text-2xl sm:text-3xl font-bold text-primary">
                        {formatPrice(pack.promoPrice)}
                      </div>
                    </div>

                    {pack.originalPrice && (
                      <div className="mt-2 text-right">
                        <span className="inline-block px-2 sm:px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] sm:text-xs font-semibold">
                          Save {formatPrice(pack.originalPrice - pack.promoPrice)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* ✅ Bouton - Taille texte ajustée + Anglais */}
                  <Link to={`/packs/${pack.id}`}>
                    <Button 
                      variant={index === 1 ? 'primary' : 'outline'} 
                      className="w-full group/btn shadow-lg hover:shadow-xl text-sm sm:text-base"
                    >
                      View Details
                      <FaArrowRight className="group-hover/btn:translate-x-2 transition-transform text-xs sm:text-sm" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PacksPage;
