import Hero from '../../components/home/Hero';
import AboutShamsHouse from '../../components/home/AboutShamsHouse'; // ✅ Nouveau
import FeaturedRooms from '../../components/home/FeaturedRooms';
import FeaturedPacks from '../../components/home/FeaturedPacks';
import ServicesSection from '../../components/home/ServicesSection';
import WhyChooseUs from '../../components/home/WhyChooseUs';
import ContactSection from '../../components/home/ContactSection';

const HomePage = () => {
  return (
    <div>
      <Hero />
      
      {/* ✅ NOUVELLE SECTION : NOTRE HISTOIRE */}
      <section id="about">
        <AboutShamsHouse />
      </section>
      
      <WhyChooseUs />
      
      <section id="packs">
        <FeaturedPacks />
      </section>
      
      <section id="chambres">
        <FeaturedRooms />
      </section>
      
      <section id="services">
        <ServicesSection />
      </section>
      
      <section id="contact">
        <ContactSection />
      </section>
    </div>
  );
};

export default HomePage;
