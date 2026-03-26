import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaCheck, FaBed, FaCar, FaUtensils, FaWater } from 'react-icons/fa';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { packsAPI } from '../../services/api';
import { bypassCloudinaryCache } from '../../utils/imageHelper';
import { formatPrice } from '../../utils/priceFormatter';

// Icône automatique selon le texte de la feature
const getFeatureIcon = (text) => {
  const t = text.toLowerCase();
  if (t.includes('accommodation') || t.includes('night') || t.includes('room')) return <FaBed className="text-primary text-xs flex-shrink-0 mt-0.5" />;
  if (t.includes('transfer') || t.includes('airport') || t.includes('transport')) return <FaCar className="text-primary text-xs flex-shrink-0 mt-0.5" />;
  if (t.includes('meal') || t.includes('breakfast') || t.includes('dinner') || t.includes('food')) return <FaUtensils className="text-primary text-xs flex-shrink-0 mt-0.5" />;
  return <FaWater className="text-primary text-xs flex-shrink-0 mt-0.5" />;
};

const getFromPrice = (pack) => {
  const prices = [pack.dortoirPricePerNight, pack.singlePricePerNight, pack.doublePricePerNight].filter(Boolean);
  return prices.length > 0 ? Math.min(...prices) : null;
};

const PacksPage = () => {
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { fetchPacks(); }, []);

  const fetchPacks = async () => {
    try {
      const response = await packsAPI.getAll();
      setPacks(response.data.data.filter(p => p.isActive !== false));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f0eb]">

      {/* Header simple */}
      <div className="pt-24 pb-10 text-center px-4">
        <h1 className="text-4xl sm:text-5xl font-display font-bold text-dark mb-3">
          Packages
        </h1>
        <p className="text-dark-light text-sm sm:text-base">
          Find the perfect surf experience for you.
        </p>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        {loading ? (
          <Loader />
        ) : packs.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-dark-light text-lg">No packages available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packs.map((pack) => (
              <div
                key={pack.id}
                className="bg-[#ede8e2] rounded-sm overflow-hidden flex flex-col hover:shadow-lg transition-shadow duration-300"
              >
                {/* Image */}
                <div className="h-52 sm:h-60 overflow-hidden bg-accent/20 flex-shrink-0">
                  {pack.photos && pack.photos.length > 0 ? (
                    <img
                      src={bypassCloudinaryCache(pack.photos[0])}
                      alt={pack.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FaWater className="text-5xl text-white/30" />
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className="p-5 sm:p-6 flex flex-col flex-1">

                  {/* Title */}
                  <h3 className="text-sm font-bold tracking-widest text-dark uppercase mb-3">
                    {pack.name}
                  </h3>

                  {/* Description */}
                  <p className="text-dark-light text-xs sm:text-sm leading-relaxed mb-5 line-clamp-3">
                    {pack.description}
                  </p>

                  {/* Features */}
                  {pack.features && pack.features.length > 0 && (
                    <ul className="space-y-2 mb-6 flex-1">
                      {pack.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-dark-light">
                          {getFeatureIcon(feature)}
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Price hint */}
                  {getFromPrice(pack) && (
                    <p className="text-xs text-dark/40 mb-3 text-center">
                      from <span className="text-primary font-semibold">{formatPrice(getFromPrice(pack))}</span> / night · 3–10 nights
                    </p>
                  )}

                  {/* Book Now button */}
                  <Link to={`/packs/${pack.id}`} className="mt-auto">
                    <Button variant="primary" className="w-full rounded-sm font-semibold tracking-wide">
                      Book Now
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PacksPage;