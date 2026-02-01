import { FaWater, FaHeart, FaSun, FaUsers } from 'react-icons/fa';
import Card from '../common/Card';



const WhyChooseUs = () => {
  const features = [
    {
      icon: FaWater,
      title: 'World-Class Surf',
      description: 'Africa\'s longest waves at your doorstep. Perfect for all levels.',
      color: 'text-blue-500',
      bg: 'bg-blue-50',
    },
    {
      icon: FaHeart,
      title: 'Warm Atmosphere',
      description: 'An international community of travelers, surfers and yogis.',
      color: 'text-red-500',
      bg: 'bg-red-50',
    },
    {
      icon: FaSun,
      title: 'Yoga & Wellness',
      description: 'Daily sessions facing the ocean for perfect balance.',
      color: 'text-orange-500',
      bg: 'bg-orange-50',
    },
    {
      icon: FaUsers,
      title: 'Authentic Village',
      description: 'Discover the real Moroccan culture in a preserved fishing village.',
      color: 'text-green-500',
      bg: 'bg-green-50',
    },
  ];


  return (
    <section className="section bg-white relative overflow-hidden">
      {/* ✅ Background decoration - Hidden on mobile */}
      <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 hidden sm:block" />
      <div className="absolute bottom-0 left-0 w-64 h-64 md:w-96 md:h-96 bg-accent/20 rounded-full translate-y-1/2 -translate-x-1/2 hidden sm:block" />

      <div className="container-custom relative z-10">
        {/* ✅ Header - Mobile-optimized titles and spacing */}
        <div className="text-center mb-12 md:mb-16 px-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-dark mb-3 md:mb-4">
            Why Choose Shams House?
          </h2>
          <p className="text-base sm:text-lg text-dark-light max-w-2xl mx-auto leading-relaxed">
            More than a hostel, a unique life experience in Imsouane
          </p>
        </div>


        {/* ✅ Grid - Reduced gap on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="text-center p-6 sm:p-8 hover:shadow-large transition-all duration-300 hover:-translate-y-2"
            >
              {/* ✅ Icon - Reduced padding on mobile */}
              <div className={`inline-flex p-4 sm:p-6 ${feature.bg} rounded-full mb-4 sm:mb-6`}>
                <feature.icon className={`text-4xl sm:text-5xl ${feature.color}`} />
              </div>

              {/* ✅ Title - Slightly smaller on mobile */}
              <h3 className="text-lg sm:text-xl font-bold text-dark mb-2 sm:mb-3">
                {feature.title}
              </h3>

              {/* ✅ Description - Adjusted text size */}
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
