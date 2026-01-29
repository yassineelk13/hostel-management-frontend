import { useState } from 'react';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaPaperPlane } from 'react-icons/fa';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Envoyer le message
    alert('Message envoyé !');
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-warm text-white py-20">
        <div className="container-custom text-center">
          <h1 className="text-5xl font-display font-bold mb-4">Contactez-nous</h1>
          <p className="text-xl text-white/90">
            Nous sommes là pour répondre à toutes vos questions
          </p>
        </div>
      </div>

      <div className="container-custom py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Informations de contact */}
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <FaMapMarkerAlt className="text-2xl text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-dark mb-1">Adresse</h3>
                  <p className="text-dark-light text-sm">
                    123 Beach Road<br />
                    Imsouane, Morocco
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <FaPhone className="text-2xl text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-dark mb-1">Téléphone</h3>
                  <a href="tel:+212600000000" className="text-primary hover:underline">
                    +212 600 000 000
                  </a>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <FaEnvelope className="text-2xl text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-dark mb-1">Email</h3>
                  <a href="mailto:contact@shamshouse.com" className="text-primary hover:underline text-sm">
                    contact@shamshouse.com
                  </a>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <FaClock className="text-2xl text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-dark mb-1">Horaires</h3>
                  <p className="text-dark-light text-sm">
                    Check-in: 24h/24<br />
                    Check-out: 12:00
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Formulaire de contact */}
          <div className="lg:col-span-2">
            <Card className="p-8">
              <h2 className="text-2xl font-display font-bold text-dark mb-6">
                Envoyez-nous un message
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Nom complet"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    label="Téléphone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <Input
                  label="Sujet"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />

                <div className="mb-4">
                  <label className="block text-sm font-medium text-dark mb-2">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="6"
                    required
                    className="input resize-none"
                  ></textarea>
                </div>

                <Button type="submit" size="lg" className="w-full">
                  <FaPaperPlane />
                  Envoyer le message
                </Button>
              </form>
            </Card>
          </div>
        </div>

        {/* Carte */}
        <div className="mt-12 rounded-xl overflow-hidden shadow-medium">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3447.891!2d-9.8176!3d30.8447!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzDCsDUwJzQwLjkiTiA5wrA0OScwMy40Ilc!5e0!3m2!1sen!2sma!4v1234567890"
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            title="Shams House Location"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
