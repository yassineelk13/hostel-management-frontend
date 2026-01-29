import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBed, FaUsers, FaArrowRight, FaFilter, FaThLarge } from 'react-icons/fa';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { roomsAPI } from '../../services/api';
import { formatPrice } from '../../utils/priceFormatter';


const RoomsPage = () => {
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    if (filter === 'ALL') {
      setFilteredRooms(rooms);
    } else {
      setFilteredRooms(rooms.filter(room => room.roomType === filter));
    }
  }, [filter, rooms]);

  const fetchRooms = async () => {
    try {
      const response = await roomsAPI.getAll();
      setRooms(response.data.data);
      setFilteredRooms(response.data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const roomTypes = [
    { value: 'ALL', label: 'All', icon: FaThLarge },
    { value: 'SINGLE', label: 'Single', icon: FaBed },
    { value: 'DOUBLE', label: 'Double', icon: FaBed },
    { value: 'DORTOIR', label: 'Dormitory', icon: FaUsers },
  ];

  return (
    <div className="min-h-screen bg-background">
     {/* ✅ Header avec titre corrigé */}
<div className="relative bg-gradient-to-r from-primary via-primary-dark to-primary text-white py-16 sm:py-20 md:py-24 overflow-hidden">
  <div className="absolute inset-0 opacity-10">
    <div className="absolute top-5 sm:top-10 left-5 sm:left-10 w-20 sm:w-32 h-20 sm:h-32 border-2 sm:border-4 border-white rounded-full" />
    <div className="absolute bottom-5 sm:bottom-10 right-10 sm:right-20 w-24 sm:w-40 h-24 sm:h-40 border-2 sm:border-4 border-white rounded-full" />
    <div className="absolute top-1/2 right-1/3 w-16 sm:w-24 h-16 sm:h-24 border-2 sm:border-4 border-white rounded-full hidden sm:block" />
  </div>
  
  <div className="container-custom text-center relative z-10 px-4 sm:px-6">
    {/* ✅ Titre avec break-words */}
    <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold mb-3 sm:mb-4 break-words hyphens-auto max-w-full">
      Our Rooms
    </h1>
    <p className="text-base sm:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed break-words px-2">
      Find the perfect room for your stay in Imsouane
    </p>
  </div>
</div>


      {/* ✅ Content - Padding ajusté */}
      <div className="container-custom py-8 sm:py-10 md:py-12 px-4 sm:px-6">
        {/* ✅ Filtres - Responsive + Anglais */}
        <Card className="p-4 sm:p-6 mb-8 sm:mb-10 shadow-xl">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
            <div className="bg-primary/10 p-2 sm:p-3 rounded-lg flex-shrink-0">
              <FaFilter className="text-primary text-base sm:text-xl" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-dark text-base sm:text-lg">Filter by Type</h3>
              <p className="text-xs sm:text-sm text-dark-light">{filteredRooms.length} room(s) available</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {roomTypes.map(type => {
              const Icon = type.icon;
              return (
                <button
                  key={type.value}
                  onClick={() => setFilter(type.value)}
                  className={`flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base ${
                    filter === type.value
                      ? 'bg-primary text-white shadow-lg scale-105'
                      : 'bg-accent text-dark hover:bg-accent-dark hover:shadow-md'
                  }`}
                >
                  <Icon className="text-xs sm:text-sm" />
                  {type.label}
                </button>
              );
            })}
          </div>
        </Card>

        {/* ✅ Liste des chambres */}
        {loading ? (
          <Loader />
        ) : filteredRooms.length === 0 ? (
          <Card className="p-8 sm:p-12 text-center">
            <p className="text-lg sm:text-xl text-dark-light">No rooms available for this filter</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredRooms.map((room) => {
              const numberOfBeds = room?.beds?.length || room?.totalBeds || 0;
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
                          src={room.photos[0]} 
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
                    <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-white text-dark px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-bold shadow-xl">
                      <div className="text-xl sm:text-2xl text-primary">{formatPrice(room.pricePerNight)}</div>
                      <div className="text-[10px] sm:text-xs text-dark-light">per night</div>
                    </div>

                    {/* ✅ Badge type - Compact sur mobile */}
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

                    {/* ✅ Stats - Compact sur mobile */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
                      <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-accent/30 rounded-lg">
                        <div className="bg-white p-1.5 sm:p-2 rounded-lg flex-shrink-0">
                          <FaBed className="text-primary text-sm sm:text-lg" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[10px] sm:text-xs text-dark-light">Beds</div>
                          <div className="font-bold text-dark text-sm sm:text-base">{numberOfBeds}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-accent/30 rounded-lg">
                        <div className="bg-white p-1.5 sm:p-2 rounded-lg flex-shrink-0">
                          <FaUsers className="text-primary text-sm sm:text-lg" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[10px] sm:text-xs text-dark-light">Capacity</div>
                          <div className="font-bold text-dark text-sm sm:text-base">{maxCapacity} guests</div>
                        </div>
                      </div>
                    </div>

                    <Link to={`/rooms/${room.id}`}>
                      <Button variant="primary" className="w-full group shadow-lg hover:shadow-xl text-sm sm:text-base">
                        View Details
                        <FaArrowRight className="group-hover:translate-x-2 transition-transform text-xs sm:text-sm" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomsPage;
