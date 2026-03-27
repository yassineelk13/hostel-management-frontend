import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaCheck, FaArrowLeft, FaBed, FaChevronLeft, FaChevronRight, FaMoon } from 'react-icons/fa';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { packsAPI } from '../../services/api';
import { formatPrice } from '../../utils/priceFormatter';
import { bypassCloudinaryCache } from '../../utils/imageHelper';

// Dropdown 3 → 10 nuits
const NIGHTS_OPTIONS = Array.from({ length: 8 }, (_, i) => i + 3);

const ROOM_TYPES = [
  { key: 'DORTOIR', label: 'Dormitory', priceField: 'priceDortoir', regularField: 'regularPriceDortoir' },
  { key: 'SINGLE',  label: 'Single',    priceField: 'priceSingle',  regularField: 'regularPriceSingle'  },
  { key: 'DOUBLE',  label: 'Double',    priceField: 'priceDouble',  regularField: 'regularPriceDouble'  },
];

const PackDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pack, setPack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // ✅ Booking state
  const [selectedRoomType, setSelectedRoomType] = useState(null);
  const [selectedNights, setSelectedNights] = useState('');
  const [checkInDate, setCheckInDate] = useState('');

  useEffect(() => { fetchPack(); }, [id]);

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

  // ── Image navigation ──
  const nextImage = () => {
    if (!pack?.photos) return;
    setCurrentImageIndex(prev => prev === pack.photos.length - 1 ? 0 : prev + 1);
  };
  const prevImage = () => {
    if (!pack?.photos) return;
    setCurrentImageIndex(prev => prev === 0 ? pack.photos.length - 1 : prev - 1);
  };

  // ── Calculs ──
  const getPromoPrice = () => {
    if (!selectedRoomType || !pack) return null;
    const rt = ROOM_TYPES.find(r => r.key === selectedRoomType);
    return rt ? pack[rt.priceField] : null;
  };

  const getRegularPrice = () => {
    if (!selectedRoomType || !pack) return null;
    const rt = ROOM_TYPES.find(r => r.key === selectedRoomType);
    return rt ? pack[rt.regularField] : null;
  };

  const totalPrice = selectedRoomType && selectedNights
    ? (getPromoPrice() || 0) * parseInt(selectedNights)
    : null;

  // ── Check-out auto-calculé ──
  const checkOutDate = checkInDate && selectedNights
    ? (() => {
        const d = new Date(checkInDate);
        d.setDate(d.getDate() + parseInt(selectedNights));
        return d.toISOString().split('T')[0];
      })()
    : null;

  // ── Booking ──
  const handleBooking = () => {
    if (!selectedRoomType) { alert('Please select a room type'); return; }
    if (!selectedNights)   { alert('Please select number of nights'); return; }
    if (!checkInDate)      { alert('Please select an arrival date'); return; }

    navigate('/booking', {
      state: {
        packId: pack.id,
        packName: pack.name,
        roomType: selectedRoomType,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        nights: parseInt(selectedNights),
        pricePerNight: getPromoPrice(),
        totalPrice: totalPrice,
        isPack: true
      }
    });
  };

  if (loading) return <Loader />;

  if (!pack) {
    return (
      <div className="min-h-screen bg-[#f5f0eb] flex items-center justify-center px-4">
        <Card className="p-10 text-center">
          <p className="text-dark-light mb-4">Package not found</p>
          <Button onClick={() => navigate('/packs')}>Back to Packages</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f0eb]">

      {/* ── Header ── */}
      <div className="pt-24 pb-10 px-4 sm:px-8 max-w-6xl mx-auto">
        <button
          onClick={() => navigate('/packs')}
          className="flex items-center gap-2 text-dark-light hover:text-dark transition-colors text-sm mb-6"
        >
          <FaArrowLeft className="text-xs" />
          Back to Packages
        </button>
        <h1 className="text-4xl sm:text-5xl font-display font-bold text-dark">{pack.name}</h1>
      </div>

      {/* ── Body ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 pb-20">
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">

          {/* ── LEFT : Pack info ── */}
          <div className="lg:col-span-2 space-y-8">

            {/* Galerie photos */}
            {pack.photos && pack.photos.length > 0 && (
              <div className="relative aspect-[16/9] rounded-sm overflow-hidden bg-accent/20 group">
                <img
                  src={bypassCloudinaryCache(pack.photos[currentImageIndex])}
                  alt={pack.name}
                  className="w-full h-full object-cover transition-opacity duration-500"
                />
                {pack.photos.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FaChevronLeft />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FaChevronRight />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {pack.photos.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentImageIndex(i)}
                          className={`h-2 rounded-full transition-all ${
                            i === currentImageIndex ? 'bg-white w-6' : 'bg-white/50 w-2'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="absolute top-3 right-3 bg-black/50 text-white px-2.5 py-1 rounded-full text-xs">
                      {currentImageIndex + 1} / {pack.photos.length}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Description */}
            <div>
              <h2 className="text-xl font-bold text-dark mb-3">About this Package</h2>
              <p className="text-dark-light leading-relaxed text-sm sm:text-base">{pack.description}</p>
            </div>

            {/* ✅ Features (strings) */}
            {pack.includedFeatures && pack.includedFeatures.length > 0 && (
              <div>
                <h3 className="text-xs font-bold tracking-widest text-dark/50 uppercase mb-4">
                  What's included?
                </h3>
                <ul className="space-y-3">
                  {pack.includedFeatures.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-dark-light">
                      <FaCheck className="text-primary mt-0.5 flex-shrink-0 text-xs" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ✅ Prix par room type (informatif) */}
            <div>
              <h3 className="text-xs font-bold tracking-widest text-dark/50 uppercase mb-4">
                Prices per night
              </h3>
              <div className="space-y-2">
                {ROOM_TYPES.map(({ key, label, priceField, regularField }) => pack[priceField] && (
                  <div key={key} className="flex items-center justify-between py-2 border-b border-dark/10 last:border-0">
                    <div className="flex items-center gap-2">
                      <FaBed className="text-primary/50 text-xs" />
                      <span className="text-sm text-dark">{label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {pack[regularField] && (
                        <span className="text-xs text-dark-light line-through opacity-60">
                          {formatPrice(pack[regularField])}/night
                        </span>
                      )}
                      <span className="text-sm font-bold text-primary">
                        {formatPrice(pack[priceField])}/night
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ── RIGHT : Booking form ── */}
          <div className="lg:col-span-1">
            <Card className="p-5 sm:p-6 lg:sticky lg:top-24 border border-dark/10 shadow-xl bg-white">

              <h3 className="text-base font-bold text-dark mb-5 pb-3 border-b border-dark/10">
                Book this Package
              </h3>

              {/* Section 1 : Room type */}
              <div className="mb-5">
                <p className="text-xs font-bold tracking-widest text-dark/50 uppercase mb-3 flex items-center gap-2">
                  <FaBed className="text-primary" /> Room type
                </p>
                <div className="space-y-2">
                  {ROOM_TYPES.map(({ key, label, priceField, regularField }) => pack[priceField] && (
                    <label
                      key={key}
                      className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedRoomType === key
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-primary/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="roomType"
                          value={key}
                          checked={selectedRoomType === key}
                          onChange={() => setSelectedRoomType(key)}
                          className="accent-primary"
                        />
                        <span className="text-sm font-medium text-dark">{label}</span>
                      </div>
                      <div className="text-right">
                        {pack[regularField] && (
                          <div className="text-[10px] text-dark-light line-through opacity-60">
                            {formatPrice(pack[regularField])}/night
                          </div>
                        )}
                        <div className="text-sm font-bold text-primary">
                          {formatPrice(pack[priceField])}/night
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Section 2 : Nombre de nuits */}
              <div className="mb-5">
                <p className="text-xs font-bold tracking-widest text-dark/50 uppercase mb-3 flex items-center gap-2">
                  <FaMoon className="text-primary" /> Number of nights
                </p>
                <select
                  value={selectedNights}
                  onChange={e => setSelectedNights(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none text-sm text-dark bg-white"
                >
                  <option value="">Select...</option>
                  {NIGHTS_OPTIONS.map(n => (
                    <option key={n} value={n}>{n} night{n > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>

              {/* Section 3 : Dates */}
              <div className="mb-5 space-y-3">
                <div>
                  <label className="block text-xs font-bold tracking-widest text-dark/50 uppercase mb-2">
                    📅 Arrival date
                  </label>
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={e => setCheckInDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none text-sm"
                  />
                </div>

                {checkOutDate && (
                  <div>
                    <label className="block text-xs font-bold tracking-widest text-dark/50 uppercase mb-2">
                      📅 Departure (auto)
                    </label>
                    <div className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl bg-gray-50 text-sm text-dark-light">
                      {new Date(checkOutDate).toLocaleDateString('en-US', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Section 4 : Total estimé */}
              {totalPrice !== null && (
                <div className="mb-5 p-4 bg-primary/5 border-2 border-primary/20 rounded-xl">
                  <p className="text-xs font-bold tracking-widest text-dark/50 uppercase mb-2">
                    💰 Estimated total
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-dark-light">
                      {ROOM_TYPES.find(r => r.key === selectedRoomType)?.label} × {selectedNights} nights
                    </span>
                    <span className="text-2xl font-bold text-primary">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                </div>
              )}

              {/* Button */}
              <Button
                onClick={handleBooking}
                className="w-full shadow-lg hover:shadow-xl"
                disabled={!selectedRoomType || !selectedNights || !checkInDate}
              >
                Confirm Reservation
              </Button>

              {/* Trust signals */}
              <div className="mt-4 space-y-1.5 text-xs text-dark-light text-center">
                <p className="flex items-center justify-center gap-2">
                  <FaCheck className="text-green-500 flex-shrink-0" />
                  Instant confirmation by email
                </p>
                <p className="flex items-center justify-center gap-2">
                  <FaCheck className="text-green-500 flex-shrink-0" />
                  Payment on arrival
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