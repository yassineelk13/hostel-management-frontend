import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaCheck, FaCalendar, FaArrowLeft, FaBed, FaStar, FaChevronLeft, FaChevronRight, FaGift, FaClock } from 'react-icons/fa';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { packsAPI } from '../../services/api';
import { formatPrice } from '../../utils/priceFormatter';
import { bypassCloudinaryCache } from '../../utils/imageHelper'; // ✅ AJOUTE CETTE LIGNE


const PackDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pack, setPack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchPack();
  }, [id]);

  const fetchPack = async () => {
    try {
      const response = await packsAPI.getById(id);
      setPack(response.data.data);
    } catch (error) {
      console.error('Error:', error);
      alert('Error loading package');
      navigate('/packs');
    } finally {
      setLoading(false);
    }
  };

  // Slideshow automatique
  useEffect(() => {
    if (!pack?.photos || pack.photos.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev === pack.photos.length - 1 ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(interval);
  }, [pack?.photos]);

  const nextImage = () => {
    if (!pack?.photos) return;
    setCurrentImageIndex((prev) => (prev === pack.photos.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    if (!pack?.photos) return;
    setCurrentImageIndex((prev) => (prev === 0 ? pack.photos.length - 1 : prev - 1));
  };

  const handleBooking = () => {
    if (!selectedDate) {
      alert('Please select an arrival date');
      return;
    }

    const checkIn = new Date(selectedDate);
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + pack.durationDays);

    navigate('/booking', {
      state: {
        packId: pack.id,
        packName: pack.name,
        roomType: pack.roomType,
        checkIn: selectedDate,
        checkOut: checkOut.toISOString().split('T')[0],
        services: pack.includedServices.map(s => s.id),
        totalPrice: pack.promoPrice,
        isPack: true
      }
    });
  };

  if (loading) return <Loader />;
  
  if (!pack) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="p-8 sm:p-12 text-center">
          <p className="text-lg sm:text-xl text-dark-light mb-4 sm:mb-6">Package not found</p>
          <Button onClick={() => navigate('/packs')}>Back to Packages</Button>
        </Card>
      </div>
    );
  }

  const discountPercent = pack.originalPrice 
    ? Math.round((1 - pack.promoPrice / pack.originalPrice) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-background">
     {/* ✅ Header - Correction du titre qui déborde */}
<div className="relative bg-gradient-to-r from-primary via-primary-dark to-primary text-white py-16 sm:py-20 md:py-24 overflow-hidden">
  {/* Décorations */}
  <div className="absolute inset-0 opacity-10">
    <div className="absolute top-5 sm:top-10 left-5 sm:left-10 w-20 sm:w-32 h-20 sm:h-32 border-2 sm:border-4 border-white rounded-full" />
    <div className="absolute bottom-5 sm:bottom-10 right-10 sm:right-20 w-24 sm:w-40 h-24 sm:h-40 border-2 sm:border-4 border-white rounded-full" />
    <div className="absolute top-1/2 right-1/3 w-16 sm:w-24 h-16 sm:h-24 border-2 sm:border-4 border-white rounded-full hidden sm:block" />
  </div>
  
  <div className="container-custom relative z-10 px-4 sm:px-6">
    <button 
      onClick={() => navigate('/packs')}
      className="flex items-center gap-2 text-white/90 hover:text-white mb-3 sm:mb-4 transition-colors text-sm sm:text-base"
    >
      <FaArrowLeft className="text-xs sm:text-sm flex-shrink-0" />
      Back to Packages
    </button>
    
    {/* ✅ Titre avec break-words et overflow contrôlé */}
    <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold break-words hyphens-auto max-w-full">
      {pack.name}
    </h1>
    
    {discountPercent > 0 && (
      <div className="mt-3 inline-flex items-center gap-2 bg-red-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-bold text-xs sm:text-sm flex-wrap">
        <FaGift className="text-xs sm:text-sm flex-shrink-0" />
        <span className="whitespace-nowrap">-{discountPercent}% discount</span>
      </div>
    )}
  </div>
</div>


      {/* ✅ Content - Padding ajusté */}
      <div className="container-custom py-8 sm:py-10 md:py-12 px-4 sm:px-6">
        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            {/* ✅ Galerie photos - Hauteur réduite sur mobile */}
            {pack.photos && pack.photos.length > 0 && (
              <Card className="overflow-hidden">
                <div className="relative h-64 sm:h-80 md:h-96 bg-accent group">
                 <img
    src={bypassCloudinaryCache(pack.photos[currentImageIndex])} // ✅ CHANGE ICI
    alt={pack.name}
    className="w-full h-full object-cover transition-opacity duration-500"
  />

                  {pack.photos.length > 1 && (
                    <>
                      {/* ✅ Navigation arrows - Plus petites sur mobile */}
                      <button
                        onClick={prevImage}
                        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 sm:p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity touch-manipulation"
                        aria-label="Previous image"
                      >
                        <FaChevronLeft className="text-base sm:text-xl" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 sm:p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity touch-manipulation"
                        aria-label="Next image"
                      >
                        <FaChevronRight className="text-base sm:text-xl" />
                      </button>

                      {/* ✅ Dots - Plus gros pour tactile */}
                      <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2">
                        {pack.photos.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`h-2 sm:h-2 rounded-full transition-all touch-manipulation ${
                              index === currentImageIndex 
                                ? 'bg-white w-6 sm:w-8' 
                                : 'bg-white/50 w-2 hover:bg-white/75'
                            }`}
                            aria-label={`Go to image ${index + 1}`}
                          />
                        ))}
                      </div>

                      {/* ✅ Counter - Plus petit sur mobile */}
                      <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-black/50 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                        {currentImageIndex + 1} / {pack.photos.length}
                      </div>
                    </>
                  )}
                </div>
              </Card>
            )}

            {/* ✅ Description - Padding réduit + Anglais */}
            <Card className="p-5 sm:p-6 md:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-dark mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                <div className="w-1 h-6 sm:h-8 bg-primary rounded-full" />
                About this Package
              </h2>
              <p className="text-dark-light leading-relaxed text-sm sm:text-base md:text-lg">
                {pack.description}
              </p>
            </Card>

            {/* ✅ Infos clés - Grid responsive + Anglais */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <Card className="p-4 sm:p-6 border-2 border-blue-200 bg-blue-50">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="bg-blue-500 p-3 sm:p-4 rounded-xl flex-shrink-0">
                    <FaCalendar className="text-2xl sm:text-3xl text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm text-dark-light mb-1">Stay Duration</div>
                    <div className="text-xl sm:text-2xl font-bold text-dark">
                      {pack.durationDays} day{pack.durationDays > 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-4 sm:p-6 border-2 border-purple-200 bg-purple-50">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="bg-purple-500 p-3 sm:p-4 rounded-xl flex-shrink-0">
                    <FaBed className="text-2xl sm:text-3xl text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm text-dark-light mb-1">Room Type</div>
                    <div className="text-xl sm:text-2xl font-bold text-dark">
                      {pack.roomType === 'SINGLE' ? 'Single' : 
                       pack.roomType === 'DOUBLE' ? 'Double' : 'Dormitory'}
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* ✅ Services inclus - Responsive + Anglais */}
            {pack.includedServices && pack.includedServices.length > 0 && (
              <Card className="p-5 sm:p-6 md:p-8 border-2 border-primary/20">
                <h3 className="text-xl sm:text-2xl font-bold text-dark mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <FaStar className="text-primary text-lg sm:text-xl" />
                  Services Included in this Package
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  {pack.includedServices.map(service => (
                    <div 
                      key={service.id} 
                      className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-accent/20 rounded-lg hover:bg-accent/30 transition-colors"
                    >
                      <div className="flex-shrink-0 w-6 sm:w-8 h-6 sm:h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <FaCheck className="text-primary text-xs sm:text-sm" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-dark mb-1 text-sm sm:text-base break-words">{service.name}</div>
                        {service.description && (
                          <p className="text-xs sm:text-sm text-dark-light break-words">{service.description}</p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs sm:text-sm text-dark-light line-through">
                          {formatPrice(service.price)}
                        </div>
                        <div className="text-[10px] sm:text-xs text-green-600 font-semibold">Included</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* ✅ Économies - Responsive + Anglais */}
            {pack.originalPrice && (
              <Card className="p-4 sm:p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="bg-green-500 p-3 sm:p-4 rounded-xl flex-shrink-0">
                    <FaGift className="text-2xl sm:text-3xl text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm text-green-700 mb-1">Your Savings</div>
                    <div className="text-2xl sm:text-3xl font-bold text-green-800">
                      {formatPrice(pack.originalPrice - pack.promoPrice)}
                    </div>
                    <div className="text-xs sm:text-sm text-green-600">
                      {discountPercent}% discount on the regular price
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* ✅ Sidebar réservation - Non sticky sur mobile */}
          <div className="lg:col-span-1">
            <Card className="p-5 sm:p-6 lg:sticky lg:top-24 border-2 border-primary/20 shadow-2xl">
              {/* ✅ Prix - Responsive */}
              <div className="text-center mb-5 sm:mb-6">
                {pack.originalPrice && (
                  <div className="text-base sm:text-lg text-dark-light line-through mb-1">
                    {formatPrice(pack.originalPrice)}
                  </div>
                )}
                <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">
                  {formatPrice(pack.promoPrice)}
                </div>
                <div className="text-xs sm:text-sm text-dark-light">
                  for {pack.durationDays} day{pack.durationDays > 1 ? 's' : ''}
                </div>
              </div>

              <div className="h-px bg-accent/30 my-5 sm:my-6" />

              {/* ✅ Formulaire - Anglais */}
              <div className="space-y-4 mb-5 sm:mb-6">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-dark mb-2 flex items-center gap-2">
                    <FaClock className="text-primary text-xs sm:text-sm" />
                    Arrival Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-accent rounded-lg focus:border-primary focus:outline-none transition-colors text-sm sm:text-base"
                    required
                  />
                </div>

                {selectedDate && (
                  <Card className="p-3 sm:p-4 bg-primary/5 border-2 border-primary/20">
                    <div className="space-y-2 text-xs sm:text-sm">
                      <div className="flex justify-between gap-2">
                        <span className="text-dark-light">✅ Arrival</span>
                        <span className="font-semibold text-dark text-right">
                          {new Date(selectedDate).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-dark-light">❌ Departure</span>
                        <span className="font-semibold text-dark text-right">
                          {new Date(new Date(selectedDate).setDate(
                            new Date(selectedDate).getDate() + pack.durationDays
                          )).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </Card>
                )}
              </div>

              <Button 
                onClick={handleBooking}
                className="w-full mb-4 shadow-xl hover:shadow-2xl text-sm sm:text-base"
                disabled={!selectedDate}
              >
                Book this Package
              </Button>

              <div className="space-y-2 text-xs text-dark-light text-center">
                <p className="flex items-center justify-center gap-2">
                  <FaCheck className="text-green-500 flex-shrink-0" />
                  <span>Instant confirmation by email</span>
                </p>
                <p className="flex items-center justify-center gap-2">
                  <FaCheck className="text-green-500 flex-shrink-0" />
                  <span>Payment on arrival</span>
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackDetailPage;
