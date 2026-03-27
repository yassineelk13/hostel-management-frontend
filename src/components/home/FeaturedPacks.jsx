import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCheck, FaArrowRight } from 'react-icons/fa';
import Loader from '../common/Loader';
import Button from '../common/Button';
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

  // ✅ CORRIGÉ : priceDortoir / priceSingle / priceDouble
  const getFromPrice = (pack) => {
    const prices = [
      pack.priceDortoir,
      pack.priceSingle,
      pack.priceDouble,
    ].filter(Boolean);
    return prices.length > 0 ? Math.min(...prices) : null;
  };

  if (loading) return <Loader />;
  if (packs.length === 0) return null;

  return (
    <section className="py-20 md:py-28 bg-[#f5f0eb]">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-dark mb-3">
            Our Packages
          </h2>
          <p className="text-dark-light text-base">
            Find the perfect surf experience for you.
          </p>
          <div className="w-16 h-px bg-dark/20 mx-auto mt-6" />
        </div>

        {/* Pack List */}
        <div className="space-y-0">
          {packs.map((pack, index) => (
            <div key={pack.id}>
              <div className="flex flex-col md:flex-row gap-8 md:gap-16 py-14">

                {/* Image */}
                <div className="w-full md:w-[380px] lg:w-[420px] flex-shrink-0">
                  <div className="aspect-[4/3] md:aspect-[3/4] overflow-hidden rounded-sm bg-accent/20">
                    {pack.photos && pack.photos.length > 0 ? (
                      <img
                        src={bypassCloudinaryCache(pack.photos[0])}
                        alt={pack.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-6xl opacity-20">🏄</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col justify-center py-2">

                  <h3 className="text-3xl md:text-4xl font-display font-bold text-dark mb-3">
                    {pack.name}
                  </h3>
                  <p className="text-dark-light text-sm md:text-base leading-relaxed mb-7 max-w-lg">
                    {pack.description}
                  </p>

                  {/* ✅ CORRIGÉ : includedFeatures */}
                  {pack.includedFeatures && pack.includedFeatures.length > 0 && (
                    <div className="mb-8">
                      <p className="text-xs font-bold tracking-widest text-dark/50 uppercase mb-4">
                        What's included?
                      </p>
                      <ul className="space-y-2">
                        {pack.includedFeatures.map((feature, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-dark-light">
                            <FaCheck className="text-primary mt-0.5 flex-shrink-0 text-xs" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Price + Buttons */}
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mt-auto pt-6 border-t border-dark/10">

                    <div>
                      <p className="text-xs text-dark/40 mb-1 uppercase tracking-widest">
                        3 – 10 nights
                      </p>
                      {getFromPrice(pack) && (
                        <p className="text-dark-light text-sm">
                          from{' '}
                          <span className="text-3xl font-bold text-primary font-display">
                            {formatPrice(getFromPrice(pack))}
                          </span>
                          {' '}/ night
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      <Link to={`/packs/${pack.id}`}>
                        <Button variant="primary" className="shadow-md hover:shadow-lg px-6">
                          Book Now
                        </Button>
                      </Link>
                      <Link
                        to={`/packs/${pack.id}`}
                        className="flex items-center gap-2 text-sm font-semibold text-dark hover:text-primary transition-colors group"
                      >
                        More Info
                        <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>

                </div>
              </div>

              {index < packs.length - 1 && (
                <div className="w-full h-px bg-dark/10" />
              )}
            </div>
          ))}
        </div>

        {totalPacks > 3 && (
          <div className="text-center mt-16">
            <Link to="/packs">
              <Button variant="outline" size="lg" className="group">
                Discover all packages ({totalPacks})
                <FaArrowRight className="group-hover:translate-x-1 transition-transform text-xs" />
              </Button>
            </Link>
          </div>
        )}

      </div>
    </section>
  );
};

export default FeaturedPacks;