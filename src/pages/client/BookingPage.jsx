import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaBed, FaCheckCircle, FaBoxOpen, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaClock, FaStar, FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { bookingsAPI, roomsAPI, servicesAPI } from '../../services/api';
import { formatPrice } from '../../utils/priceFormatter';

const BookingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const packData = location.state;
  const isPack = packData?.isPack || false;

  const [step, setStep] = useState(isPack ? 3 : 1);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [availableServices, setAvailableServices] = useState([]);
const [formData, setFormData] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    checkInDate: packData?.checkIn || '',
    checkOutDate: packData?.checkOut || '',
    roomId: null,
    bedIds: [],
    serviceIds: [],  // ✅ Toujours vide — le backend gère les services du pack
    packId: packData?.packId || null,
    notes: ''
});
  const [bookingConfirmation, setBookingConfirmation] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ NOUVEAU : Scroll automatique en haut à chaque changement d'étape
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  useEffect(() => {
    fetchServices();
    if (isPack && packData.checkIn && packData.checkOut) {
      fetchAvailableRoomsForPack(packData.checkIn, packData.checkOut, packData.roomType);
    }
  }, []);

  const fetchServices = async () => {
    try {
      const response = await servicesAPI.getAll();
      setAvailableServices(response.data.data);
    } catch (error) {
      console.error('Error loading services:', error);
    }
  };

  const fetchAvailableRoomsForPack = async (checkIn, checkOut, roomType) => {
    setLoading(true);
    try {
      const response = await roomsAPI.getAvailable(checkIn, checkOut);
      const filteredRooms = response.data.data.filter(room => room.roomType === roomType);
      setAvailableRooms(filteredRooms);

      if (filteredRooms.length === 0) {
        alert('No rooms available for this package.');
        navigate('/packs');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error checking availability');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleDateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.checkInDate || !formData.checkOutDate) {
      alert('Please select dates');
      return;
    }

    setLoading(true);
    try {
      const response = await roomsAPI.getAvailable(formData.checkInDate, formData.checkOutDate);
      setAvailableRooms(response.data.data);
      if (response.data.data.length === 0) {
        alert('No rooms available for these dates');
      } else {
        setStep(2);
      }
    } catch (error) {
      alert('Error searching for available rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
    setFormData({
      ...formData,
      roomId: room.id,
      bedIds: []
    });
    setStep(3);
  };

  const handleBedToggle = (bedId) => {
    setFormData(prev => ({
      ...prev,
      bedIds: prev.bedIds.includes(bedId)
        ? prev.bedIds.filter(id => id !== bedId)
        : [...prev.bedIds, bedId]
    }));
  };

  const handleServiceToggle = (serviceId) => {
    if (isPack) return;

    setFormData(prev => ({
      ...prev,
      serviceIds: prev.serviceIds.includes(serviceId)
        ? prev.serviceIds.filter(id => id !== serviceId)
        : [...prev.serviceIds, serviceId]
    }));
  };

  const calculateTotal = () => {
    if (isPack && packData?.totalPrice) {
      return packData.totalPrice;
    }

    if (!selectedRoom) return 0;

    const checkIn = new Date(formData.checkInDate);
    const checkOut = new Date(formData.checkOutDate);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

    const roomTotal = selectedRoom.pricePerNight * nights * formData.bedIds.length;

    const servicesTotal = availableServices
      .filter(s => formData.serviceIds.includes(s.id))
      .reduce((sum, s) => {
        if (s.priceType === 'PER_NIGHT') {
          return sum + (s.price * nights);
        }
        return sum + s.price;
      }, 0);

    return roomTotal + servicesTotal;
  };

const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.bedIds.length === 0) {
        alert('Please select at least one bed');
        return;
    }

    setLoading(true);
    try {
        // ✅ Payload propre
        const payload = {
            ...formData,
            serviceIds: isPack ? [] : formData.serviceIds, // ✅ Vide si pack
            packId: isPack ? packData.packId : null,
        };

        const response = await bookingsAPI.create(payload);  // ✅ payload au lieu de formData
        setBookingConfirmation(response.data.data);
        setStep(4);
    } catch (error) {
        console.error('Error:', error);
        alert(error.response?.data?.message || 'Error creating booking');
    } finally {
        setLoading(false);
    }
};


  const steps = [
    { number: 1, label: 'Dates', icon: FaCalendarAlt },
    { number: 2, label: 'Room', icon: FaBed },
    { number: 3, label: 'Details', icon: FaUser },
    { number: 4, label: 'Confirmation', icon: FaCheckCircle },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-white pt-16 sm:pt-20">
      {/* ✅ Header moderne responsive */}
      <div className="relative bg-gradient-to-r from-primary via-primary-dark to-primary text-white py-12 sm:py-16 md:py-20 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-5 left-10 w-16 h-16 sm:w-24 sm:h-24 border-4 border-white rounded-full animate-pulse" />
          <div className="absolute bottom-5 right-20 w-20 h-20 sm:w-32 sm:h-32 border-4 border-white rounded-full animate-pulse" />
        </div>

        <div className="container-custom relative z-10 text-center px-4 sm:px-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-display font-bold mb-3 sm:mb-4 leading-tight pt-2 break-words">
            {isPack ? `Package Booking` : 'Booking'}
          </h1>

          {isPack && (
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/20 backdrop-blur-sm rounded-full text-xs sm:text-sm font-semibold break-words max-w-full">
              <FaBoxOpen className="flex-shrink-0" />
              <span className="truncate">{packData.packName}</span>
            </div>
          )}

          {!isPack && (
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 max-w-2xl mx-auto break-words px-4">
              Book your stay in just a few clicks
            </p>
          )}
        </div>
      </div>

      <div className="container-custom py-6 sm:py-8 md:py-12 max-w-5xl px-3 sm:px-4 md:px-6">
        {/* ✅ Badge Pack premium responsive */}
        {isPack && (
          <Card className="mb-4 sm:mb-6 md:mb-8 overflow-hidden border-2 border-primary shadow-xl">
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                <div className="bg-primary p-3 sm:p-4 rounded-xl flex-shrink-0">
                  <FaBoxOpen className="text-2xl sm:text-3xl text-white" />
                </div>
                <div className="flex-1 min-w-0 w-full">
                  <h3 className="font-bold text-dark text-lg sm:text-xl mb-2 flex flex-wrap items-center gap-2 break-words">
                    <span className="truncate">{packData.packName}</span>
                    <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-primary text-white rounded-full text-xs flex-shrink-0">
                      Package
                    </span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <FaCalendarAlt className="text-primary flex-shrink-0" />
                      <span className="text-dark-light truncate">
                        {new Date(packData.checkIn).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                        {' → '}
                        {new Date(packData.checkOut).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaBed className="text-primary flex-shrink-0" />
                      <span className="text-dark-light truncate">{packData.roomType}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaStar className="text-primary flex-shrink-0" />
                      <span className="font-bold text-primary whitespace-nowrap">{formatPrice(packData.totalPrice)}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                <p className="text-[10px] sm:text-xs text-yellow-800 flex items-center gap-2 break-words">
                  <FaClock className="flex-shrink-0" />
                  <span>Package dates and services cannot be modified</span>
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* ✅ Progress bar responsive */}
        {!isPack && (
          <div className="mb-6 sm:mb-8 md:mb-12 px-2 sm:px-0">
            <div className="flex items-center justify-between relative">
              {/* Ligne de progression */}
              <div className="absolute left-0 top-4 sm:top-5 w-full h-0.5 sm:h-1 bg-accent/30" style={{ zIndex: 0 }} />
              <div
                className="absolute left-0 top-4 sm:top-5 h-0.5 sm:h-1 bg-primary transition-all duration-500"
                style={{
                  width: `${((step - 1) / (steps.length - 1)) * 100}%`,
                  zIndex: 0
                }}
              />

              {steps.map((s, index) => {
                const Icon = s.icon;
                const isActive = step >= s.number;
                const isCurrent = step === s.number;

                return (
                  <div key={s.number} className="flex flex-col items-center relative" style={{ zIndex: 1 }}>
                    <div className={`
                      w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mb-1 sm:mb-2 transition-all duration-300
                      ${isActive
                        ? 'bg-primary text-white shadow-lg scale-110'
                        : 'bg-white border-2 border-accent text-dark-light'}
                      ${isCurrent ? 'ring-2 sm:ring-4 ring-primary/30' : ''}
                    `}>
                      <Icon className="text-sm sm:text-base md:text-xl" />
                    </div>
                    <div className={`text-[10px] sm:text-xs md:text-sm font-semibold ${isActive ? 'text-primary' : 'text-dark-light'} hidden xs:block`}>
                      {s.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ✅ ÉTAPE 1: Sélection des dates responsive */}
        {step === 1 && !isPack && (
          <Card className="p-4 sm:p-6 md:p-8 border-2 border-primary/20 shadow-xl">
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-block p-3 sm:p-4 bg-primary/10 rounded-full mb-3 sm:mb-4">
                <FaCalendarAlt className="text-3xl sm:text-4xl text-primary" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-dark mb-2 break-words px-2">
                Choose Your Dates
              </h2>
              <p className="text-sm sm:text-base text-dark-light break-words px-2">
                Select your stay period in Imsouane
              </p>
            </div>

            <form onSubmit={handleDateSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-dark mb-2 sm:mb-3 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-primary flex-shrink-0" />
                    <span>Check-in Date <span className="text-red-500">*</span></span>
                  </label>
                  <input
                    type="date"
                    name="checkInDate"
                    value={formData.checkInDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 sm:px-4 py-3 sm:py-4 border-2 border-accent rounded-xl focus:border-primary focus:outline-none text-base sm:text-lg transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-dark mb-2 sm:mb-3 flex items-center gap-2">
                    <FaClock className="text-primary flex-shrink-0" />
                    <span>Check-out Date <span className="text-red-500">*</span></span>
                  </label>
                  <input
                    type="date"
                    name="checkOutDate"
                    value={formData.checkOutDate}
                    onChange={handleChange}
                    min={formData.checkInDate || new Date().toISOString().split('T')[0]}
                    className="w-full px-3 sm:px-4 py-3 sm:py-4 border-2 border-accent rounded-xl focus:border-primary focus:outline-none text-base sm:text-lg transition-colors disabled:opacity-50"
                    disabled={!formData.checkInDate}
                    required
                  />
                </div>
              </div>

              {formData.checkInDate && formData.checkOutDate && (
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-primary/5 rounded-xl border border-primary/20">
                  <div className="flex items-center justify-center gap-2 text-primary text-sm sm:text-base">
                    <FaCheckCircle className="flex-shrink-0" />
                    <span className="font-semibold">
                      {Math.ceil((new Date(formData.checkOutDate) - new Date(formData.checkInDate)) / (1000 * 60 * 60 * 24))} night(s) selected
                    </span>
                  </div>
                </div>
              )}

              <Button type="submit" size="lg" className="w-full shadow-xl hover:shadow-2xl text-sm sm:text-base" disabled={loading}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Searching...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span>Search Available Rooms</span>
                    <FaArrowRight className="flex-shrink-0" />
                  </span>
                )}
              </Button>
            </form>
          </Card>
        )}

        {/* ✅ ÉTAPE 2: Sélection chambre responsive */}
        {step === 2 && !isPack && (
          <div className="space-y-4 sm:space-y-6">
            <Card className="p-4 sm:p-6 md:p-8 border-2 border-primary/20">
              <div className="text-center mb-4 sm:mb-6">
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-dark mb-2 break-words px-2">
                  Available Rooms
                </h2>
                <p className="text-xs sm:text-sm text-dark-light flex flex-wrap items-center justify-center gap-1 sm:gap-2 px-2">
                  <FaCalendarAlt className="flex-shrink-0" />
                  <span className="break-words text-center">
                    From {new Date(formData.checkInDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long' })} to{' '}
                    {new Date(formData.checkOutDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long' })}
                  </span>
                </p>
              </div>

              {loading ? (
                <Loader />
              ) : availableRooms.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="inline-block p-4 sm:p-6 bg-red-50 rounded-full mb-3 sm:mb-4">
                    <FaBed className="text-4xl sm:text-5xl text-red-400" />
                  </div>
                  <p className="text-lg sm:text-xl text-dark-light mb-4 sm:mb-6 break-words px-4">No rooms available for these dates</p>
                  <Button variant="outline" onClick={() => setStep(1)} className="text-sm sm:text-base">
                    <FaArrowLeft className="flex-shrink-0" />
                    <span>Change Dates</span>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {availableRooms.map((room) => (
                    <Card
                      key={room.id}
                      className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 border-accent/30 hover:border-primary/50"
                    >
                      <div className="flex flex-col md:flex-row gap-4 sm:gap-6 p-4 sm:p-6">
                        <div className="w-full md:w-40 lg:w-48 h-40 sm:h-48 bg-gradient-warm rounded-xl flex-shrink-0 overflow-hidden">
                          {room.photos && room.photos[0] ? (
                            <img
                              src={room.photos[0]}
                              alt={`Room ${room.roomNumber}`}
                              className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FaBed className="text-4xl sm:text-5xl text-white/30" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row items-start justify-between gap-3 mb-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-xl sm:text-2xl font-bold text-dark mb-1 sm:mb-2 break-words">Room {room.roomNumber}</h3>
                              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                                <span className="px-2 sm:px-3 py-1 bg-primary/10 text-primary rounded-full font-semibold truncate">
                                  {room.roomType}
                                </span>
                                <span className="flex items-center gap-1 text-dark-light whitespace-nowrap">
                                  <FaBed className="flex-shrink-0" />
                                  <span>{room.totalBeds} bed(s)</span>
                                </span>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="text-2xl sm:text-3xl font-bold text-primary whitespace-nowrap">{formatPrice(room.pricePerNight)}</div>
                              <div className="text-xs sm:text-sm text-dark-light">per night</div>
                            </div>
                          </div>
                          <p className="text-dark-light text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed line-clamp-2">{room.description}</p>
                          <Button
                            onClick={() => handleRoomSelect(room)}
                            className="w-full md:w-auto shadow-lg hover:shadow-xl text-sm sm:text-base"
                          >
                            <span>Select This Room</span>
                            <FaArrowRight className="flex-shrink-0" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>

            <Button variant="outline" onClick={() => setStep(1)} className="w-full text-sm sm:text-base">
              <FaArrowLeft className="flex-shrink-0" />
              <span>Change Dates</span>
            </Button>
          </div>
        )}

        {/* ✅ ÉTAPE 3: Détails et formulaire responsive */}
        {step === 3 && (
          <div className="space-y-4 sm:space-y-6">
            {/* Sélection chambre pour pack */}
            {isPack && availableRooms.length > 0 && !selectedRoom && (
              <Card className="p-4 sm:p-6 md:p-8 border-2 border-primary/20">
                <div className="text-center mb-4 sm:mb-6">
                  <h2 className="text-2xl sm:text-3xl font-display font-bold text-dark mb-2 break-words px-2">
                    Choose Your Room
                  </h2>
                  <p className="text-sm sm:text-base text-dark-light">Type: {packData.roomType}</p>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  {availableRooms.map((room) => (
                    <Card
                      key={room.id}
                      className="overflow-hidden hover:shadow-2xl transition-all border-2 border-accent/30 hover:border-primary/50"
                    >
                      <div className="flex flex-col md:flex-row gap-4 sm:gap-6 p-4 sm:p-6">
                        <div className="w-full md:w-40 lg:w-48 h-40 sm:h-48 bg-gradient-warm rounded-xl flex-shrink-0 overflow-hidden">
                          {room.photos && room.photos[0] ? (
                            <img src={room.photos[0]} alt={`Room ${room.roomNumber}`}
                              className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FaBed className="text-4xl sm:text-5xl text-white/30" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl sm:text-2xl font-bold text-dark mb-2 break-words">Room {room.roomNumber}</h3>
                          <p className="text-dark-light text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">{room.description}</p>
                          <Button onClick={() => handleRoomSelect(room)} className="text-sm sm:text-base">
                            <span>Select</span>
                            <FaArrowRight className="flex-shrink-0" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            )}

            {/* Formulaire principal */}
            {selectedRoom && (
              <Card className="p-4 sm:p-6 md:p-8 border-2 border-primary/20 shadow-xl">
                <div className="text-center mb-6 sm:mb-8">
                  <div className="inline-block p-3 sm:p-4 bg-primary/10 rounded-full mb-3 sm:mb-4">
                    <FaUser className="text-3xl sm:text-4xl text-primary" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-display font-bold text-dark mb-2 break-words px-2">
                    Complete Your Booking
                  </h2>
                </div>

                {/* Récap chambre */}
                <Card className="mb-6 sm:mb-8 border-2 border-accent/30 bg-gradient-to-r from-accent/10 to-accent/5">
                  <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 p-4 sm:p-6">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-warm rounded-xl flex-shrink-0 overflow-hidden">
                      {selectedRoom.photos?.[0] ? (
                        <img src={selectedRoom.photos[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FaBed className="text-2xl sm:text-3xl text-white/30" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-dark text-base sm:text-lg mb-1 break-words">
                        Room {selectedRoom.roomNumber} - {selectedRoom.roomType}
                      </h3>
                      <p className="text-xs sm:text-sm text-dark-light flex flex-wrap items-center gap-1 sm:gap-2">
                        <FaCalendarAlt className="flex-shrink-0" />
                        <span className="break-words">
                          {new Date(formData.checkInDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long' })}
                          {' → '}
                          {new Date(formData.checkOutDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long' })}
                        </span>
                      </p>
                    </div>
                    {!isPack && (
                      <div className="text-right flex-shrink-0">
                        <div className="text-xl sm:text-2xl font-bold text-primary whitespace-nowrap">{formatPrice(selectedRoom.pricePerNight)}</div>
                        <div className="text-[10px] sm:text-xs text-dark-light">per night</div>
                      </div>
                    )}
                  </div>
                </Card>

                <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
                  {/* Sélection lits */}
                  <div>
                    <label className="block text-base sm:text-lg font-semibold text-dark mb-3 sm:mb-4 flex items-center gap-2">
                      <FaBed className="text-primary flex-shrink-0" />
                      <span>Select Your Beds <span className="text-red-500">*</span></span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                      {selectedRoom.beds?.map((bed) => (
                        <label
                          key={bed.id}
                          className={`
                            relative flex flex-col items-center justify-center p-4 sm:p-6 border-3 rounded-xl cursor-pointer transition-all
                            ${formData.bedIds.includes(bed.id)
                              ? 'border-primary bg-primary/10 shadow-lg scale-105'
                              : 'border-accent hover:border-primary/50 hover:shadow-md'}
                          `}
                        >
                          <input
                            type="checkbox"
                            checked={formData.bedIds.includes(bed.id)}
                            onChange={() => handleBedToggle(bed.id)}
                            className="sr-only"
                          />
                          {formData.bedIds.includes(bed.id) && (
                            <div className="absolute top-1 sm:top-2 right-1 sm:right-2 bg-primary text-white rounded-full p-0.5 sm:p-1">
                              <FaCheckCircle className="text-xs sm:text-sm" />
                            </div>
                          )}
                          <div className={`p-2 sm:p-3 rounded-xl mb-1 sm:mb-2 ${formData.bedIds.includes(bed.id) ? 'bg-primary' : 'bg-accent'
                            }`}>
                            <FaBed className={`text-xl sm:text-2xl ${formData.bedIds.includes(bed.id) ? 'text-white' : 'text-primary'
                              }`} />
                          </div>
                          <div className="font-semibold text-dark text-xs sm:text-sm">Bed {bed.bedNumber}</div>
                        </label>
                      ))}
                    </div>
                    <p className="text-xs sm:text-sm text-dark-light mt-2 sm:mt-3 flex items-center gap-2">
                      <FaCheckCircle className="text-primary flex-shrink-0" />
                      <span>{formData.bedIds.length} bed(s) selected</span>
                    </p>
                  </div>

                  {/* Services */}
                  {availableServices.length > 0 && (
                    <div>
                      <label className="block text-base sm:text-lg font-semibold text-dark mb-3 sm:mb-4 flex items-center gap-2 break-words">
                        <FaStar className="text-primary flex-shrink-0" />
                        <span>Additional Services {isPack && '(included in package)'}</span>
                      </label>
                      <div className="space-y-2 sm:space-y-3">
                        {availableServices.map((service) => (
                          <label
                            key={service.id}
                            className={`
                              flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border-2 rounded-xl transition-all
                              ${formData.serviceIds.includes(service.id)
                                ? 'bg-primary/10 border-primary'
                                : 'border-accent hover:bg-accent/20'}
                              ${isPack ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}
                            `}
                          >
                            <input
                              type="checkbox"
                              checked={formData.serviceIds.includes(service.id)}
                              onChange={() => handleServiceToggle(service.id)}
                              disabled={isPack}
                              className="w-4 h-4 sm:w-5 sm:h-5 accent-primary flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-dark text-sm sm:text-base break-words">{service.name}</div>
                              <p className="text-[10px] sm:text-xs text-dark-light">
                                {service.priceType === 'PER_NIGHT' ? 'Per night' : 'Fixed price'}
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="font-bold text-primary text-sm sm:text-base whitespace-nowrap">{formatPrice(service.price)}</div>
                              {service.priceType === 'PER_NIGHT' && (
                                <span className="text-[10px] sm:text-xs text-dark-light">/night</span>
                              )}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Infos client */}
                  <div className="border-t-2 border-accent/30 pt-6 sm:pt-8">
                    <h3 className="text-base sm:text-lg font-semibold text-dark mb-4 sm:mb-6 flex items-center gap-2">
                      <FaUser className="text-primary flex-shrink-0" />
                      <span>Your Information</span>
                    </h3>

                    <div className="space-y-4 sm:space-y-6">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-dark mb-2">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="guestName"
                          value={formData.guestName}
                          onChange={handleChange}
                          placeholder="John Doe"
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-accent rounded-xl focus:border-primary focus:outline-none transition-colors text-sm sm:text-base"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-dark mb-2">
                            Email <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <FaEnvelope className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-dark-light text-sm sm:text-base" />
                            <input
                              type="email"
                              name="guestEmail"
                              value={formData.guestEmail}
                              onChange={handleChange}
                              placeholder="john.doe@example.com"
                              className="w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 border-2 border-accent rounded-xl focus:border-primary focus:outline-none transition-colors text-sm sm:text-base"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-dark mb-2">
                            Phone <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <FaPhone className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-dark-light text-sm sm:text-base" />
                            <input
                              type="tel"
                              name="guestPhone"
                              value={formData.guestPhone}
                              onChange={handleChange}
                              placeholder="+212 6 12 34 56 78"
                              pattern="^[+0-9][0-9\s\-().]{7,19}$"
                              title="Entrez un numéro de téléphone valide (ex: +212 6 12 34 56 78)"
                              className="w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 border-2 border-accent rounded-xl focus:border-primary focus:outline-none transition-colors text-sm sm:text-base"
                              required
                            />

                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-dark mb-2">
                          Special Notes (optional)
                        </label>
                        <textarea
                          name="notes"
                          value={formData.notes}
                          onChange={handleChange}
                          rows="4"
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-accent rounded-xl focus:border-primary focus:outline-none resize-none transition-colors text-sm sm:text-base"
                          placeholder="Special requests, allergies, expected arrival time..."
                        ></textarea>
                      </div>
                    </div>
                  </div>

                  {/* Total */}
                  <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary/30 p-4 sm:p-6">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-base sm:text-lg md:text-xl font-semibold text-dark">Total Amount</span>
                      <div className="text-right">
                        <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary whitespace-nowrap">{formatPrice(calculateTotal())}</div>
                        {isPack && (
                          <p className="text-[10px] sm:text-xs text-dark-light mt-1">Package price (all inclusive)</p>
                        )}
                      </div>
                    </div>
                  </Card>

                  {/* Boutons */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    {!isPack && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setStep(2);
                          setSelectedRoom(null);
                        }}
                        className="flex-1 text-sm sm:text-base"
                      >
                        <FaArrowLeft className="flex-shrink-0" />
                        <span>Back</span>
                      </Button>
                    )}
                    <Button
                      type="submit"
                      disabled={loading || formData.bedIds.length === 0}
                      className={`${isPack ? 'w-full' : 'flex-1'} shadow-xl hover:shadow-2xl text-sm sm:text-base`}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 sm:w-5 sm:h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Sending...</span>
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <span>Confirm Booking</span>
                          <FaCheckCircle className="flex-shrink-0" />
                        </span>
                      )}
                    </Button>
                  </div>
                </form>
              </Card>
            )}
          </div>
        )}

        {/* ✅ ÉTAPE 4: Confirmation responsive */}
        {step === 4 && bookingConfirmation && (
          <Card className="p-6 sm:p-8 md:p-12 text-center border-2 border-green-200 shadow-2xl">
            <div className="inline-block p-6 sm:p-8 bg-gradient-to-br from-green-100 to-green-50 rounded-full mb-4 sm:mb-6 animate-bounce">
              <FaCheckCircle className="text-5xl sm:text-6xl md:text-7xl text-green-600" />
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-dark mb-3 sm:mb-4 break-words px-2">
              Booking Confirmed!
            </h2>

            <p className="text-base sm:text-lg text-dark-light mb-6 sm:mb-8 break-words px-2">
              Your booking has been successfully registered
            </p>

            <Card className="bg-gradient-to-r from-accent/20 to-accent/10 p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                <div className="p-3 sm:p-4 bg-white rounded-xl">
                  <div className="text-xs sm:text-sm text-dark-light mb-1 sm:mb-2">Booking Reference</div>
                  <div className="font-bold text-primary text-lg sm:text-xl md:text-2xl break-all">{bookingConfirmation.bookingReference}</div>
                </div>
                {/* <div className="p-3 sm:p-4 bg-white rounded-xl">
                  <div className="text-xs sm:text-sm text-dark-light mb-1 sm:mb-2">Access Code</div>
                  <div className="font-bold text-primary text-lg sm:text-xl md:text-2xl">{bookingConfirmation.accessCode}</div>
                </div> */}
                <div className="p-3 sm:p-4 bg-white rounded-xl">
                  <div className="text-xs sm:text-sm text-dark-light mb-1 sm:mb-2">Name</div>
                  <div className="font-semibold text-dark text-sm sm:text-base break-words">{bookingConfirmation.guestName}</div>
                </div>
                <div className="p-3 sm:p-4 bg-white rounded-xl">
                  <div className="text-xs sm:text-sm text-dark-light mb-1 sm:mb-2">Email</div>
                  <div className="font-semibold text-dark text-xs sm:text-sm break-all">{bookingConfirmation.guestEmail}</div>
                </div>
                <div className="p-3 sm:p-4 bg-white rounded-xl">
                  <div className="text-xs sm:text-sm text-dark-light mb-1 sm:mb-2">Check-in</div>
                  <div className="font-semibold text-dark text-xs sm:text-sm break-words">
                    {new Date(bookingConfirmation.checkInDate).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </div>
                </div>
                <div className="p-3 sm:p-4 bg-white rounded-xl">
                  <div className="text-xs sm:text-sm text-dark-light mb-1 sm:mb-2">Check-out</div>
                  <div className="font-semibold text-dark text-xs sm:text-sm break-words">
                    {new Date(bookingConfirmation.checkOutDate).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </div>
                </div>
              </div>
            </Card>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 sm:p-6 rounded mb-6 sm:mb-8 text-left">
              <p className="text-xs sm:text-sm text-blue-800 flex items-center gap-2 mb-2 break-words">
                <FaEnvelope className="text-blue-500 flex-shrink-0" />
                <span>A confirmation email has been sent with all details</span>
              </p>
              <p className="text-xs sm:text-sm text-blue-800 flex items-center gap-2 break-words">
                <FaClock className="text-blue-500 flex-shrink-0" />
                <span>Keep your reference and access code for check-in</span>
              </p>
            </div>

            <Button onClick={() => navigate('/')} size="lg" className="shadow-xl hover:shadow-2xl text-sm sm:text-base w-full sm:w-auto">
              Back to Home
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BookingPage;
