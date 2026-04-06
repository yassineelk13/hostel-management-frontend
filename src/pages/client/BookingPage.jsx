import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaBed, FaCheckCircle, FaBoxOpen, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaClock, FaStar, FaArrowRight, FaArrowLeft, FaUserFriends } from 'react-icons/fa';
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

  // ✅ NEW: number of persons — only relevant for SINGLE rooms
  const [numberOfPersons, setNumberOfPersons] = useState(1);

  const [formData, setFormData] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    checkInDate: packData?.checkIn || '',
    checkOutDate: packData?.checkOut || '',
    roomId: null,
    bedIds: [],
    serviceIds: isPack ? (packData?.services || []) : [],
    packId: packData?.packId || null,
    notes: ''
  });

  const [bookingConfirmation, setBookingConfirmation] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ Auto-scroll to top on step change
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
    console.log('Room selected:', room);
    console.log('Beds:', room.beds);
    console.log('RoomType:', room.roomType);

    setSelectedRoom(room);
    // ✅ Reset persons count when a new room is selected
    setNumberOfPersons(1);

    const allBedIds = (room.roomType === 'SINGLE' || room.roomType === 'DOUBLE')
      ? room.beds?.map(b => b.id) || []
      : [];
    setFormData({ ...formData, roomId: room.id, bedIds: allBedIds });
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

  // ✅ Helper: get persons count based on room type
  const getPersonsCount = () => {
    if (!selectedRoom && !isPack) return 1;
    const roomType = selectedRoom?.roomType || packData?.roomType;
    if (roomType === 'DORTOIR') return formData.bedIds.length;
    if (roomType === 'SINGLE') return numberOfPersons;
    return 1; // DOUBLE: fixed price, no per-person change
  };

  // ✅ BREAKFAST EXTRA: +5€/night per extra person (for packs)
  const BREAKFAST_EXTRA_PER_PERSON_PER_NIGHT = 5;

  const calculateTotal = () => {
    if (isPack) {
      // DORTOIR pack: price × beds × nights
      if (packData?.roomType === 'DORTOIR' && formData.bedIds.length > 0) {
        return (packData.pricePerNight || 0) * packData.nights * formData.bedIds.length;
      }
      // SINGLE pack: base price + breakfast extra for 2nd person
      if (packData?.roomType === 'SINGLE') {
        const basePrice = packData?.totalPrice || 0;
        const breakfastExtra = BREAKFAST_EXTRA_PER_PERSON_PER_NIGHT * (numberOfPersons - 1) * (packData.nights || 0);
        return basePrice + breakfastExtra;
      }
      // DOUBLE: fixed price
      return packData?.totalPrice || 0;
    }

    if (!selectedRoom) return 0;

    const nights = Math.ceil(
      (new Date(formData.checkOutDate) - new Date(formData.checkInDate)) / (1000 * 60 * 60 * 24)
    );

    const personsCount = getPersonsCount();

    let roomTotal = 0;
if (selectedRoom.roomType === 'SINGLE' || selectedRoom.roomType === 'DOUBLE') {
  roomTotal = selectedRoom.pricePerNight * nights;
  // ✅ Breakfast extra pour 2ème personne en SINGLE
  if (selectedRoom.roomType === 'SINGLE' && numberOfPersons === 2) {
    roomTotal += BREAKFAST_EXTRA_PER_PERSON_PER_NIGHT * nights;
  }
} else {
      roomTotal = selectedRoom.pricePerNight * nights * personsCount;
    }

    const servicesTotal = availableServices
      .filter(s => formData.serviceIds.includes(s.id))
      .reduce((sum, s) => {
        // ✅ PER_ROOM services (transport etc.) are NOT multiplied by persons count
        // ✅ PER_PERSON services (surf, yoga etc.) ARE multiplied
        const serviceMultiplier = s.pricingType === 'PER_ROOM' ? 1 : personsCount;
        if (s.priceType === 'PER_NIGHT') return sum + s.price * nights * serviceMultiplier;
        return sum + s.price * serviceMultiplier;
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
      const roomType = selectedRoom?.roomType || packData?.roomType;
      const payload = {
        ...formData,
        serviceIds: isPack ? [] : formData.serviceIds,
        packId: isPack ? packData.packId : null,
        // ✅ Send numberOfPersons to backend
        numberOfPersons: roomType === 'DORTOIR'
          ? formData.bedIds.length
          : roomType === 'SINGLE'
          ? numberOfPersons
          : 1,
        totalPrice: calculateTotal(),
      };

      const response = await bookingsAPI.create(payload);
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

  // ✅ Helper: determine current room type (for pack or regular booking)
  const currentRoomType = selectedRoom?.roomType || packData?.roomType;

  // ✅ Price breakdown for SINGLE rooms
  const getPriceBreakdown = () => {
    if (currentRoomType !== 'SINGLE') return null;
    const nights = isPack
      ? packData.nights
      : Math.ceil((new Date(formData.checkOutDate) - new Date(formData.checkInDate)) / (1000 * 60 * 60 * 24));

    if (numberOfPersons === 1) return null;

    const lines = [];

    if (isPack) {
      lines.push({ label: 'Pack base price', value: formatPrice(packData.totalPrice) });
      if (numberOfPersons === 2) {
        lines.push({
          label: `Breakfast 2nd person (${nights} nights × ${formatPrice(BREAKFAST_EXTRA_PER_PERSON_PER_NIGHT)})`,
          value: formatPrice(BREAKFAST_EXTRA_PER_PERSON_PER_NIGHT * nights)
        });
      }
    } else {
  if (selectedRoom) {
    lines.push({ label: `Room (${nights} nights)`, value: formatPrice(selectedRoom.pricePerNight * nights) });
  }
  // ✅ Breakfast extra pour non-pack
  if (numberOfPersons === 2) {
    lines.push({
      label: `🥐 Breakfast 2nd person (${nights} nights × ${formatPrice(BREAKFAST_EXTRA_PER_PERSON_PER_NIGHT)})`,
      value: formatPrice(BREAKFAST_EXTRA_PER_PERSON_PER_NIGHT * nights)
    });
  }
      const perPersonServices = availableServices.filter(s =>
        formData.serviceIds.includes(s.id) && s.pricingType !== 'PER_ROOM'
      );
      const perRoomServices = availableServices.filter(s =>
        formData.serviceIds.includes(s.id) && s.pricingType === 'PER_ROOM'
      );
      if (perPersonServices.length > 0) {
        const total = perPersonServices.reduce((sum, s) => {
          if (s.priceType === 'PER_NIGHT') return sum + s.price * nights * numberOfPersons;
          return sum + s.price * numberOfPersons;
        }, 0);
        lines.push({ label: `Services ×${numberOfPersons} persons`, value: formatPrice(total) });
      }
      if (perRoomServices.length > 0) {
        const total = perRoomServices.reduce((sum, s) => {
          if (s.priceType === 'PER_NIGHT') return sum + s.price * nights;
          return sum + s.price;
        }, 0);
        lines.push({ label: 'Services (per room, not per person)', value: formatPrice(total) });
      }
    }
    return lines;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-white pt-16 sm:pt-20">
      {/* Header */}
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
        {/* Pack badge */}
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
                    <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-primary text-white rounded-full text-xs flex-shrink-0">Package</span>
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
                      <span className="font-bold text-primary whitespace-nowrap">
                        {formatPrice(
                          packData?.roomType === 'DORTOIR' && formData.bedIds.length > 0
                            ? (packData.pricePerNight || 0) * packData.nights * formData.bedIds.length
                            : packData?.roomType === 'SINGLE'
                            ? calculateTotal()
                            : packData.totalPrice
                        )}
                        {packData?.roomType === 'DORTOIR' && formData.bedIds.length > 1 && (
                          <span className="text-xs font-normal text-primary/60 ml-1">
                            ({formData.bedIds.length} beds)
                          </span>
                        )}
                        {packData?.roomType === 'SINGLE' && numberOfPersons === 2 && (
                          <span className="text-xs font-normal text-primary/60 ml-1">(2 persons)</span>
                        )}
                      </span>
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

        {/* Progress bar */}
        {!isPack && (
          <div className="mb-6 sm:mb-8 md:mb-12 px-2 sm:px-0">
            <div className="flex items-center justify-between relative">
              <div className="absolute left-0 top-4 sm:top-5 w-full h-0.5 sm:h-1 bg-accent/30" style={{ zIndex: 0 }} />
              <div
                className="absolute left-0 top-4 sm:top-5 h-0.5 sm:h-1 bg-primary transition-all duration-500"
                style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%`, zIndex: 0 }}
              />
              {steps.map((s) => {
                const Icon = s.icon;
                const isActive = step >= s.number;
                const isCurrent = step === s.number;
                return (
                  <div key={s.number} className="flex flex-col items-center relative" style={{ zIndex: 1 }}>
                    <div className={`
                      w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mb-1 sm:mb-2 transition-all duration-300
                      ${isActive ? 'bg-primary text-white shadow-lg scale-110' : 'bg-white border-2 border-accent text-dark-light'}
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

        {/* STEP 1: Date selection */}
        {step === 1 && !isPack && (
          <Card className="p-4 sm:p-6 md:p-8 border-2 border-primary/20 shadow-xl">
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-block p-3 sm:p-4 bg-primary/10 rounded-full mb-3 sm:mb-4">
                <FaCalendarAlt className="text-3xl sm:text-4xl text-primary" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-dark mb-2 break-words px-2">Choose Your Dates</h2>
              <p className="text-sm sm:text-base text-dark-light break-words px-2">Select your stay period in Imsouane</p>
            </div>
            <form onSubmit={handleDateSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-dark mb-2 sm:mb-3 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-primary flex-shrink-0" />
                    <span>Check-in Date <span className="text-red-500">*</span></span>
                  </label>
                  <input
                    type="date" name="checkInDate" value={formData.checkInDate} onChange={handleChange}
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
                    type="date" name="checkOutDate" value={formData.checkOutDate} onChange={handleChange}
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

        {/* STEP 2: Room selection */}
        {step === 2 && !isPack && (
          <div className="space-y-4 sm:space-y-6">
            <Card className="p-4 sm:p-6 md:p-8 border-2 border-primary/20">
              <div className="text-center mb-4 sm:mb-6">
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-dark mb-2 break-words px-2">Available Rooms</h2>
                <p className="text-xs sm:text-sm text-dark-light flex flex-wrap items-center justify-center gap-1 sm:gap-2 px-2">
                  <FaCalendarAlt className="flex-shrink-0" />
                  <span className="break-words text-center">
                    From {new Date(formData.checkInDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long' })} to{' '}
                    {new Date(formData.checkOutDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long' })}
                  </span>
                </p>
              </div>
              {loading ? <Loader /> : availableRooms.length === 0 ? (
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
                    <Card key={room.id} className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 border-accent/30 hover:border-primary/50">
                      <div className="flex flex-col md:flex-row gap-4 sm:gap-6 p-4 sm:p-6">
                        <div className="w-full md:w-40 lg:w-48 h-40 sm:h-48 bg-gradient-warm rounded-xl flex-shrink-0 overflow-hidden">
                          {room.photos && room.photos[0] ? (
                            <img src={room.photos[0]} alt={`Room ${room.roomNumber}`} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
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
                                <span className="px-2 sm:px-3 py-1 bg-primary/10 text-primary rounded-full font-semibold truncate">{room.roomType}</span>
                                <span className="flex items-center gap-1 text-dark-light whitespace-nowrap">
                                  <FaBed className="flex-shrink-0" />
                                  <span>{room.totalBeds} bed(s)</span>
                                </span>
                                {/* ✅ Badge: 2 persons possible for SINGLE */}
                                {room.roomType === 'SINGLE' && room.totalBeds >= 2 && (
                                  <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] sm:text-xs font-semibold whitespace-nowrap">
                                    <FaUserFriends className="flex-shrink-0" />
                                    1-2 persons
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="text-2xl sm:text-3xl font-bold text-primary whitespace-nowrap">{formatPrice(room.pricePerNight)}</div>
                              <div className="text-xs sm:text-sm text-dark-light">per night</div>
                            </div>
                          </div>
                          <p className="text-dark-light text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed line-clamp-2">{room.description}</p>
                          <Button onClick={() => handleRoomSelect(room)} className="w-full md:w-auto shadow-lg hover:shadow-xl text-sm sm:text-base">
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

        {/* STEP 3: Details & form */}
        {step === 3 && (
          <div className="space-y-4 sm:space-y-6">
            {/* Room selection for pack */}
            {isPack && availableRooms.length > 0 && !selectedRoom && (
              <Card className="p-4 sm:p-6 md:p-8 border-2 border-primary/20">
                <div className="text-center mb-4 sm:mb-6">
                  <h2 className="text-2xl sm:text-3xl font-display font-bold text-dark mb-2 break-words px-2">Choose Your Room</h2>
                  <p className="text-sm sm:text-base text-dark-light">Type: {packData.roomType}</p>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  {availableRooms.map((room) => (
                    <Card key={room.id} className="overflow-hidden hover:shadow-2xl transition-all border-2 border-accent/30 hover:border-primary/50">
                      <div className="flex flex-col md:flex-row gap-4 sm:gap-6 p-4 sm:p-6">
                        <div className="w-full md:w-40 lg:w-48 h-40 sm:h-48 bg-gradient-warm rounded-xl flex-shrink-0 overflow-hidden">
                          {room.photos && room.photos[0] ? (
                            <img src={room.photos[0]} alt={`Room ${room.roomNumber}`} className="w-full h-full object-cover" />
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

            {/* Main form */}
            {selectedRoom && (
              <Card className="p-4 sm:p-6 md:p-8 border-2 border-primary/20 shadow-xl">
                <div className="text-center mb-6 sm:mb-8">
                  <div className="inline-block p-3 sm:p-4 bg-primary/10 rounded-full mb-3 sm:mb-4">
                    <FaUser className="text-3xl sm:text-4xl text-primary" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-display font-bold text-dark mb-2 break-words px-2">Complete Your Booking</h2>
                </div>

                {/* Room recap */}
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
                  {/* DORMITORY: manual bed selection */}
                  {selectedRoom?.roomType === 'DORTOIR' && (
                    <div>
                      <label className="block text-base sm:text-lg font-semibold text-dark mb-3 sm:mb-4 flex items-center gap-2">
                        <FaBed className="text-primary flex-shrink-0" />
                        Select Your Bed <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                        {selectedRoom.beds?.map((bed) => (
                          <label key={bed.id} className={`relative flex flex-col items-center justify-center p-4 sm:p-6 border-3 rounded-xl cursor-pointer transition-all ${
                            formData.bedIds.includes(bed.id) ? 'border-primary bg-primary/10 shadow-lg scale-105' : 'border-accent hover:border-primary/50 hover:shadow-md'
                          }`}>
                            <input type="checkbox" checked={formData.bedIds.includes(bed.id)} onChange={() => handleBedToggle(bed.id)} className="sr-only" />
                            {formData.bedIds.includes(bed.id) && (
                              <div className="absolute top-1 sm:top-2 right-1 sm:right-2 bg-primary text-white rounded-full p-0.5 sm:p-1">
                                <FaCheckCircle className="text-xs sm:text-sm" />
                              </div>
                            )}
                            <div className={`p-2 sm:p-3 rounded-xl mb-1 sm:mb-2 ${formData.bedIds.includes(bed.id) ? 'bg-primary' : 'bg-accent'}`}>
                              <FaBed className={`text-xl sm:text-2xl ${formData.bedIds.includes(bed.id) ? 'text-white' : 'text-primary'}`} />
                            </div>
                            <div className="font-semibold text-dark text-xs sm:text-sm">Bed {bed.bedNumber}</div>
                          </label>
                        ))}
                      </div>
                      <p className="text-xs sm:text-sm text-dark-light mt-2 sm:mt-3 flex items-center gap-2">
                        <FaCheckCircle className="text-primary flex-shrink-0" />
                        <span>{formData.bedIds.length} bed{formData.bedIds.length !== 1 ? 's' : ''} selected</span>
                      </p>
                    </div>
                  )}

                  {/* SINGLE: full room reserved + NUMBER OF PERSONS selector */}
                  {selectedRoom?.roomType === 'SINGLE' && (
                    <div className="space-y-4">
                      {/* Full room info */}
                      <div className="p-4 sm:p-5 bg-green-50 rounded-xl border-2 border-green-200">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 rounded-xl flex-shrink-0">
                            <FaBed className="text-green-600 text-xl" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-dark text-sm sm:text-base">Full room reserved</p>
                            <p className="text-xs sm:text-sm text-dark-light">
                              You are booking the entire room
                              ({selectedRoom.beds?.length || 0} bed{selectedRoom.beds?.length !== 1 ? 's' : ''} included)
                            </p>
                          </div>
                          <FaCheckCircle className="text-green-500 text-xl flex-shrink-0" />
                        </div>
                      </div>

                      {/* ✅ NUMBER OF PERSONS selector — only for SINGLE */}
                      <div className="p-4 sm:p-5 bg-blue-50 rounded-xl border-2 border-blue-200">
                        <label className="block text-sm sm:text-base font-semibold text-dark mb-3 flex items-center gap-2">
                          <FaUserFriends className="text-blue-600 flex-shrink-0" />
                          How many persons?
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-3">
                          {[1, 2].map(n => (
                            <button
                              key={n}
                              type="button"
                              onClick={() => setNumberOfPersons(n)}
                              className={`flex-1 flex items-center justify-center gap-2 py-3 sm:py-4 rounded-xl border-2 font-bold text-sm sm:text-base transition-all duration-200 ${
                                numberOfPersons === n
                                  ? 'border-blue-500 bg-blue-500 text-white shadow-lg scale-105'
                                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-dark'
                              }`}
                            >
                              <FaUserFriends className="flex-shrink-0" />
                              {n} person{n > 1 ? 's' : ''}
                            </button>
                          ))}
                        </div>
                        {numberOfPersons === 2 && (
                          <div className="mt-3 p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs sm:text-sm text-amber-800 space-y-1">
                            <p className="font-semibold flex items-center gap-1.5">
                              <FaCheckCircle className="text-amber-600 flex-shrink-0" />
                              Pricing adjusted for 2 persons:
                            </p>
                            <ul className="ml-5 space-y-0.5 list-disc text-amber-700">
                              <li>Activity services (surf, yoga...) will be charged ×2</li>
                              <li>Transport: unchanged (per room)</li>
                              {isPack && <li>Breakfast: +{formatPrice(BREAKFAST_EXTRA_PER_PERSON_PER_NIGHT)}/night for the 2nd person</li>}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* DOUBLE: full room reserved (no person selector) */}
                  {selectedRoom?.roomType === 'DOUBLE' && (
                    <div className="p-4 sm:p-5 bg-green-50 rounded-xl border-2 border-green-200">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-xl flex-shrink-0">
                          <FaBed className="text-green-600 text-xl" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-dark text-sm sm:text-base">Full room reserved</p>
                          <p className="text-xs sm:text-sm text-dark-light">
                            You are booking the entire room
                            ({selectedRoom.beds?.length || 0} bed{selectedRoom.beds?.length !== 1 ? 's' : ''} included)
                          </p>
                        </div>
                        <FaCheckCircle className="text-green-500 text-xl flex-shrink-0" />
                      </div>
                    </div>
                  )}

                  {/* Services (hidden for packs) */}
                  {!isPack && availableServices.length > 0 && (
                    <div>
                      <label className="block text-base sm:text-lg font-semibold text-dark mb-3 sm:mb-4 flex items-center gap-2 break-words">
                        <FaStar className="text-primary flex-shrink-0" />
                        <span>Additional Services</span>
                      </label>
                      <div className="space-y-2 sm:space-y-3">
                        {availableServices.map((service) => (
                          <label
                            key={service.id}
                            className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border-2 rounded-xl cursor-pointer transition-all ${
                              formData.serviceIds.includes(service.id) ? 'bg-primary/10 border-primary' : 'border-accent hover:bg-accent/20'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={formData.serviceIds.includes(service.id)}
                              onChange={() => handleServiceToggle(service.id)}
                              className="w-4 h-4 sm:w-5 sm:h-5 accent-primary flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-dark text-sm sm:text-base break-words">{service.name}</div>
                              <p className="text-[10px] sm:text-xs text-dark-light flex items-center gap-1.5 flex-wrap">
                                <span>{service.priceType === 'PER_NIGHT' ? 'Per night' : 'Fixed price'}</span>
                                {/* ✅ Show if service is per person or per room */}
                                {currentRoomType === 'SINGLE' && numberOfPersons === 2 && (
                                  <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                                    service.pricingType === 'PER_ROOM'
                                      ? 'bg-gray-100 text-gray-600'
                                      : 'bg-blue-100 text-blue-700'
                                  }`}>
                                    {service.pricingType === 'PER_ROOM' ? 'per room' : 'per person ×2'}
                                  </span>
                                )}
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="font-bold text-primary text-sm sm:text-base whitespace-nowrap">
                                {/* ✅ Show adjusted price for 2 persons */}
                                {currentRoomType === 'SINGLE' && numberOfPersons === 2 && service.pricingType !== 'PER_ROOM'
                                  ? formatPrice(service.price * 2)
                                  : formatPrice(service.price)
                                }
                              </div>
                              <div className="text-[10px] sm:text-xs text-dark-light">
                                {service.priceType === 'PER_NIGHT' && '/night'}
                                {currentRoomType === 'SINGLE' && numberOfPersons === 2 && service.pricingType !== 'PER_ROOM' && (
                                  <span className="ml-1 text-blue-600">(×2)</span>
                                )}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Guest info */}
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
                          type="text" name="guestName" value={formData.guestName} onChange={handleChange}
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
                              type="email" name="guestEmail" value={formData.guestEmail} onChange={handleChange}
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
                              type="tel" name="guestPhone" value={formData.guestPhone} onChange={handleChange}
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
                        <label className="block text-xs sm:text-sm font-medium text-dark mb-2">Special Notes (optional)</label>
                        <textarea
                          name="notes" value={formData.notes} onChange={handleChange} rows="4"
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-accent rounded-xl focus:border-primary focus:outline-none resize-none transition-colors text-sm sm:text-base"
                          placeholder="Special requests, allergies, expected arrival time..."
                        ></textarea>
                      </div>
                    </div>
                  </div>

                  {/* Total */}
                  <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary/30 p-4 sm:p-6">
                    {/* ✅ Price breakdown for SINGLE + 2 persons */}
                    {currentRoomType === 'SINGLE' && numberOfPersons === 2 && getPriceBreakdown() && (
                      <div className="mb-4 pb-4 border-b border-primary/20 space-y-2">
                        <p className="text-xs font-bold text-dark/60 uppercase tracking-wider mb-2">Price breakdown</p>
                        {getPriceBreakdown().map((line, i) => (
                          <div key={i} className="flex justify-between items-center text-sm">
                            <span className="text-dark-light">{line.label}</span>
                            <span className="font-semibold text-dark">{line.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <span className="text-base sm:text-lg md:text-xl font-semibold text-dark">Total Amount</span>
                        {currentRoomType === 'SINGLE' && numberOfPersons === 2 && (
                          <p className="text-[10px] sm:text-xs text-dark-light mt-0.5">For 2 persons</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary whitespace-nowrap">{formatPrice(calculateTotal())}</div>
                        {isPack && (
                          <p className="text-[10px] sm:text-xs text-dark-light mt-1">Package price (all inclusive)</p>
                        )}
                      </div>
                    </div>
                  </Card>

                  {/* Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    {!isPack && (
                      <Button type="button" variant="outline" onClick={() => { setStep(2); setSelectedRoom(null); setNumberOfPersons(1); }} className="flex-1 text-sm sm:text-base">
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

        {/* STEP 4: Confirmation */}
        {step === 4 && bookingConfirmation && (
          <Card className="p-6 sm:p-8 md:p-12 text-center border-2 border-green-200 shadow-2xl">
            <div className="inline-block p-6 sm:p-8 bg-gradient-to-br from-green-100 to-green-50 rounded-full mb-4 sm:mb-6 animate-bounce">
              <FaCheckCircle className="text-5xl sm:text-6xl md:text-7xl text-green-600" />
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-dark mb-3 sm:mb-4 break-words px-2">Booking Confirmed!</h2>
            <p className="text-base sm:text-lg text-dark-light mb-6 sm:mb-8 break-words px-2">Your booking has been successfully registered</p>
            <Card className="bg-gradient-to-r from-accent/20 to-accent/10 p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
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
                    {new Date(bookingConfirmation.checkInDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>
                <div className="p-3 sm:p-4 bg-white rounded-xl">
                  <div className="text-xs sm:text-sm text-dark-light mb-1 sm:mb-2">Check-out</div>
                  <div className="font-semibold text-dark text-xs sm:text-sm break-words">
                    {new Date(bookingConfirmation.checkOutDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
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
