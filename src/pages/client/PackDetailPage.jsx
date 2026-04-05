import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaCheck, FaArrowLeft, FaBed, FaChevronLeft, FaChevronRight,
  FaConciergeBell, FaUtensils, FaWifi, FaCar,
  FaSwimmer, FaCamera, FaHeart, FaStar
} from 'react-icons/fa';
import Loader from '../../components/common/Loader';
import { packsAPI } from '../../services/api';
import { formatPrice } from '../../utils/priceFormatter';
import { bypassCloudinaryCache } from '../../utils/imageHelper';

// ✅ Constantes statiques — OK hors composant
const ROOM_TYPES = [
  { key: 'DORTOIR', label: 'Dormitory' },
  { key: 'SINGLE',  label: 'Single'    },
  { key: 'DOUBLE',  label: 'Double'    },
];

const getServiceIcon = (name = '') => {
  const n = name.toLowerCase();
  if (n.includes('dinner') || n.includes('meal') || n.includes('food') || n.includes('breakfast')) return FaUtensils;
  if (n.includes('surf')) return FaSwimmer;
  if (n.includes('transport') || n.includes('airport') || n.includes('transfer')) return FaCar;
  if (n.includes('photo') || n.includes('video') || n.includes('camera')) return FaCamera;
  if (n.includes('wifi') || n.includes('internet')) return FaWifi;
  if (n.includes('yoga') || n.includes('wellness')) return FaHeart;
  return FaConciergeBell;
};

const PackDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pack, setPack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedRoomType, setSelectedRoomType] = useState(null);
  const [selectedNights, setSelectedNights] = useState('');
  const [checkInDate, setCheckInDate] = useState('');

  // ✅ ICI — à l'intérieur du composant
  const availableNights = selectedRoomType
    ? (pack?.nightPrices ?? [])
        .filter(np => np.roomType === selectedRoomType)
        .map(np => np.nights)
        .sort((a, b) => a - b)
    : Array.from({ length: 8 }, (_, i) => i + 3);

  useEffect(() => { fetchPack(); }, [id]);

  const fetchPack = async () => {
    try {
      const response = await packsAPI.getById(id);
      setPack(response.data.data);
    } catch (error) {
      console.error('Error:', error);
      navigate('/packs');
    } finally {
      setLoading(false);
    }
  };

  const nextImage = () => {
    if (!pack?.photos) return;
    setCurrentImageIndex(prev => prev === pack.photos.length - 1 ? 0 : prev + 1);
  };
  const prevImage = () => {
    if (!pack?.photos) return;
    setCurrentImageIndex(prev => prev === 0 ? pack.photos.length - 1 : prev - 1);
  };

  const getNightPriceEntry = (roomType, nights) =>
    pack?.nightPrices?.find(
      np => np.roomType === roomType && np.nights === parseInt(nights)
    ) ?? null;

  const getPromoPrice = () => {
    if (!selectedRoomType || !selectedNights) return null;
    return getNightPriceEntry(selectedRoomType, selectedNights)?.promoPrice ?? null;
  };

  const getRegularPrice = () => {
    if (!selectedRoomType || !selectedNights) return null;
    return getNightPriceEntry(selectedRoomType, selectedNights)?.regularPrice ?? null;
  };

  const getMinPrice = (roomType) => {
    if (!pack?.nightPrices) return null;
    const prices = pack.nightPrices
      .filter(np => np.roomType === roomType)
      .map(np => Number(np.promoPrice));
    return prices.length > 0 ? Math.min(...prices) : null;
  };

  const getMinRegularPrice = (roomType) => {
    if (!pack?.nightPrices) return null;
    const prices = pack.nightPrices
      .filter(np => np.roomType === roomType && np.regularPrice)
      .map(np => Number(np.regularPrice));
    return prices.length > 0 ? Math.min(...prices) : null;
  };

  const roomTypeHasPrices = (roomType) =>
    pack?.nightPrices?.some(np => np.roomType === roomType) ?? false;

  const totalPrice = selectedRoomType && selectedNights
    ? (getPromoPrice() || 0) * parseInt(selectedNights)
    : null;

  const checkOutDate = checkInDate && selectedNights
    ? (() => {
        const d = new Date(checkInDate);
        d.setDate(d.getDate() + parseInt(selectedNights));
        return d.toISOString().split('T')[0];
      })()
    : null;

  const handleBooking = () => {
    if (!selectedRoomType) { alert('Please select a room type'); return; }
    if (!selectedNights) { alert('Please select number of nights'); return; }
    if (!checkInDate) { alert('Please select an arrival date'); return; }

    navigate('/booking', {
      state: {
        packId: pack.id,
        packName: pack.name,
        roomType: selectedRoomType,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        nights: parseInt(selectedNights),
        pricePerNight: getPromoPrice(),
        totalPrice,
        isPack: true
      }
    });
  };

  if (loading) return <Loader />;
  if (!pack) return null;

  const includedServices = pack.services || [];

  return (
    <div className="min-h-screen bg-[#f5f0eb]">

      {/* Top nav */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-[#f5f0eb]/90 backdrop-blur-sm border-b border-dark/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate('/packs')}
            className="flex items-center gap-2 text-sm text-dark/60 hover:text-dark transition-colors"
          >
            <FaArrowLeft className="text-xs" />
            All Packages
          </button>
          <span className="text-sm font-bold text-dark hidden sm:block">{pack.name}</span>
          <button
            onClick={handleBooking}
            disabled={!selectedRoomType || !selectedNights || !checkInDate}
            className="hidden sm:flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-primary-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Book Now
          </button>
        </div>
      </div>

      <div className="pt-16">

        {/* Hero image */}
        <div className="relative w-full h-[55vh] md:h-[65vh] overflow-hidden bg-dark/10 group">
          {pack.photos && pack.photos.length > 0 ? (
            <img
              src={bypassCloudinaryCache(pack.photos[currentImageIndex])}
              alt={pack.name}
              className="w-full h-full object-cover transition-all duration-700"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
              <span className="text-9xl opacity-20">🏄</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

          {pack.photos && pack.photos.length > 1 && (
            <>
              <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/40 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all">
                <FaChevronLeft />
              </button>
              <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/40 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all">
                <FaChevronRight />
              </button>
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                {pack.photos.map((_, i) => (
                  <button key={i} onClick={() => setCurrentImageIndex(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${i === currentImageIndex ? 'bg-white w-8' : 'bg-white/50 w-2'}`}
                  />
                ))}
              </div>
              <div className="absolute top-4 right-4 bg-black/30 backdrop-blur-sm text-white/80 text-xs px-3 py-1.5 rounded-full">
                {currentImageIndex + 1} / {pack.photos.length}
              </div>
            </>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
            <div className="max-w-5xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-display font-bold text-white leading-tight drop-shadow-lg">
                {pack.name}
              </h1>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-12 md:py-16">
          <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">

            {/* LEFT */}
            <div className="lg:col-span-2 space-y-12">

              <p className="text-dark-light text-base md:text-lg leading-relaxed">
                {pack.description}
              </p>

              <div className="w-full h-px bg-dark/10" />

              {pack.includedFeatures && pack.includedFeatures.length > 0 && (
                <div>
                  <p className="text-xs font-bold tracking-[0.25em] text-dark/50 uppercase mb-6">
                    What's included?
                  </p>
                  <ul className="space-y-3">
                    {pack.includedFeatures.map((feature, i) => (
                      <li key={i} className="flex items-start gap-4 text-sm md:text-base text-dark-light">
                        <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <FaCheck className="text-primary text-[8px]" />
                        </span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {includedServices.length > 0 && (
                <>
                  <div className="w-full h-px bg-dark/10" />
                  <div>
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FaStar className="text-primary text-xs" />
                      </div>
                      <div>
                        <p className="text-xs font-bold tracking-[0.25em] text-dark/50 uppercase">Included Services</p>
                        <p className="text-xs text-dark/40 mt-0.5">Everything below is already included in your package price</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {includedServices.map((service, i) => {
                        const Icon = getServiceIcon(service.name);
                        return (
                          <div key={service.id || i}
                            className="group flex items-center gap-4 p-4 bg-white rounded-2xl border border-dark/5 hover:border-primary/20 hover:shadow-md transition-all duration-300"
                            style={{ animation: 'fadeUp 0.4s ease-out both', animationDelay: `${i * 60}ms` }}
                          >
                            <div className="w-10 h-10 rounded-xl bg-primary/10 group-hover:bg-primary/15 flex items-center justify-center flex-shrink-0 transition-colors duration-300">
                              <Icon className="text-primary text-sm" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-dark truncate">{service.name}</p>
                              <p className="text-[11px] text-dark/40 mt-0.5">
                                {service.priceType === 'PER_NIGHT' ? 'Per night' : 'Fixed — included'}
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-sm font-bold text-primary">{formatPrice(service.price)}</p>
                              {service.priceType === 'PER_NIGHT' && <p className="text-[10px] text-dark/30">/night</p>}
                            </div>
                            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                              <FaCheck className="text-green-500 text-[8px]" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

           

            </div>

            {/* RIGHT — Booking card */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-24 bg-white rounded-2xl shadow-2xl overflow-hidden">

               {/* Card header — prix 7 nuits */}
<div className="bg-dark px-6 py-5">
  <p className="text-white/60 text-xs uppercase tracking-widest mb-1">7 nights from</p>
  {(() => {
    const entries = (pack.nightPrices || []).filter(np => np.nights === 7);
    const prices  = entries.map(np => Number(np.promoPrice)).filter(p => p > 0);
    const min     = prices.length > 0 ? Math.min(...prices) : null;
    return min ? (
      <p className="text-white text-2xl font-display font-bold">
        {formatPrice(min)}
        <span className="text-sm font-normal text-white/60"> / person / night</span>
      </p>
    ) : null;
  })()}
</div>

                <div className="p-6 space-y-5">

                  {/* Room type */}
                  <div>
                    <p className="text-xs font-bold tracking-widest text-dark/40 uppercase mb-3">Room type</p>
                    <div className="space-y-2">
                      {ROOM_TYPES.filter(rt => roomTypeHasPrices(rt.key)).map(({ key, label }) => {
                        const minPromo = getMinPrice(key);
                        const minRegular = getMinRegularPrice(key);
                        return (
                          <label key={key}
                            className={`flex items-center justify-between p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                              selectedRoomType === key
                                ? 'border-primary bg-primary/5'
                                : 'border-gray-100 hover:border-gray-200 bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                                selectedRoomType === key ? 'border-primary' : 'border-gray-300'
                              }`}>
                                {selectedRoomType === key && <div className="w-2 h-2 rounded-full bg-primary" />}
                              </div>
                              <span className="text-sm font-medium text-dark">{label}</span>
                            </div>
                            <div className="text-right">
                              {minRegular && minRegular > minPromo && (
                                <div className="text-[10px] text-dark/30 line-through">from {formatPrice(minRegular)}</div>
                              )}
                              <div className="text-xs font-bold text-primary">from {formatPrice(minPromo)}</div>
                            </div>
                            <input type="radio" className="sr-only" name="roomType" value={key}
                              checked={selectedRoomType === key}
                              onChange={() => { setSelectedRoomType(key); setSelectedNights(''); }}
                            />
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Nights */}
                  <div>
                    <p className="text-xs font-bold tracking-widest text-dark/40 uppercase mb-3">Number of nights</p>
                    <select
                      value={selectedNights}
                      onChange={e => setSelectedNights(e.target.value)}
                      className="w-full px-4 py-3.5 border-2 border-gray-100 bg-gray-50 rounded-xl focus:border-primary focus:bg-white focus:outline-none text-sm text-dark transition-colors"
                    >
                      <option value="">Choose duration...</option>
                      {availableNights.map(n => (
                        <option key={n} value={n}>{n} nights</option>
                      ))}
                    </select>
                  </div>

                  {/* Arrival date */}
                  <div>
                    <p className="text-xs font-bold tracking-widest text-dark/40 uppercase mb-3">Arrival date</p>
                    <input
                      type="date"
                      value={checkInDate}
                      onChange={e => setCheckInDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3.5 border-2 border-gray-100 bg-gray-50 rounded-xl focus:border-primary focus:bg-white focus:outline-none text-sm transition-colors"
                    />
                  </div>

                  {checkOutDate && (
                    <div className="flex items-center justify-between text-sm py-2 px-1">
                      <span className="text-dark/50">Departure</span>
                      <span className="font-medium text-dark">
                        {new Date(checkOutDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                  )}

                  {totalPrice !== null && (
                    <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-dark/50 mb-0.5">
                            {ROOM_TYPES.find(r => r.key === selectedRoomType)?.label} · {selectedNights} nights
                          </p>
                          <p className="text-xs text-dark/40">
                            {selectedRoomType === 'DORTOIR' ? 'Price per bed — multiply by number of beds' : 'Estimated total'}
                          </p>
                        </div>
                        <span className="text-2xl font-display font-bold text-primary">
                          {formatPrice(totalPrice)}
                        </span>
                      </div>
                      {selectedRoomType === 'DORTOIR' && (
                        <p className="text-[11px] text-primary/60 mt-2 pt-2 border-t border-primary/10">
                          ⚡ Final price will be calculated based on beds selected at next step
                        </p>
                      )}
                    </div>
                  )}

                  <button
                    onClick={handleBooking}
                    disabled={!selectedRoomType || !selectedNights || !checkInDate}
                    className="w-full bg-primary text-white py-4 rounded-xl text-sm font-bold hover:bg-primary-dark transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                  >
                    Confirm Reservation
                  </button>

                  <div className="space-y-2 pt-1">
                    <div className="flex items-center gap-2.5 text-xs text-dark/40">
                      <FaCheck className="text-green-500 flex-shrink-0" />
                      <span>Instant confirmation by email</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-dark/40">
                      <FaCheck className="text-green-500 flex-shrink-0" />
                      <span>Payment on arrival — no card required</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default PackDetailPage;