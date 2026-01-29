import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaBed, FaUsers, FaArrowLeft, FaChevronLeft, FaChevronRight, FaWifi, FaClock, FaCheck, FaDoorOpen, FaMapMarkerAlt } from 'react-icons/fa';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { roomsAPI } from '../../services/api';
import { formatPrice } from '../../utils/priceFormatter';


const RoomDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchRoom();
  }, [id]);

  const fetchRoom = async () => {
    try {
      const response = await roomsAPI.getById(id);
      setRoom(response.data.data);
    } catch (error) {
      console.error('Error:', error);
      alert('Room not found');
      navigate('/rooms');
    } finally {
      setLoading(false);
    }
  };

  // Slideshow automatique
  useEffect(() => {
    if (!room?.photos || room.photos.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev === room.photos.length - 1 ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(interval);
  }, [room?.photos]);

  const nextImage = () => {
    if (!room?.photos) return;
    setCurrentImageIndex((prev) => (prev === room.photos.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    if (!room?.photos) return;
    setCurrentImageIndex((prev) => (prev === 0 ? room.photos.length - 1 : prev - 1));
  };

  const numberOfBeds = room?.beds?.length || room?.numberOfBeds || 0;
  const maxCapacity = room?.roomType === 'DOUBLE' ? 2 : numberOfBeds;

  if (loading) return <Loader />;
  if (!room) return null;

  const amenities = [
    { icon: FaWifi, label: 'Free Wi-Fi', color: 'blue' },
    { icon: FaClock, label: '24/7 Check-in', color: 'green' },
    { icon: FaDoorOpen, label: 'Secure Access', color: 'purple' },
  ];

  return (
    <div className="min-h-screen bg-background">
    {/* ✅ Header avec titre room number corrigé */}
<div className="relative bg-gradient-to-r from-primary via-primary-dark to-primary text-white py-8 sm:py-10 md:py-12 overflow-hidden">
  <div className="absolute inset-0 opacity-10">
    <div className="absolute top-3 sm:top-5 left-5 sm:left-10 w-16 sm:w-24 h-16 sm:h-24 border-2 sm:border-4 border-white rounded-full" />
    <div className="absolute bottom-3 sm:bottom-5 right-10 sm:right-20 w-20 sm:w-32 h-20 sm:h-32 border-2 sm:border-4 border-white rounded-full" />
  </div>
  
  <div className="container-custom relative z-10 px-4 sm:px-6">
    <button 
      onClick={() => navigate('/rooms')}
      className="flex items-center gap-2 text-white/90 hover:text-white mb-3 sm:mb-4 transition-colors group text-sm sm:text-base"
    >
      <FaArrowLeft className="group-hover:-translate-x-1 transition-transform text-xs sm:text-sm flex-shrink-0" />
      Back to Rooms
    </button>
    
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
      <div className="flex-1 min-w-0">
        {/* ✅ Titre avec break-words et min-w-0 pour éviter débordement */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold mb-2 break-words hyphens-auto">
          Room {room.roomNumber}
        </h1>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="px-3 sm:px-4 py-1 sm:py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap">
            {room.roomType}
          </span>
          <span className="px-3 sm:px-4 py-1 sm:py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap">
            {numberOfBeds} bed{numberOfBeds > 1 ? 's' : ''}
          </span>
        </div>
      </div>
      
      {/* ✅ Prix avec flex-shrink-0 pour ne pas compresser */}
      <div className="text-left sm:text-right flex-shrink-0">
        <div className="text-4xl sm:text-5xl font-bold whitespace-nowrap">
          {formatPrice(room.pricePerNight)}
        </div>
        <div className="text-white/80 text-sm sm:text-base whitespace-nowrap">
          per night
        </div>
      </div>
    </div>
  </div>
</div>


      {/* ✅ Content - Padding ajusté */}
      <div className="container-custom py-8 sm:py-10 md:py-12 px-4 sm:px-6">
        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            {/* ✅ Galerie - Hauteur réduite sur mobile */}
            <Card className="overflow-hidden border-2 border-primary/20">
              <div className="relative h-64 sm:h-80 md:h-96 lg:h-[500px] bg-accent group">
                {room.photos && room.photos.length > 0 ? (
                  <>
                    <img 
                      src={room.photos[currentImageIndex]} 
                      alt={`Room ${room.roomNumber}`}
                      className="w-full h-full object-cover transition-opacity duration-500"
                    />

                    {room.photos.length > 1 && (
                      <>
                        {/* ✅ Navigation - Ajustée pour mobile */}
                        <button
                          onClick={prevImage}
                          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 sm:p-4 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:scale-110 touch-manipulation"
                          aria-label="Previous image"
                        >
                          <FaChevronLeft className="text-base sm:text-xl" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 sm:p-4 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:scale-110 touch-manipulation"
                          aria-label="Next image"
                        >
                          <FaChevronRight className="text-base sm:text-xl" />
                        </button>

                        {/* ✅ Dots - Plus gros sur mobile */}
                        <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2">
                          {room.photos.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={`h-2 rounded-full transition-all touch-manipulation ${
                                index === currentImageIndex 
                                  ? 'bg-white w-6 sm:w-8' 
                                  : 'bg-white/50 hover:bg-white/75 w-2'
                              }`}
                              aria-label={`Go to image ${index + 1}`}
                            />
                          ))}
                        </div>

                        {/* ✅ Counter - Plus petit sur mobile */}
                        <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-black/70 backdrop-blur-sm text-white px-2 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold">
                          {currentImageIndex + 1} / {room.photos.length}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-warm">
                    <FaBed className="text-6xl sm:text-8xl text-white/30" />
                  </div>
                )}
              </div>
            </Card>

            {/* ✅ Description - Padding réduit */}
            <Card className="p-5 sm:p-6 md:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-dark mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                <div className="w-1 h-6 sm:h-8 bg-primary rounded-full" />
                About this Room
              </h2>
              <p className="text-dark-light leading-relaxed text-sm sm:text-base md:text-lg mb-4 sm:mb-6">
                {room.description}
              </p>

              {/* ✅ Specs - Grid responsive */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="p-4 sm:p-6 border-2 border-blue-200 bg-blue-50">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="bg-blue-500 p-3 sm:p-4 rounded-xl flex-shrink-0">
                      <FaBed className="text-2xl sm:text-3xl text-white" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm text-dark-light mb-1">Number of Beds</div>
                      <div className="text-2xl sm:text-3xl font-bold text-dark">{numberOfBeds}</div>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 sm:p-6 border-2 border-purple-200 bg-purple-50">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="bg-purple-500 p-3 sm:p-4 rounded-xl flex-shrink-0">
                      <FaUsers className="text-2xl sm:text-3xl text-white" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm text-dark-light mb-1">Max Capacity</div>
                      <div className="text-2xl sm:text-3xl font-bold text-dark">{maxCapacity} guests</div>
                    </div>
                  </div>
                </Card>
              </div>
            </Card>

            {/* ✅ Liste des lits - Responsive */}
            {room.beds && room.beds.length > 0 && (
              <Card className="p-5 sm:p-6 md:p-8 border-2 border-accent/30">
                <h3 className="text-lg sm:text-xl font-bold text-dark mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <FaBed className="text-primary text-base sm:text-lg" />
                  Beds Available in this Room
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  {room.beds.map((bed) => (
                    <Card 
                      key={bed.id} 
                      className="p-3 sm:p-4 text-center border-2 border-primary/20 hover:border-primary hover:shadow-lg transition-all"
                    >
                      <div className="bg-primary/10 w-10 sm:w-12 h-10 sm:h-12 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
                        <FaBed className="text-xl sm:text-2xl text-primary" />
                      </div>
                      <div className="font-bold text-dark text-sm sm:text-base">Bed {bed.bedNumber}</div>
                    </Card>
                  ))}
                </div>
              </Card>
            )}

            {/* ✅ Équipements - Responsive */}
            <Card className="p-5 sm:p-6 md:p-8 bg-gradient-to-br from-accent/20 to-accent/5">
              <h3 className="text-lg sm:text-xl font-bold text-dark mb-4 sm:mb-6">Included Amenities</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                {amenities.map((amenity, index) => {
                  const Icon = amenity.icon;
                  return (
                    <div key={index} className="flex items-center gap-2 sm:gap-3 p-3 bg-white rounded-lg">
                      <Icon className={`text-xl sm:text-2xl text-${amenity.color}-500 flex-shrink-0`} />
                      <span className="text-xs sm:text-sm font-medium text-dark">{amenity.label}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* ✅ Sidebar - Non sticky sur mobile */}
          <div className="lg:col-span-1">
            <Card className="p-5 sm:p-6 lg:sticky lg:top-24 border-2 border-primary/20 shadow-2xl">
              <div className="text-center mb-5 sm:mb-6 pb-5 sm:pb-6 border-b-2 border-accent/30">
                <div className="text-4xl sm:text-5xl font-bold text-primary mb-2">
                  {formatPrice(room.pricePerNight)}
                </div>
                <div className="text-dark-light text-sm sm:text-base">per night</div>
              </div>

              <div className="space-y-3 sm:space-y-4 mb-5 sm:mb-6">
                <div className="flex items-start gap-2 sm:gap-3 p-3 bg-green-50 rounded-lg">
                  <FaCheck className="text-green-500 mt-1 flex-shrink-0 text-xs sm:text-sm" />
                  <div className="text-xs sm:text-sm text-dark-light">
                    <strong className="text-dark block mb-1">Flexible Check-in</strong>
                    Available 24/7 with access code
                  </div>
                </div>

                <div className="flex items-start gap-2 sm:gap-3 p-3 bg-blue-50 rounded-lg">
                  <FaClock className="text-blue-500 mt-1 flex-shrink-0 text-xs sm:text-sm" />
                  <div className="text-xs sm:text-sm text-dark-light">
                    <strong className="text-dark block mb-1">Check-out</strong>
                    Before 12:00 PM
                  </div>
                </div>

                <div className="flex items-start gap-2 sm:gap-3 p-3 bg-purple-50 rounded-lg">
                  <FaMapMarkerAlt className="text-purple-500 mt-1 flex-shrink-0 text-xs sm:text-sm" />
                  <div className="text-xs sm:text-sm text-dark-light">
                    <strong className="text-dark block mb-1">Location</strong>
                    Imsouane, facing the ocean
                  </div>
                </div>
              </div>

              <Button 
                onClick={() => navigate('/booking', { state: { roomId: room.id } })}
                className="w-full mb-4 shadow-xl hover:shadow-2xl text-sm sm:text-base"
              >
                Book this Room
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
                <p className="flex items-center justify-center gap-2">
                  <FaCheck className="text-green-500 flex-shrink-0" />
                  <span>Free cancellation 24h before</span>
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetailPage;
