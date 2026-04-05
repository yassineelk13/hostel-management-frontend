import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaCheck, FaArrowRight } from 'react-icons/fa';
import Loader from '../../components/common/Loader';
import { packsAPI } from '../../services/api';
import { formatPrice } from '../../utils/priceFormatter';
import { bypassCloudinaryCache } from '../../utils/imageHelper';

const PacksPage = () => {
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { fetchPacks(); }, []);

  const fetchPacks = async () => {
    try {
      const response = await packsAPI.getAll();
      const activePacks = response.data.data.filter(p => p.isActive !== false);
      setPacks(activePacks);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

 // ✅ NOUVEAU — utilise les champs minPrice* envoyés par le backend
const getFromPrice = (pack) => {
  const prices = [pack.minPriceDortoir, pack.minPriceSingle, pack.minPriceDouble].filter(Boolean);
  return prices.length > 0 ? Math.min(...prices) : null;
};

const getMinRegularPrice = (pack) => {
  if (!pack.nightPrices?.length) return null;
  const prices = pack.nightPrices
    .filter(np => np.regularPrice)
    .map(np => Number(np.regularPrice));
  return prices.length > 0 ? Math.min(...prices) : null;
};

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-[#f5f0eb]">

      {/* ── Hero Header ── */}
      <div className="pt-28 pb-16 px-4 sm:px-8 max-w-5xl mx-auto text-center">
        <p className="text-xs font-bold tracking-[0.3em] text-primary uppercase mb-4">
          Shams House · Morocco
        </p>
        <h1 className="text-5xl md:text-6xl font-display font-bold text-dark mb-5 leading-tight">
          Our Packages
        </h1>
        <p className="text-dark-light text-lg max-w-xl mx-auto leading-relaxed">
          Everything you need for the perfect surf getaway — accommodation, coaching & more.
        </p>
        <div className="w-16 h-px bg-dark/20 mx-auto mt-8" />
      </div>

      {/* ── Pack List ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8 pb-28">
        {packs.length === 0 ? (
          <div className="text-center py-20 text-dark-light">
            No packages available at the moment.
          </div>
        ) : (
          <div className="space-y-0">
            {packs.map((pack, index) => {
              const fromPrice = getFromPrice(pack);
              const regularPrice = getMinRegularPrice(pack);

              return (
                <div key={pack.id}>
                  {/* ── Pack Row ── */}
                  <div className="grid md:grid-cols-2 gap-0 py-16 md:py-20">

                    {/* Image — alternating left/right */}
                    <div className={`relative overflow-hidden ${index % 2 === 1 ? 'md:order-2' : ''}`}>
                      <div className="aspect-[3/4] md:aspect-auto md:h-full min-h-[420px] overflow-hidden bg-dark/10">
                        {pack.photos && pack.photos.length > 0 ? (
                          <img
                            src={bypassCloudinaryCache(pack.photos[0])}
                            alt={pack.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                            <span className="text-8xl opacity-20">🏄</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className={`flex flex-col justify-center px-0 md:px-12 lg:px-16 py-8 md:py-0 ${index % 2 === 1 ? 'md:order-1' : ''}`}>

                      {/* Pack name */}
                      <h2 className="text-3xl md:text-4xl font-display font-bold text-dark mb-4 leading-tight">
                        {pack.name}
                      </h2>

                      {/* Description */}
                      <p className="text-dark-light text-sm md:text-base leading-relaxed mb-8">
                        {pack.description}
                      </p>

                      {/* What's included */}
                      {pack.includedFeatures && pack.includedFeatures.length > 0 && (
                        <div className="mb-8">
                          <p className="text-xs font-bold tracking-[0.2em] text-dark/50 uppercase mb-4">
                            What's included?
                          </p>
                          <ul className="space-y-2.5">
                            {pack.includedFeatures.map((feature, i) => (
                              <li key={i} className="flex items-start gap-3 text-sm text-dark-light">
                                <FaCheck className="text-primary mt-0.5 flex-shrink-0 text-[10px]" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Price */}
                      <div className="mb-8 pb-8 border-b border-dark/10">
                        <p className="text-xs text-dark/40 mb-1 uppercase tracking-widest">
                          3 – 10 nights
                        </p>
                        {fromPrice && (
                          <div className="flex items-baseline gap-2">
                            {regularPrice && regularPrice > fromPrice && (
                              <span className="text-dark/40 text-sm line-through">
                                from {formatPrice(regularPrice)}
                              </span>
                            )}
                            <p className="text-dark/60 text-base">
                              from{' '}
                              <span className="text-4xl font-display font-bold text-primary">
                                {formatPrice(fromPrice)}
                              </span>
                              {' '}<span className="text-sm text-dark/50">/ person / night</span>
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Buttons — exactement comme la photo */}
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => navigate(`/packs/${pack.id}`)}
                          className="bg-primary text-white px-8 py-3.5 rounded-full text-sm font-bold hover:bg-primary-dark transition-colors shadow-md hover:shadow-lg"
                        >
                          Book Now
                        </button>
                        <Link
                          to={`/packs/${pack.id}`}
                          className="flex items-center gap-2.5 text-sm font-semibold text-dark hover:text-primary transition-colors group border-2 border-dark/20 hover:border-primary px-6 py-3 rounded-full"
                        >
                          More Info
                          <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>

                    </div>
                  </div>

                  {/* Separator */}
                  {index < packs.length - 1 && (
                    <div className="w-full h-px bg-dark/10" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PacksPage;