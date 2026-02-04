import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBed, FaUsers, FaArrowRight, FaMapMarkerAlt } from 'react-icons/fa';
import Card from '../common/Card';
import Button from '../common/Button';
import Loader from '../common/Loader';
import { roomsAPI } from '../../services/api';
import { formatPrice } from '../../utils/priceFormatter';
import { bypassCloudinaryCache } from '../../utils/imageHelper'; // ✅ AJOUTE

const FeaturedRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await roomsAPI.getAll();
      setRooms(response.data.data.slice(0, 3));
      setError(null);
    } catch (error) {
      console.error('Error:', error);
      setError('Unable to load rooms.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;
  
  if (error) {
    return (
      <section className="section bg-background">
        <div className="container-custom text-center px-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 sm:px-6 py-3 sm:py-4 rounded-lg">
            <p className="font-medium text-sm sm:text-base">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (rooms.length === 0) {
    return (
      <section className="section bg-background">
        <div className="container-custom text-center px-4">
          <p className="text-dark-light text-sm sm:text-base">No rooms available at the moment.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="section bg-gradient-to-b from-white to-background relative overflow-hidden">
      {/* ✅ Decoration - Cachées sur mobile */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3 hidden md:block" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/30 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 hidden md:block" />
      
      <div className="container-custom relative z-10 px-4 sm:px-6">
        {/* ✅ Header - Responsive + Anglais */}
        <div className="text-center mb-12 md:mb-16">
          <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/10 text-primary rounded-full text-xs sm:text-sm font-semibold mb-3 sm:mb-4">
            Quality Accommodation
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-dark mb-3 md:mb-4 px-4">
            Our Rooms
          </h2>
          <p className="text-base sm:text-lg text-dark-light max-w-2xl mx-auto leading-relaxed px-4">
            Comfortable and bright spaces designed for your well-being
          </p>
        </div>

        {/* ✅ Grid - Gap réduit sur mobile */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-10 md:mb-12">
          {rooms.map((room) => {
            const numberOfBeds = room?.beds?.length || room?.numberOfBeds || 0;
            const maxCapacity = room?.roomType === 'DOUBLE' ? 2 : numberOfBeds;

            return (
              <Card 
                key={room.id} 
                className="overflow-hidden group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
              >
                {/* ✅ Image - Hauteur réduite sur mobile */}
                <div className="relative h-56 sm:h-64 md:h-72 bg-accent overflow-hidden">
                  {room.photos && room.photos.length > 0 ? (
                    <>
                      <img 
      src={bypassCloudinaryCache(room.photos[0])} // ✅ CHANGE ICI
      alt={`Room ${room.roomNumber}`}
      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
    />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-warm">
                      <FaBed className="text-5xl sm:text-6xl text-white/30" />
                    </div>
                  )}
                  
                  {/* ✅ Badge prix - Compact sur mobile */}
                  <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-white text-dark px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-bold shadow-xl backdrop-blur-sm">
                    <div className="text-xl sm:text-2xl text-primary">{formatPrice(room.pricePerNight)}</div>
                    <div className="text-[10px] sm:text-xs text-dark-light">per night</div>
                  </div>

                  {/* ✅ Type badge - Plus petit sur mobile */}
                  <div className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-primary/90 backdrop-blur-sm text-white px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold">
                    {room.roomType}
                  </div>
                </div>

                {/* ✅ Content - Padding réduit */}
                <div className="p-4 sm:p-6">
                  <h3 className="text-xl sm:text-2xl font-display font-bold text-dark mb-2 sm:mb-3 group-hover:text-primary transition-colors">
                    Room {room.roomNumber}
                  </h3>
                  
                  <p className="text-sm sm:text-base text-dark-light mb-4 sm:mb-6 line-clamp-2 leading-relaxed">
                    {room.description}
                  </p>

                  {/* ✅ Stats - Ajusté pour mobile */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-accent/30 rounded-lg">
                      <div className="bg-white p-1.5 sm:p-2 rounded-lg">
                        <FaBed className="text-primary text-sm sm:text-lg" />
                      </div>
                      <div>
                        <div className="text-[10px] sm:text-xs text-dark-light">Beds</div>
                        <div className="font-bold text-dark text-sm sm:text-base">{numberOfBeds}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-accent/30 rounded-lg">
                      <div className="bg-white p-1.5 sm:p-2 rounded-lg">
                        <FaUsers className="text-primary text-sm sm:text-lg" />
                      </div>
                      <div>
                        <div className="text-[10px] sm:text-xs text-dark-light">Capacity</div>
                        <div className="font-bold text-dark text-sm sm:text-base">{maxCapacity} guests</div>
                      </div>
                    </div>
                  </div>

                  {/* ✅ Bouton - Taille texte ajustée */}
                  <Link to={`/rooms/${room.id}`}>
                    <Button variant="primary" className="w-full group shadow-lg hover:shadow-xl text-sm sm:text-base">
                      View details
                      <FaArrowRight className="group-hover:translate-x-2 transition-transform text-xs sm:text-sm" />
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>

        {/* ✅ Bouton "Toutes les chambres" - Responsive */}
        <div className="text-center">
          <Link to="/rooms">
            <Button size="lg" variant="outline" className="group shadow-lg hover:shadow-xl text-sm sm:text-base">
              Discover all our rooms
              <FaArrowRight className="group-hover:translate-x-2 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedRooms;
