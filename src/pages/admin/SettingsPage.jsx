import { useState, useEffect } from 'react';
import { FaSave, FaUser, FaEnvelope, FaLock, FaSignOutAlt, FaHome, FaCog, FaDoorOpen, FaWifi, FaClock, FaInfoCircle, FaShieldAlt, FaCheckCircle, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import { settingsAPI, authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SettingsPage = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailForm, setEmailForm] = useState({
    newEmail: '',
    password: ''
  });
  const [changingEmail, setChangingEmail] = useState(false);

  const { logout } = useAuth();

  useEffect(() => {
    fetchSettings();
    fetchCurrentUser();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await settingsAPI.get();
      setSettings(response.data.data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('❌ Error loading settings');
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      setCurrentUser(response.data.data);
      setEmailForm({ newEmail: response.data.data.email, password: '' });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      await settingsAPI.update(settings);
      toast.success('✅ Settings updated successfully!');
    } catch (error) {
      toast.error('❌ Error updating settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleEmailChange = (e) => {
    setEmailForm({
      ...emailForm,
      [e.target.name]: e.target.value
    });
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setChangingEmail(true);

    try {
      await authAPI.changeEmail(emailForm);
      toast.success('✅ Email changed! Logging out in 3 seconds...');
      
      setTimeout(() => {
        logout();
        window.location.href = '/admin/login';
      }, 3000);
    } catch (error) {
      toast.error(`❌ ${error.response?.data?.message || 'Error changing email'}`);
    } finally {
      setChangingEmail(false);
    }
  };

  if (loading) return <Loader />;
  if (!settings) return <div>Loading error</div>;

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6 animate-fade-in">
      {/* ✅ Header responsive + Anglais */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-display font-bold text-dark mb-2 flex items-center gap-2 sm:gap-3">
            <span className="inline-block w-1.5 sm:w-2 h-8 sm:h-10 bg-gradient-to-b from-blue-500 to-blue-700 rounded-full flex-shrink-0" />
            <span className="break-words">Settings</span>
          </h1>
          <p className="text-xs sm:text-sm text-dark-light break-words">Your hostel and account configuration</p>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 sm:gap-3">
          <Button 
            variant="outline"
            onClick={() => setShowEmailModal(true)}
            className="border-2 border-blue-500 text-blue-600 hover:bg-blue-50 text-xs sm:text-sm flex-1 sm:flex-initial"
          >
            <FaEnvelope className="flex-shrink-0" />
            <span>Change Email</span>
          </Button>
        </div>
      </div>

      {/* ✅ Account Section responsive */}
      <Card className="overflow-hidden border-2 border-blue-100">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 sm:p-6">
          <div className="flex items-center gap-3 sm:gap-4 text-white">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <FaShieldAlt className="text-2xl sm:text-3xl" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold break-words">Administrator Account</h2>
              <p className="text-xs sm:text-sm text-white/80 break-words">Your secure login information</p>
            </div>
          </div>
        </div>

        {currentUser && (
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              <Card className="p-4 sm:p-5 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
                <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-500 flex items-center justify-center text-white flex-shrink-0">
                    <FaUser className="text-sm sm:text-base" />
                  </div>
                  <div className="text-[10px] sm:text-xs text-blue-600 font-semibold">Full Name</div>
                </div>
                <p className="font-bold text-blue-800 text-base sm:text-lg break-words">{currentUser.fullName}</p>
              </Card>

              <Card className="p-4 sm:p-5 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-green-500 flex items-center justify-center text-white flex-shrink-0">
                    <FaEnvelope className="text-sm sm:text-base" />
                  </div>
                  <div className="text-[10px] sm:text-xs text-green-600 font-semibold">Current Email</div>
                </div>
                <p className="font-bold text-green-800 text-base sm:text-lg truncate" title={currentUser.email}>{currentUser.email}</p>
              </Card>

              <Card className="p-4 sm:p-5 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-purple-500 flex items-center justify-center text-white flex-shrink-0">
                    <FaPhone className="text-sm sm:text-base" />
                  </div>
                  <div className="text-[10px] sm:text-xs text-purple-600 font-semibold">Phone</div>
                </div>
                <p className="font-bold text-purple-800 text-base sm:text-lg break-words">{currentUser.phone || 'Not provided'}</p>
              </Card>
            </div>

            <Card className="mt-4 sm:mt-6 p-4 sm:p-5 bg-yellow-50 border-2 border-yellow-200">
              <div className="flex items-start gap-2 sm:gap-3">
                <FaInfoCircle className="text-yellow-600 text-lg sm:text-xl mt-1 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-yellow-800 mb-0.5 sm:mb-1 text-sm sm:text-base">Account Security</p>
                  <p className="text-xs sm:text-sm text-yellow-700 break-words">
                    To change your login email, use the button above. 
                    You will be automatically logged out after the change.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </Card>

      {/* ✅ Settings Form responsive */}
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* General Information */}
          <Card className="overflow-hidden border-2 border-gray-100">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 sm:p-5 border-b-2 border-gray-200">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-primary flex items-center justify-center text-white flex-shrink-0">
                  <FaHome className="text-base sm:text-xl" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-base sm:text-lg md:text-xl font-bold text-dark break-words">General Information</h2>
                  <p className="text-xs sm:text-sm text-dark-light break-words">Your hostel contact details</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-dark mb-2 flex items-center gap-2">
                  <FaHome className="text-primary flex-shrink-0" />
                  <span>Hostel Name <span className="text-red-500">*</span></span>
                </label>
                <input
                  type="text"
                  name="hostelName"
                  value={settings.hostelName || ''}
                  onChange={handleChange}
                  className="input w-full text-sm sm:text-base"
                  required
                />
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-bold text-dark mb-2 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-primary flex-shrink-0" />
                  <span>Address <span className="text-red-500">*</span></span>
                </label>
                <input
                  type="text"
                  name="address"
                  value={settings.address || ''}
                  onChange={handleChange}
                  className="input w-full text-sm sm:text-base"
                  required
                />
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-bold text-dark mb-2 flex items-center gap-2">
                  <FaEnvelope className="text-primary flex-shrink-0" />
                  <span>Contact Email <span className="text-red-500">*</span></span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={settings.email || ''}
                  onChange={handleChange}
                  className="input w-full text-sm sm:text-base"
                  required
                />
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-bold text-dark mb-2 flex items-center gap-2">
                  <FaPhone className="text-primary flex-shrink-0" />
                  <span>Phone <span className="text-red-500">*</span></span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={settings.phone || ''}
                  onChange={handleChange}
                  className="input w-full text-sm sm:text-base"
                  required
                />
              </div>
            </div>
          </Card>

          {/* Access Settings */}
          <Card className="overflow-hidden border-2 border-gray-100">
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 sm:p-5 border-b-2 border-purple-200">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-purple-500 flex items-center justify-center text-white flex-shrink-0">
                  <FaLock className="text-base sm:text-xl" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-base sm:text-lg md:text-xl font-bold text-dark break-words">Access Settings</h2>
                  <p className="text-xs sm:text-sm text-dark-light break-words">Access codes and schedules</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-dark mb-2 flex items-center gap-2">
                  <FaDoorOpen className="text-purple-500 flex-shrink-0" />
                  <span>Door Code</span>
                </label>
                <input
                  type="text"
                  name="doorCode"
                  value={settings.doorCode || ''}
                  onChange={handleChange}
                  className="input w-full text-sm sm:text-base"
                  placeholder="Ex: 1234"
                />
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-bold text-dark mb-2 flex items-center gap-2">
                  <FaWifi className="text-purple-500 flex-shrink-0" />
                  <span>WiFi Password</span>
                </label>
                <input
                  type="text"
                  name="wifiPassword"
                  value={settings.wifiPassword || ''}
                  onChange={handleChange}
                  className="input w-full text-sm sm:text-base"
                  placeholder="WiFi password"
                />
              </div>

              <Card className="p-3 sm:p-4 bg-purple-50 border-2 border-purple-200">
                <label className="flex items-center gap-2 sm:gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="checkIn24h"
                    checked={settings.checkIn24h || false}
                    onChange={handleChange}
                    className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 border-purple-300 rounded focus:ring-purple-500 flex-shrink-0"
                  />
                  <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                    <FaClock className="text-purple-600 flex-shrink-0" />
                    <span className="text-dark font-bold text-xs sm:text-sm md:text-base break-words">24/7 Check-in</span>
                  </div>
                </label>
              </Card>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-dark mb-2 flex items-center gap-2">
                  <FaInfoCircle className="text-purple-500 flex-shrink-0" />
                  <span>Check-in Instructions</span>
                </label>
                <textarea
                  name="checkInInstructions"
                  value={settings.checkInInstructions || ''}
                  onChange={handleChange}
                  rows="4"
                  className="input resize-none w-full text-sm sm:text-base"
                  placeholder="Instructions for guests..."
                ></textarea>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-dark mb-2 flex items-center gap-2">
                  <FaClock className="text-purple-500 flex-shrink-0" />
                  <span>Check-out Time</span>
                </label>
                <input
                  type="time"
                  name="checkOutTime"
                  value={settings.checkOutTime || ''}
                  onChange={handleChange}
                  className="input w-full text-sm sm:text-base"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={saving}
            size="lg"
            className="shadow-xl hover:shadow-2xl text-sm sm:text-base w-full sm:w-auto"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin flex-shrink-0" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <FaSave className="flex-shrink-0" />
                <span>Save Changes</span>
              </>
            )}
          </Button>
        </div>
      </form>

      {/* ✅ Email Change Modal - Responsive + Anglais */}
      <Modal
        isOpen={showEmailModal}
        onClose={() => {
          setShowEmailModal(false);
          setEmailForm({ newEmail: currentUser?.email || '', password: '' });
        }}
        title={
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white flex-shrink-0">
              <FaEnvelope className="text-sm sm:text-base" />
            </div>
            <span className="text-base sm:text-lg break-words">Change Login Email</span>
          </div>
        }
      >
        <form onSubmit={handleEmailSubmit} className="space-y-4 sm:space-y-6">
          <Card className="p-4 sm:p-5 bg-blue-50 border-2 border-blue-200">
            <div className="flex items-start gap-2 sm:gap-3">
              <FaShieldAlt className="text-blue-600 text-lg sm:text-xl mt-1 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-blue-800 mb-0.5 sm:mb-1 text-sm sm:text-base">Security</p>
                <p className="text-xs sm:text-sm text-blue-700 break-words">
                  Enter your new email and confirm with your current password
                </p>
              </div>
            </div>
          </Card>

          <div>
            <label className="block text-xs sm:text-sm font-bold text-dark mb-2 flex items-center gap-2">
              <FaEnvelope className="text-blue-500 flex-shrink-0" />
              <span>New Email <span className="text-red-500">*</span></span>
            </label>
            <input
              type="email"
              name="newEmail"
              value={emailForm.newEmail}
              onChange={handleEmailChange}
              className="input w-full text-sm sm:text-base"
              required
              disabled={changingEmail}
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-bold text-dark mb-2 flex items-center gap-2">
              <FaLock className="text-blue-500 flex-shrink-0" />
              <span>Current Password <span className="text-red-500">*</span></span>
            </label>
            <input
              type="password"
              name="password"
              value={emailForm.password}
              onChange={handleEmailChange}
              className="input w-full text-sm sm:text-base"
              placeholder="Confirm with your password"
              required
              disabled={changingEmail}
            />
          </div>

          <Card className="p-4 sm:p-5 bg-yellow-50 border-2 border-yellow-300">
            <div className="flex items-start gap-2 sm:gap-3">
              <FaInfoCircle className="text-yellow-600 text-lg sm:text-xl mt-1 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-yellow-800 mb-0.5 sm:mb-1 text-sm sm:text-base">⚠️ Warning</p>
                <p className="text-xs sm:text-sm text-yellow-700 break-words">
                  After changing your email, you will be automatically logged out 
                  and will need to log in again with your new email.
                </p>
              </div>
            </div>
          </Card>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 border-t-2 border-gray-100">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setShowEmailModal(false);
                setEmailForm({ newEmail: currentUser?.email || '', password: '' });
              }}
              className="flex-1 border-2 text-sm sm:text-base"
              disabled={changingEmail}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl text-sm sm:text-base"
              disabled={changingEmail || !emailForm.password}
            >
              {changingEmail ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin flex-shrink-0" />
                  <span>Changing...</span>
                </>
              ) : (
                <>
                  <FaCheckCircle className="flex-shrink-0" />
                  <span>Confirm Change</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Toast Container */}
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
      />
    </div>
  );
};

export default SettingsPage;
