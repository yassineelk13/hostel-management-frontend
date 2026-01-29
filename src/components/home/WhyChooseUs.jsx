import { FaWater, FaHeart, FaSun, FaUsers } from 'react-icons/fa';
import Card from '../common/Card';


const WhyChooseUs = () => {
  const features = [
    {
      icon: FaWater,
      title: 'Surf de Classe Mondiale',
      description: 'Les plus longues vagues d\'Afrique à votre porte. Parfait pour tous les niveaux.',
      color: 'text-blue-500',
      bg: 'bg-blue-50',
    },
    {
      icon: FaHeart,
      title: 'Ambiance Chaleureuse',
      description: 'Une communauté internationale de voyageurs, surfeurs et yogis.',
      color: 'text-red-500',
      bg: 'bg-red-50',
    },
    {
      icon: FaSun,
      title: 'Yoga & Bien-être',
      description: 'Sessions quotidiennes face à l\'océan pour un équilibre parfait.',
      color: 'text-orange-500',
      bg: 'bg-orange-50',
    },
    {
      icon: FaUsers,
      title: 'Village Authentique',
      description: 'Découvrez la vraie culture marocaine dans un village de pêcheurs préservé.',
      color: 'text-green-500',
      bg: 'bg-green-50',
    },
  ];

  return (
    <section className="section bg-white relative overflow-hidden">
      {/* ✅ Background decoration - Cachées sur mobile */}
      <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 hidden sm:block" />
      <div className="absolute bottom-0 left-0 w-64 h-64 md:w-96 md:h-96 bg-accent/20 rounded-full translate-y-1/2 -translate-x-1/2 hidden sm:block" />
      
      <div className="container-custom relative z-10">
        {/* ✅ Header - Titres et espacements mobile optimisés */}
        <div className="text-center mb-12 md:mb-16 px-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-dark mb-3 md:mb-4">
            Pourquoi Choisir Shams House ?
          </h2>
          <p className="text-base sm:text-lg text-dark-light max-w-2xl mx-auto leading-relaxed">
            Plus qu'un hostel, une expérience de vie unique à Imsouane
          </p>
        </div>

        {/* ✅ Grid - Gap réduit sur mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="text-center p-6 sm:p-8 hover:shadow-large transition-all duration-300 hover:-translate-y-2"
            >
              {/* ✅ Icône - Padding réduit sur mobile */}
              <div className={`inline-flex p-4 sm:p-6 ${feature.bg} rounded-full mb-4 sm:mb-6`}>
                <feature.icon className={`text-4xl sm:text-5xl ${feature.color}`} />
              </div>
              
              {/* ✅ Titre - Légèrement plus petit sur mobile */}
              <h3 className="text-lg sm:text-xl font-bold text-dark mb-2 sm:mb-3">
                {feature.title}
              </h3>
              
              {/* ✅ Description - Taille texte ajustée */}
              <p className="text-sm sm:text-base text-dark-light leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
