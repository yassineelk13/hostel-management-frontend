import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCheck, FaArrowRight, FaBed } from 'react-icons/fa';
import Loader from '../common/Loader';
import { packsAPI } from '../../services/api';
import { formatPrice } from '../../utils/priceFormatter';
import { bypassCloudinaryCache } from '../../utils/imageHelper';

const FeaturedPacks = () => {
  const [packs, setPacks] = useState([]);
  const [totalPacks, setTotalPacks] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchPacks(); }, []);

  const fetchPacks = async () => {
    try {
      const response = await packsAPI.getAll();
      const activePacks = response.data.data.filter(p => p.isActive !== false);
      setTotalPacks(activePacks.length);
      setPacks(activePacks.slice(0, 3));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFromPrice = (pack) => {
    const prices = [pack.priceDortoir, pack.priceSingle, pack.priceDouble].filter(Boolean);
    return prices.length > 0 ? Math.min(...prices) : null;
  };

  const getRegularPrice = (pack) => {
    const prices = [
      pack.regularPriceDortoir,
      pack.regularPriceSingle,
      pack.regularPriceDouble
    ].filter(Boolean);
    return prices.length > 0 ? Math.min(...prices) : null;
  };

  if (loading) return <Loader />;
  if (packs.length === 0) return null;

  return (
    <section className="py-20 md:py-28 bg-[#f5f0eb]">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">

        {/* ── Header ── */}
        <div className="text-center mb-14">
          <p className="text-xs font-bold tracking-[0.3em] text-primary uppercase mb-3">
            Surf Packages
          </p>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-dark mb-4">
            Our Packages
          </h2>
          <p className="text-dark-light text-base max-w-md mx-auto">
            Everything you need for the perfect surf getaway — accommodation, lessons & more.
          </p>
        </div>

        {/* ── Cards Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {packs.map((pack, index) => {
            const fromPrice = getFromPrice(pack);
            const regularPrice = getRegularPrice(pack);
            const discount = fromPrice && regularPrice
              ? Math.round((1 - fromPrice / regularPrice) * 100)
              : null;

            return (
              <div
                key={pack.id}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col"
                style={{
                  animation: 'fadeUp 0.5s ease-out both',
                  animationDelay: `${index * 120}ms`
                }}
              >
                {/* ── Image ── */}
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 flex-shrink-0">
                  {pack.photos && pack.photos.length > 0 ? (
                    <img
                      src={bypassCloudinaryCache(pack.photos[0])}
                      alt={pack.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/20">
                      <span className="text-6xl opacity-30">🏄</span>
                    </div>
                  )}

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                  {/* Discount badge */}
                  {discount && discount > 0 && (
                    <div className="absolute top-4 left-4 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                      -{discount}% OFF
                    </div>
                  )}

                  {/* Price badge on image */}
                  {fromPrice && (
                    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                      <div>
                        {regularPrice && regularPrice > fromPrice && (
                          <p className="text-white/70 text-xs line-through mb-0.5">
                            from {formatPrice(regularPrice)}/night
                          </p>
                        )}
                        <p className="text-white font-bold text-lg leading-tight">
                          from <span className="text-2xl font-display">{formatPrice(fromPrice)}</span>
                          <span className="text-sm font-normal">/night</span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Content ── */}
                <div className="flex flex-col flex-1 p-6">

                  {/* Room types pills */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {pack.priceDortoir && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-full">
                        <FaBed className="text-[8px]" /> Dorm
                      </span>
                    )}
                    {pack.priceSingle && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full">
                        <FaBed className="text-[8px]" /> Single
                      </span>
                    )}
                    {pack.priceDouble && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-full">
                        <FaBed className="text-[8px]" /> Double
                      </span>
                    )}
                  </div>

                  {/* Name */}
                  <h3 className="text-xl font-display font-bold text-dark mb-2 line-clamp-1 group-hover:text-primary transition-colors duration-300">
                    {pack.name}
                  </h3>

                  {/* Description */}
                  <p className="text-dark-light text-sm leading-relaxed line-clamp-2 mb-5">
                    {pack.description}
                  </p>

                  {/* Features — top 3 only */}
                  {pack.includedFeatures && pack.includedFeatures.length > 0 && (
                    <ul className="space-y-2 mb-6">
                      {pack.includedFeatures.slice(0, 3).map((feature, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs text-dark-light">
                          <span className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <FaCheck className="text-primary text-[7px]" />
                          </span>
                          <span className="line-clamp-1">{feature}</span>
                        </li>
                      ))}
                      {pack.includedFeatures.length > 3 && (
                        <li className="text-xs text-dark/40 pl-6.5">
                          +{pack.includedFeatures.length - 3} more included
                        </li>
                      )}
                    </ul>
                  )}

                  {/* ── CTA ── */}
                  <div className="mt-auto pt-5 border-t border-gray-100">
                    <Link
                      to={`/packs/${pack.id}`}
                      className="flex items-center justify-between w-full group/btn"
                    >
                      <span className="text-sm font-bold text-dark group-hover/btn:text-primary transition-colors">
                        View Package
                      </span>
                      <span className="w-9 h-9 rounded-full bg-primary/10 group-hover/btn:bg-primary flex items-center justify-center transition-all duration-300">
                        <FaArrowRight className="text-primary group-hover/btn:text-white text-xs transition-colors" />
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── See all button ── */}
        {totalPacks > 3 && (
          <div className="text-center mt-14">
            <Link
              to="/packs"
              className="inline-flex items-center gap-3 text-sm font-bold text-dark hover:text-primary transition-colors group"
            >
              <span>See all packages ({totalPacks})</span>
              <span className="w-8 h-8 rounded-full border-2 border-dark/20 group-hover:border-primary flex items-center justify-center transition-colors">
                <FaArrowRight className="text-xs group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>
          </div>
        )}

      </div>

      <style jsx>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
};

export default FeaturedPacks;