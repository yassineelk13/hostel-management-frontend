import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaKey, FaLock, FaEnvelope, FaArrowLeft, FaHome } from 'react-icons/fa';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { authAPI } from '../../services/api';
import logo from '../../assets/logo.png';


const ResetPasswordPage = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1 = email, 2 = code+password
  const [email, setEmail] = useState('');
  const [formData, setFormData] = useState({
    code: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // ✅ ÉTAPE 1 : Demander le code
  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authAPI.forgotPassword(email);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Error sending verification code');
    } finally {
      setLoading(false);
    }
  };

  // ✅ ÉTAPE 2 : Vérifier le code et changer le mot de passe
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await authAPI.resetPassword({
        email: email,
        code: formData.code,
        newPassword: formData.newPassword
      });
      
      setSuccess(true);
      setTimeout(() => navigate('/admin/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired code');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  // ✅ ÉCRAN DE SUCCÈS - Responsive + Anglais
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-sand flex items-center justify-center p-3 sm:p-4">
        {/* ✅ Bouton retour accueil */}
        <Link 
          to="/" 
          className="absolute top-4 sm:top-6 left-4 sm:left-6 z-10 flex items-center gap-2 text-dark hover:text-primary transition-all duration-300 group"
          aria-label="Back to home"
        >
          <FaHome className="text-lg sm:text-xl group-hover:scale-110 transition-transform duration-300 flex-shrink-0" />
          <span className="hidden sm:inline font-medium text-sm">Back to Home</span>
        </Link>

        <Card className="w-full max-w-md p-6 sm:p-8 text-center animate-fade-in">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-dark mb-2 break-words">Password Reset Successfully!</h2>
          <p className="text-sm sm:text-base text-dark-light mb-4 sm:mb-6">Your password has been changed successfully.</p>
          <p className="text-xs sm:text-sm text-dark-light">Redirecting to login page...</p>
        </Card>
      </div>
    );
  }

  // ✅ ÉTAPE 1 : DEMANDER LE CODE - Responsive + Anglais
  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-sand flex items-center justify-center p-3 sm:p-4 relative">
        {/* ✅ Bouton retour accueil */}
        <Link 
          to="/" 
          className="absolute top-4 sm:top-6 left-4 sm:left-6 z-10 flex items-center gap-2 text-dark hover:text-primary transition-all duration-300 group"
          aria-label="Back to home"
        >
          <FaHome className="text-lg sm:text-xl group-hover:scale-110 transition-transform duration-300 flex-shrink-0" />
          <span className="hidden sm:inline font-medium text-sm">Back to Home</span>
        </Link>

        <Card className="w-full max-w-md p-5 sm:p-8 animate-fade-in">
          <div className="text-center mb-6 sm:mb-8">
            <img src={logo} alt="Shams House" className="h-16 sm:h-20 w-auto mx-auto mb-3 sm:mb-4" />
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-dark mb-2 break-words">Forgot Password?</h1>
            <p className="text-sm sm:text-base text-dark-light">Enter your email to receive a verification code</p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg mb-4 sm:mb-6 text-xs sm:text-sm break-words">
              {error}
            </div>
          )}

          <form onSubmit={handleRequestCode} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<FaEnvelope />}
              placeholder="your.email@example.com"
              required
              autoFocus
            />

            <Button type="submit" disabled={loading} className="w-full text-sm sm:text-base" size="lg">
              {loading ? 'Sending...' : 'Send Code'}
            </Button>

            <Link to="/admin/login">
              <Button variant="outline" className="w-full text-sm sm:text-base">
                <FaArrowLeft className="mr-2 flex-shrink-0" />
                Back to Login
              </Button>
            </Link>
          </form>
        </Card>
      </div>
    );
  }

  // ✅ ÉTAPE 2 : SAISIR LE CODE ET NOUVEAU MOT DE PASSE - Responsive + Anglais
  return (
    <div className="min-h-screen bg-gradient-sand flex items-center justify-center p-3 sm:p-4 relative">
      {/* ✅ Bouton retour accueil */}
      <Link 
        to="/" 
        className="absolute top-4 sm:top-6 left-4 sm:left-6 z-10 flex items-center gap-2 text-dark hover:text-primary transition-all duration-300 group"
        aria-label="Back to home"
      >
        <FaHome className="text-lg sm:text-xl group-hover:scale-110 transition-transform duration-300 flex-shrink-0" />
        <span className="hidden sm:inline font-medium text-sm">Back to Home</span>
      </Link>

      <Card className="w-full max-w-md p-5 sm:p-8 animate-fade-in">
        <div className="text-center mb-6 sm:mb-8">
          <img src={logo} alt="Shams House" className="h-16 sm:h-20 w-auto mx-auto mb-3 sm:mb-4" />
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-dark mb-2 break-words">Reset Password</h1>
          <p className="text-sm sm:text-base text-dark-light">Enter the code received by email and your new password</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg mb-4 sm:mb-6 text-xs sm:text-sm break-words">
            {error}
          </div>
        )}

        <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg mb-4 sm:mb-6">
          <p className="text-xs sm:text-sm break-words">
            ✉️ A 6-digit code has been sent to <strong className="break-all">{email}</strong>
          </p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-4">
          <Input
            label="Verification Code (6 digits)"
            type="text"
            name="code"
            value={formData.code}
            onChange={handleChange}
            icon={<FaKey />}
            placeholder="123456"
            maxLength={6}
            pattern="[0-9]{6}"
            required
            autoFocus
          />

          <Input
            label="New Password"
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            icon={<FaLock />}
            placeholder="••••••••"
            minLength={6}
            required
          />

          <Input
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            icon={<FaLock />}
            placeholder="••••••••"
            minLength={6}
            required
          />

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-yellow-700">⏱️ Code expires in 15 minutes</p>
          </div>

          <Button type="submit" disabled={loading} className="w-full text-sm sm:text-base" size="lg">
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>

          <button
            type="button"
            onClick={() => {
              setStep(1);
              setFormData({ code: '', newPassword: '', confirmPassword: '' });
              setError('');
            }}
            className="text-xs sm:text-sm text-primary hover:text-primary-dark transition-colors flex items-center justify-center gap-2 w-full py-2 hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded"
          >
            <FaArrowLeft className="flex-shrink-0" />
            Request a new code
          </button>
        </form>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;
