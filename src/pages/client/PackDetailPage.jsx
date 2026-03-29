import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaCheck, FaArrowLeft, FaBed, FaChevronLeft, FaChevronRight,
  FaMoon, FaShieldAlt, FaCreditCard, FaCalendarAlt, FaTag
} from 'react-icons/fa';
import Loader from '../../components/common/Loader';
import { packsAPI } from '../../services/api';
import { formatPrice } from '../../utils/priceFormatter';
import { bypassCloudinaryCache } from '../../utils/imageHelper';

const NIGHTS_OPTIONS = Array.from({ length: 8 }, (_, i) => i + 3);

const ROOM_TYPES = [
  { key: 'DORTOIR', label: 'Dormitory', priceField: 'priceDortoir', regularField: 'regularPriceDortoir' },
  { key: 'SINGLE',  label: 'Single',    priceField: 'priceSingle',  regularField: 'regularPriceSingle'  },
  { key: 'DOUBLE',  label: 'Double',    priceField: 'priceDouble',  regularField: 'regularPriceDouble'  },
];

const PackDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pack, setPack]                     = useState(null);
  const [loading, setLoading]               = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedRoomType, setSelectedRoomType]   = useState(null);
  const [selectedNights, setSelectedNights]       = useState('');
  const [checkInDate, setCheckInDate]             = useState('');

  useEffect(() => { fetchPack(); }, [id]);

  const fetchPack = async () => {
    try {
      const res = await packsAPI.getById(id);
      setPack(res.data.data);
    } catch {
      navigate('/packs');
    } finally {
      setLoading(false);
    }
  };

  const nextImage = () => pack?.photos &&
    setCurrentImageIndex(p => p === pack.photos.length - 1 ? 0 : p + 1);
  const prevImage = () => pack?.photos &&
    setCurrentImageIndex(p => p === 0 ? pack.photos.length - 1 : p - 1);

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
    ? (getPromoPrice() || 0) * parseInt(selectedNights) : null;

  const checkOutDate = checkInDate && selectedNights
    ? (() => {
        const d = new Date(checkInDate);
        d.setDate(d.getDate() + parseInt(selectedNights));
        return d.toISOString().split('T')[0];
      })() : null;

  const discount = getPromoPrice() && getRegularPrice()
    ? Math.round((1 - getPromoPrice() / getRegularPrice()) * 100) : null;

  const handleBooking = () => {
    if (!selectedRoomType) { alert('Please select a room type'); return; }
    if (!selectedNights)   { alert('Please select number of nights'); return; }
    if (!checkInDate)      { alert('Please select an arrival date'); return; }
    navigate('/booking', {
      state: {
        packId: pack.id, packName: pack.name,
        roomType: selectedRoomType,
        checkIn: checkInDate, checkOut: checkOutDate,
        nights: parseInt(selectedNights),
        pricePerNight: getPromoPrice(),
        totalPrice, isPack: true
      }
    });
  };

  if (loading) return <Loader />;
  if (!pack) return null;

  return (
    <div className="min-h-screen bg-[#f5f0eb]">

      {/* ── Sticky top bar ── */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#f5f0eb]/95 backdrop-blur-sm border-b border-dark/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate('/packs')}
            className="flex items-center gap-2 text-sm font-medium text-dark/60 hover:text-dark transition-colors group"
          >
            <span className="w-7 h-7 rounded-full border border-dark/20 group-hover:border-dark flex items-center justify-center transition-colors">
              <FaArrowLeft className="text-[10px]" />
            </span>
            All Packages
          </button>
          <span className="text-sm font-bold text-dark hidden sm:block truncate max-w-xs">{pack.name}</span>
          <button
            onClick={handleBooking}
            disabled={!selectedRoomType || !selectedNights || !checkInDate}
            className="hidden sm:flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-primary-dark transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Book Now
          </button>
        </div>
      </div>

      {/* ── Hero image fullwidth ── */}
      <div className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden group">
        {pack.photos && pack.photos.length > 0 ? (
          <img
            src={bypassCloudinaryCache(pack.photos[currentImageIndex])}
            alt={pack.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/10 to-dark/10 flex items-center justify-center">
            <span className="text-9xl opacity-10">🏄</span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Image nav */}
        {pack.photos && pack.photos.length > 1 && (
          <>
            <button onClick={prevImage}
              className="absolute left-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all">
              <FaChevronLeft className="text-sm" />
            </button>
            <button onClick={nextImage}
              className="absolute right-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all">
              <FaChevronRight className="text-sm" />
            </button>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {pack.photos.map((_, i) => (
                <button key={i} onClick={() => setCurrentImageIndex(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === currentImageIndex ? 'bg-white w-8' : 'bg-white/40 w-2'}`}
                />
              ))}
            </div>
            <div className="absolute top-20 right-5 bg-black/30 backdrop-blur-sm text-white/80 text-xs px-3 py-1.5 rounded-full">
              {currentImageIndex + 1} / {pack.photos.length}
            </div>
          </>
        )}

        {/* Pack name over image */}
        <div className="absolute bottom-0 left-0 right-0 px-8 pb-10 md:px-16">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-display font-bold text-white leading-tight drop-shadow-xl">
              {pack.name}
            </h1>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-14 md:py-20">
        <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">

          {/* ── LEFT (3/5): Info ── */}
          <div className="lg:col-span-3 space-y-14">

            {/* Description */}
            <p className="text-dark-light text-lg leading-relaxed">
              {pack.description}
            </p>

            <div className="w-full h-px bg-dark/10" />

            {/* What's included */}
            {pack.includedFeatures && pack.includedFeatures.length > 0 && (
              <div>
                <p className="text-xs font-bold tracking-[0.25em] text-dark/40 uppercase mb-7">
                  What's included?
                </p>
                <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
                  {pack.includedFeatures.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-dark-light">
                      <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <FaCheck className="text-primary text-[8px]" />
                      </span>
                      <span className="leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="w-full h-px bg-dark/10" />

            {/* Prices per room */}
            <div>
              <p className="text-xs font-bold tracking-[0.25em] text-dark/40 uppercase mb-7">
                Prices per night
              </p>
              <div className="space-y-0">
                {ROOM_TYPES.map(({ key, label, priceField, regularField }) => pack[priceField] && (
                  <div key={key} className="flex items-center justify-between py-5 border-b border-dark/10 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center">
                        <FaBed className="text-primary text-xs" />
                      </div>
                      <span className="font-medium text-dark">{label}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      {pack[regularField] && pack[regularField] > pack[priceField] && (
                        <span className="text-sm text-dark/30 line-through hidden sm:block">
                          {formatPrice(pack[regularField])}
                        </span>
                      )}
                      <div className="text-right">
                        <span className="text-xl font-display font-bold text-primary">
                          {formatPrice(pack[priceField])}
                        </span>
                        <span className="text-xs text-dark/40 ml-1">/night</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ── RIGHT (2/5): Booking card ── */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-24 rounded-2xl overflow-hidden shadow-2xl bg-white">

              {/* Card header — dark */}
              <div className="bg-dark px-6 py-6">
                <p className="text-white/50 text-xs uppercase tracking-widest mb-1">Starting from</p>
                {(() => {
                  const prices = [pack.priceDortoir, pack.priceSingle, pack.priceDouble].filter(Boolean);
                  const min = prices.length ? Math.min(...prices) : null;
                  return min ? (
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-display font-bold text-white">
                        {formatPrice(min)}
                      </span>
                      <span className="text-white/50 text-sm mb-0.5">/ person / night</span>
                    </div>
                  ) : null;
                })()}
              </div>

              <div className="p-6 space-y-6">

                {/* 1. Room type */}
                <div>
                  <p className="text-[10px] font-bold tracking-[0.2em] text-dark/40 uppercase mb-3 flex items-center gap-2">
                    <FaBed className="text-primary" /> Room type
                  </p>
                  <div className="space-y-2">
                    {ROOM_TYPES.map(({ key, label, priceField, regularField }) => pack[priceField] && (
                      <button
                        key={key}
                        onClick={() => setSelectedRoomType(key)}
                        className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border-2 transition-all duration-200 text-left ${
                          selectedRoomType === key
                            ? 'border-primary bg-primary/5 shadow-sm'
                            : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                            selectedRoomType === key ? 'border-primary' : 'border-gray-300'
                          }`}>
                            {selectedRoomType === key && (
                              <div className="w-2 h-2 rounded-full bg-primary" />
                            )}
                          </div>
                          <span className="text-sm font-semibold text-dark">{label}</span>
                        </div>
                        <div className="text-right">
                          {pack[regularField] && pack[regularField] > pack[priceField] && (
                            <div className="text-[10px] text-dark/30 line-through">{formatPrice(pack[regularField])}</div>
                          )}
                          <span className="text-sm font-bold text-primary">{formatPrice(pack[priceField])}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Nights */}
                <div>
                  <p className="text-[10px] font-bold tracking-[0.2em] text-dark/40 uppercase mb-3 flex items-center gap-2">
                    <FaMoon className="text-primary" /> Number of nights
                  </p>
                  <select
                    value={selectedNights}
                    onChange={e => setSelectedNights(e.target.value)}
                    className="w-full px-4 py-3.5 border-2 border-gray-100 bg-gray-50 rounded-xl focus:border-primary focus:bg-white focus:outline-none text-sm text-dark transition-colors appearance-none"
                  >
                    <option value="">Choose duration...</option>
                    {NIGHTS_OPTIONS.map(n => (
                      <option key={n} value={n}>{n} nights</option>
                    ))}
                  </select>
                </div>

                {/* 3. Arrival date */}
                <div>
                  <p className="text-[10px] font-bold tracking-[0.2em] text-dark/40 uppercase mb-3 flex items-center gap-2">
                    <FaCalendarAlt className="text-primary" /> Arrival date
                  </p>
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={e => setCheckInDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3.5 border-2 border-gray-100 bg-gray-50 rounded-xl focus:border-primary focus:bg-white focus:outline-none text-sm text-dark transition-colors"
                  />
                </div>

                {/* Departure auto */}
                {checkOutDate && (
                  <div className="flex items-center justify-between text-sm px-1 -mt-2">
                    <span className="text-dark/40 text-xs">Departure</span>
                    <span className="font-semibold text-dark text-xs">
                      {new Date(checkOutDate).toLocaleDateString('en-US', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </span>
                  </div>
                )}

                {/* 4. Total */}
                {totalPrice !== null && (
                  <div className="bg-primary/5 border border-primary/15 rounded-xl px-5 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-dark/50 mb-0.5">
                          {ROOM_TYPES.find(r => r.key === selectedRoomType)?.label} · {selectedNights} nights
                        </p>
                        {discount && discount > 0 && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                            <FaTag className="text-[8px]" /> -{discount}% saved
                          </span>
                        )}
                      </div>
                      <span className="text-2xl font-display font-bold text-primary">
                        {formatPrice(totalPrice)}
                      </span>
                    </div>
                  </div>
                )}

                {/* CTA */}
                <button
                  onClick={handleBooking}
                  disabled={!selectedRoomType || !selectedNights || !checkInDate}
                  className="w-full bg-primary text-white py-4 rounded-xl font-bold text-sm hover:bg-primary-dark transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  Confirm Reservation
                </button>

                {/* Trust */}
                <div className="space-y-2 pt-1 border-t border-gray-100">
                  <div className="flex items-center gap-2.5 text-xs text-dark/40 pt-3">
                    <FaShieldAlt className="text-green-500 flex-shrink-0" />
                    Instant confirmation by email
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-dark/40">
                    <FaCreditCard className="text-green-500 flex-shrink-0" />
                    Payment on arrival — no card required
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PackDetailPage;