import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCheck, FaArrowRight, FaStar, FaFire } from 'react-icons/fa';
import Card from '../common/Card';
import Button from '../common/Button';
import Loader from '../common/Loader';
import { packsAPI } from '../../services/api';
import { formatPrice } from '../../utils/priceFormatter';



const FeaturedPacks = () => {
  const [packs, setPacks] = useState([]);
  const [totalPacks, setTotalPacks] = useState(0);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    fetchPacks();
  }, []);


  const fetchPacks = async () => {
    try {
      const response = await packsAPI.getAll();
      const activePacks = response.data.data.filter(pack => pack.isActive !== false);
      setTotalPacks(activePacks.length);
      setPacks(activePacks.slice(0, 3));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };


  if (loading) return <Loader />;
  if (packs.length === 0) return null;


  return (
    <section className="section bg-gradient-to-b from-white via-accent/5 to-white relative overflow-hidden">
      {/* ✅ Decorations - Hidden on mobile */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl hidden md:block" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl hidden md:block" />


      <div className="container-custom relative z-10 px-4 sm:px-6">
        {/* ✅ Header - Responsive titles */}
        <div className="text-center mb-12 md:mb-16">
          <span className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-primary/10 to-accent/10 text-primary rounded-full text-xs sm:text-sm font-semibold mb-3 sm:mb-4">
            <FaFire className="text-sm" />
            Special Offers
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-dark mb-3 md:mb-4 px-4">
            Our Special Packs
          </h2>
          <p className="text-base sm:text-lg text-dark-light max-w-2xl mx-auto leading-relaxed px-4">
            Complete packages for an unforgettable experience in Imsouane
          </p>
        </div>


        {/* ✅ Grid - Adjusted gap and scale */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {packs.map((pack, index) => (
            <Card 
              key={pack.id} 
              className={`overflow-hidden group hover:shadow-2xl transition-all duration-500 border-2 ${
                index === 1 
                  ? 'border-primary shadow-xl md:scale-105 md:shadow-2xl' 
                  : 'border-accent/30 hover:border-primary/50'
              }`}
            >
              {/* ✅ Popular badge - Smaller on mobile */}
              {index === 1 && (
                <div className="bg-gradient-to-r from-primary via-primary-dark to-primary text-white text-center py-2 sm:py-3 font-bold flex items-center justify-center gap-2 shadow-lg text-xs sm:text-sm">
                  <FaStar className="animate-pulse text-xs sm:text-sm" /> 
                  MOST POPULAR 
                  <FaStar className="animate-pulse text-xs sm:text-sm" />
                </div>
              )}


              {/* ✅ Image - Reduced height on mobile */}
              <div className="relative h-48 sm:h-56 bg-gradient-warm overflow-hidden">
                {pack.photos && pack.photos.length > 0 ? (
                  <>
                    <img 
                      src={pack.photos[0]} 
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

                {/* ✅ Discount badge - More compact on mobile */}
                {pack.originalPrice && (
                  <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-gradient-to-r from-red-500 to-red-600 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold shadow-xl animate-pulse">
                    -{Math.round((1 - pack.promoPrice / pack.originalPrice) * 100)}%
                  </div>
                )}


                {/* ✅ Duration badge - More compact on mobile */}
                <div className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-white/90 backdrop-blur-sm text-dark px-2 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold shadow-lg">
                  {pack.durationDays} day{pack.durationDays > 1 ? 's' : ''}
                </div>
              </div>


              {/* ✅ Content - Reduced padding on mobile */}
              <div className="p-4 sm:p-6">
                {/* ✅ Title - Smaller on mobile */}
                <h3 className="text-xl sm:text-2xl font-display font-bold text-dark mb-2 sm:mb-3 group-hover:text-primary transition-colors">
                  {pack.name}
                </h3>

                <p className="text-sm sm:text-base text-dark-light mb-4 sm:mb-5 line-clamp-2 leading-relaxed">
                  {pack.description}
                </p>


                {/* ✅ Included services - Reduced spacing */}
                <div className="mb-4 sm:mb-5">
                  <div className="text-xs sm:text-sm font-semibold text-dark mb-2 sm:mb-3 flex items-center gap-2">
                    <div className="w-1 h-3 sm:h-4 bg-primary rounded-full" />
                    Included services
                  </div>
                  <ul className="space-y-2">
                    {pack.includedServices && pack.includedServices.slice(0, 4).map((service) => (
                      <li key={service.id} className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm group/item">
                        <div className="flex-shrink-0 w-4 sm:w-5 h-4 sm:h-5 rounded-full bg-primary/10 flex items-center justify-center group-hover/item:bg-primary/20 transition-colors">
                          <FaCheck className="text-primary text-[10px] sm:text-xs" />
                        </div>
                        <span className="text-dark-light group-hover/item:text-dark transition-colors">
                          {service.name}
                        </span>
                      </li>
                    ))}
                    {pack.includedServices && pack.includedServices.length > 4 && (
                      <li className="text-xs sm:text-sm text-primary font-medium pl-6 sm:pl-8">
                        + {pack.includedServices.length - 4} additional service(s)
                      </li>
                    )}
                  </ul>
                </div>


                {/* ✅ Price - Adjusted for mobile */}
                <div className="bg-gradient-to-r from-accent/20 to-accent/10 rounded-xl p-3 sm:p-4 mb-4 sm:mb-5 border border-accent/30">
                  {pack.originalPrice && (
                    <div className="flex items-center justify-between mb-1 sm:mb-2">
                      <span className="text-xs sm:text-sm text-dark-light">Regular price</span>
                      <span className="text-sm sm:text-base text-dark-light line-through">
                        {formatPrice(pack.originalPrice)}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-semibold text-dark">Pack price</span>
                    <div className="text-right">
                      <div className="text-2xl sm:text-3xl font-bold text-primary">
                        {formatPrice(pack.promoPrice)}
                      </div>
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


                {/* ✅ Button - Adjusted text size */}
                <Link to={`/packs/${pack.id}`}>
                  <Button 
                    variant={index === 1 ? 'primary' : 'outline'} 
                    className="w-full group/btn shadow-lg hover:shadow-xl text-sm sm:text-base"
                  >
                    View details
                    <FaArrowRight className="group-hover/btn:translate-x-2 transition-transform text-xs sm:text-sm" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>


        {/* ✅ "All packs" button - Responsive */}
        {totalPacks > 3 && (
          <div className="text-center mt-12 md:mt-16">
            <Link to="/packs">
              <Button variant="outline" size="lg" className="group shadow-lg hover:shadow-xl text-sm sm:text-base">
                Discover all our packs ({totalPacks})
                <FaArrowRight className="group-hover:translate-x-2 transition-transform" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};


export default FeaturedPacks;