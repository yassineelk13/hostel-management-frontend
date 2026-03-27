import Hero from '../../components/home/Hero';
import AboutShamsHouse from '../../components/home/AboutShamsHouse';
import FeaturedRooms from '../../components/home/FeaturedRooms';
import FeaturedPacks from '../../components/home/FeaturedPacks';
import ServicesSection from '../../components/home/ServicesSection';
import WhyChooseUs from '../../components/home/WhyChooseUs';
import ContactSection from '../../components/home/ContactSection';
import DayAtShamsHouse from '../../components/home/DayAtShamsHouse'; // ✅ Import

const HomePage = () => {
  return (
    <div>
      <Hero />

      <section id="about">
        <AboutShamsHouse />
      </section>

      <WhyChooseUs />

      <section id="packs">
        <FeaturedPacks />
      </section>

      {/* ✅ Timeline "A Day at Shams House" */}
      

      <section id="chambres">
        <FeaturedRooms />
      </section>

      <DayAtShamsHouse />

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