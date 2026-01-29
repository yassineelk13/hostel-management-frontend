import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaUserShield, FaLock, FaEnvelope, FaEye, FaEyeSlash, FaHome, FaExclamationCircle } from 'react-icons/fa';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.png';


// ✅ Error messages en anglais
const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  SERVER_ERROR: 'An error occurred. Please try again.',
  TOO_MANY_ATTEMPTS: 'Too many attempts. Please wait a moment.',
  NETWORK_ERROR: 'Connection problem. Check your internet connection.'
};

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 60000; // 1 minute


const LoginPage = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTimer, setLockoutTimer] = useState(null);
  const [shake, setShake] = useState(false);
  const submitButtonRef = useRef(null);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      if (lockoutTimer) {
        clearTimeout(lockoutTimer);
      }
    };
  }, [lockoutTimer]);

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleLockout = () => {
    setIsLocked(true);
    setError(ERROR_MESSAGES.TOO_MANY_ATTEMPTS);
    
    const timer = setTimeout(() => {
      setIsLocked(false);
      setAttemptCount(0);
      setError('');
    }, LOCKOUT_DURATION);
    
    setLockoutTimer(timer);
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 650);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (loading || isLocked) return;

    setError('');

    // ✅ Validation en anglais
    if (!isValidEmail(credentials.email)) {
      setError('Please enter a valid email address');
      triggerShake();
      return;
    }

    if (credentials.password.length < 6) {
      setError('Password must be at least 6 characters');
      triggerShake();
      return;
    }

    setLoading(true);

    try {
      const result = await login(credentials);
      
      if (result.success) {
        setAttemptCount(0);
        navigate('/admin/dashboard', { replace: true });
      } else {
        const newAttemptCount = attemptCount + 1;
        setAttemptCount(newAttemptCount);

        if (newAttemptCount >= MAX_ATTEMPTS) {
          handleLockout();
        } else {
          setError(result.message || ERROR_MESSAGES.INVALID_CREDENTIALS);
          triggerShake();
        }
      }
    } catch (err) {
      const newAttemptCount = attemptCount + 1;
      setAttemptCount(newAttemptCount);

      if (err.message === 'Network Error' || !err.response) {
        setError(ERROR_MESSAGES.NETWORK_ERROR);
      } else if (newAttemptCount >= MAX_ATTEMPTS) {
        handleLockout();
      } else {
        setError(ERROR_MESSAGES.SERVER_ERROR);
      }
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-gradient-sand flex items-center justify-center p-3 sm:p-4 relative overflow-hidden">
      {/* ✅ Animation de fond - Cachée sur très petit mobile */}
      <div className="absolute inset-0 opacity-5 hidden sm:block">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-primary-dark rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* ✅ Bouton retour accueil - Responsive + Anglais */}
      <Link 
        to="/" 
        className="absolute top-4 sm:top-6 left-4 sm:left-6 z-10 flex items-center gap-2 text-dark hover:text-primary transition-all duration-300 group"
        aria-label="Back to home"
      >
        <FaHome className="text-lg sm:text-xl group-hover:scale-110 transition-transform duration-300 flex-shrink-0" />
        <span className="hidden sm:inline font-medium text-sm">Back to Home</span>
      </Link>

      {/* ✅ Card avec padding responsive */}
      <Card className={`w-full max-w-md p-5 sm:p-8 shadow-2xl relative z-10 animate-fade-in ${shake ? 'animate-shake' : ''}`}>
        {/* ✅ Header - Tailles responsive + Anglais */}
        <div className="text-center mb-6 sm:mb-8">
          <img 
            src={logo} 
            alt="Shams House Logo" 
            className="h-16 sm:h-20 w-auto mx-auto mb-3 sm:mb-4 object-contain animate-scale-in" 
          />
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-dark mb-2 animate-slide-down break-words">
            Administration
          </h1>
          <p className="text-sm sm:text-base text-dark-light animate-slide-down animation-delay-100">
            Sign in to your admin dashboard
          </p>
        </div>

        {/* ✅ Message d'erreur - Responsive + Anglais */}
        {error && (
          <div 
            role="alert" 
            aria-live="polite"
            className="bg-red-50 border-l-4 border-red-500 text-red-700 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg mb-4 sm:mb-6 flex items-start gap-2 sm:gap-3 animate-slide-down"
          >
            <FaExclamationCircle className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm sm:text-base">Connection Error</p>
              <p className="text-xs sm:text-sm break-words">{error}</p>
              {attemptCount > 0 && attemptCount < MAX_ATTEMPTS && (
                <p className="text-xs mt-1 text-red-600">
                  Attempt {attemptCount}/{MAX_ATTEMPTS}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ✅ Indicateur de lockout - Responsive + Anglais */}
        {isLocked && (
          <div 
            role="alert" 
            className="bg-orange-50 border-l-4 border-orange-500 text-orange-700 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg mb-4 sm:mb-6 flex items-start gap-2 sm:gap-3"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-xs sm:text-sm">Account Temporarily Locked</p>
              <p className="text-xs">Please wait 1 minute before trying again</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* ✅ Champ Email - Responsive + Anglais */}
          <div className="mb-3 sm:mb-4">
            <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-dark mb-2">
              Email <span className="text-red-500" aria-label="required field">*</span>
            </label>
            <div className="relative group">
              <FaEnvelope className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-primary transition-all duration-300 group-focus-within:scale-110 text-sm sm:text-base" />
              <input
                id="email"
                type="email"
                name="email"
                value={credentials.email}
                onChange={handleChange}
                className="input pl-10 sm:pl-12 w-full focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 hover:border-primary/50 text-sm sm:text-base py-2 sm:py-2.5"
                placeholder="admin@shamshouse.com"
                required
                autoComplete="email"
                autoFocus
                disabled={isLocked}
                aria-invalid={error ? 'true' : 'false'}
                aria-describedby={error ? 'email-error' : undefined}
              />
            </div>
          </div>

          {/* ✅ Champ Mot de passe - Responsive + Anglais */}
          <div className="mb-3 sm:mb-4">
            <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-dark mb-2">
              Password <span className="text-red-500" aria-label="required field">*</span>
            </label>
            <div className="relative group">
              <FaLock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-primary transition-all duration-300 group-focus-within:scale-110 text-sm sm:text-base" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={credentials.password}
                onChange={handleChange}
                className="input pl-10 sm:pl-12 pr-10 sm:pr-12 w-full focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 hover:border-primary/50 text-sm sm:text-base py-2 sm:py-2.5"
                placeholder="••••••••"
                required
                autoComplete="current-password"
                minLength={6}
                disabled={isLocked}
                aria-invalid={error ? 'true' : 'false'}
                aria-describedby="password-help"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-dark-light hover:text-primary transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary rounded p-1"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                disabled={isLocked}
              >
                {showPassword ? <FaEyeSlash size={16} className="sm:w-[18px] sm:h-[18px]" /> : <FaEye size={16} className="sm:w-[18px] sm:h-[18px]" />}
              </button>
            </div>
            <p id="password-help" className="text-xs text-dark-light mt-1">
              Minimum 6 characters
            </p>
          </div>

          {/* ✅ Lien mot de passe oublié - Responsive + Anglais */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-5 sm:mb-6">
            <div className="text-xs text-dark-light order-2 sm:order-1">
              {attemptCount > 0 && attemptCount < MAX_ATTEMPTS && !isLocked && (
                <span className="text-orange-600">
                  {MAX_ATTEMPTS - attemptCount} attempt{MAX_ATTEMPTS - attemptCount > 1 ? 's' : ''} remaining
                </span>
              )}
            </div>
            <Link 
              to="/admin/reset-password" 
              className="text-xs sm:text-sm text-primary hover:text-primary-dark transition-colors font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded px-1 order-1 sm:order-2"
              tabIndex={isLocked ? -1 : 0}
            >
              Forgot password?
            </Link>
          </div>

          {/* ✅ Bouton de connexion - Responsive + Anglais */}
          <Button 
            ref={submitButtonRef}
            type="submit" 
            disabled={loading || isLocked || !credentials.email || !credentials.password} 
            className="w-full flex items-center justify-center transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base" 
            size="lg"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Signing in...
              </>
            ) : isLocked ? (
              <>
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Account Locked
              </>
            ) : (
              <>
                <FaUserShield className="mr-2 text-sm sm:text-base" />
                Sign In
              </>
            )}
          </Button>
        </form>
      </Card>

      {/* ✅ Footer Copyright - Responsive + Anglais */}
      <div className="absolute bottom-4 sm:bottom-6 text-center text-xs sm:text-sm text-dark-light z-10 animate-fade-in animation-delay-200 px-4">
        <p>&copy; {new Date().getFullYear()} Shams House. All rights reserved.</p>
      </div>
    </div>
  );
};

export default LoginPage;
