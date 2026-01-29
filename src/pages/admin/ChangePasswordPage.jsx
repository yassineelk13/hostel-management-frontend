import { useState } from 'react';
import { FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { authAPI } from '../../services/api';


const ChangePasswordPage = () => {
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setPasswords({
      ...passwords,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // ✅ Validation en anglais
    if (passwords.newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await authAPI.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      
      setSuccess('Password changed successfully!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Current password is incorrect');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords({
      ...showPasswords,
      [field]: !showPasswords[field]
    });
  };

  return (
    <div className="p-3 sm:p-4 md:p-6">
      {/* ✅ Titre responsive + Anglais */}
      <h1 className="text-xl sm:text-2xl font-bold text-dark mb-4 sm:mb-6 break-words">
        Change Password
      </h1>
      
      {/* ✅ Card responsive */}
      <Card className="max-w-2xl p-4 sm:p-6">
        {/* ✅ Message d'erreur responsive + Anglais */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-3 sm:px-4 py-2.5 sm:py-3 rounded mb-4 sm:mb-6 text-xs sm:text-sm break-words">
            {error}
          </div>
        )}

        {/* ✅ Message de succès responsive + Anglais */}
        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-3 sm:px-4 py-2.5 sm:py-3 rounded mb-4 sm:mb-6 text-xs sm:text-sm break-words">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {/* ✅ Mot de passe actuel - Responsive + Anglais */}
          <div>
            <label 
              htmlFor="currentPassword" 
              className="block text-xs sm:text-sm font-medium text-dark mb-2"
            >
              Current Password <span className="text-red-500" aria-label="required field">*</span>
            </label>
            <div className="relative">
              <FaLock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-primary text-sm sm:text-base" />
              <input
                id="currentPassword"
                type={showPasswords.current ? 'text' : 'password'}
                name="currentPassword"
                value={passwords.currentPassword}
                onChange={handleChange}
                className="input pl-10 sm:pl-12 pr-10 sm:pr-12 w-full text-sm sm:text-base py-2 sm:py-2.5"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-dark-light hover:text-primary transition-colors p-1"
                aria-label={showPasswords.current ? 'Hide password' : 'Show password'}
              >
                {showPasswords.current ? (
                  <FaEyeSlash className="text-base sm:text-lg" />
                ) : (
                  <FaEye className="text-base sm:text-lg" />
                )}
              </button>
            </div>
          </div>

          {/* ✅ Nouveau mot de passe - Responsive + Anglais */}
          <div>
            <label 
              htmlFor="newPassword" 
              className="block text-xs sm:text-sm font-medium text-dark mb-2"
            >
              New Password <span className="text-red-500" aria-label="required field">*</span>
            </label>
            <div className="relative">
              <FaLock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-primary text-sm sm:text-base" />
              <input
                id="newPassword"
                type={showPasswords.new ? 'text' : 'password'}
                name="newPassword"
                value={passwords.newPassword}
                onChange={handleChange}
                className="input pl-10 sm:pl-12 pr-10 sm:pr-12 w-full text-sm sm:text-base py-2 sm:py-2.5"
                placeholder="••••••••"
                required
                minLength={6}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-dark-light hover:text-primary transition-colors p-1"
                aria-label={showPasswords.new ? 'Hide password' : 'Show password'}
              >
                {showPasswords.new ? (
                  <FaEyeSlash className="text-base sm:text-lg" />
                ) : (
                  <FaEye className="text-base sm:text-lg" />
                )}
              </button>
            </div>
            <p className="text-xs text-dark-light mt-1">Minimum 6 characters</p>
          </div>

          {/* ✅ Confirmer nouveau mot de passe - Responsive + Anglais */}
          <div>
            <label 
              htmlFor="confirmPassword" 
              className="block text-xs sm:text-sm font-medium text-dark mb-2"
            >
              Confirm New Password <span className="text-red-500" aria-label="required field">*</span>
            </label>
            <div className="relative">
              <FaLock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-primary text-sm sm:text-base" />
              <input
                id="confirmPassword"
                type={showPasswords.confirm ? 'text' : 'password'}
                name="confirmPassword"
                value={passwords.confirmPassword}
                onChange={handleChange}
                className="input pl-10 sm:pl-12 pr-10 sm:pr-12 w-full text-sm sm:text-base py-2 sm:py-2.5"
                placeholder="••••••••"
                required
                minLength={6}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-dark-light hover:text-primary transition-colors p-1"
                aria-label={showPasswords.confirm ? 'Hide password' : 'Show password'}
              >
                {showPasswords.confirm ? (
                  <FaEyeSlash className="text-base sm:text-lg" />
                ) : (
                  <FaEye className="text-base sm:text-lg" />
                )}
              </button>
            </div>
          </div>

          {/* ✅ Bouton submit responsive + Anglais */}
          <div className="pt-2">
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full sm:w-auto text-sm sm:text-base"
            >
              {loading ? 'Changing...' : 'Change Password'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ChangePasswordPage;
