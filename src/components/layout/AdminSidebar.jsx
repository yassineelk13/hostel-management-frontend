import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaHome, FaBed, FaCalendarAlt, FaCog, FaSignOutAlt, FaBoxOpen, FaConciergeBell, FaChevronRight, FaUserCircle, FaGlobe, FaBars, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.png';


const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // ✅ Menu items en anglais
  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: FaHome, color: 'text-blue-500', bgHover: 'hover:bg-blue-50' },
    { name: 'Rooms', path: '/admin/rooms', icon: FaBed, color: 'text-purple-500', bgHover: 'hover:bg-purple-50' },
    { name: 'Bookings', path: '/admin/bookings', icon: FaCalendarAlt, color: 'text-green-500', bgHover: 'hover:bg-green-50' },
    { name: 'Services', path: '/admin/services', icon: FaConciergeBell, color: 'text-orange-500', bgHover: 'hover:bg-orange-50' },
    { name: 'Packages', path: '/admin/packs', icon: FaBoxOpen, color: 'text-pink-500', bgHover: 'hover:bg-pink-50' },
    { name: 'Settings', path: '/admin/settings', icon: FaCog, color: 'text-gray-500', bgHover: 'hover:bg-gray-50' },
  ];

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out?')) {
      logout();
      navigate('/admin/login');
    }
  };

  // ✅ Fermer le menu mobile après navigation
  const handleLinkClick = () => {
    setIsMobileOpen(false);
  };

  // ✅ Contenu du sidebar (réutilisé pour desktop et mobile)
  const SidebarContent = () => (
    <>
      {/* Logo Header */}
      <div className="p-4 sm:p-6 border-b border-gray-100 bg-gradient-to-br from-white to-gray-50">
        <div className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg group-hover:bg-primary/30 transition-colors" />
            <img 
              src={logo} 
              alt="Shams House" 
              className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover ring-2 ring-white shadow-lg group-hover:scale-110 transition-transform duration-300" 
            />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-display font-bold text-primary text-base sm:text-lg truncate">SHAMS HOUSE</h2>
            <p className="text-xs text-dark-light flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0" />
              <span className="truncate">Administration</span>
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-3 sm:p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={handleLinkClick}
              className={`group relative flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg scale-105'
                  : `text-dark ${item.bgHover} hover:scale-105 hover:shadow-md`
              }`}
              style={{
                animationDelay: `${index * 50}ms`
              }}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 sm:h-8 bg-white rounded-r-full" />
              )}

              {/* Icon with color */}
              <div className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                isActive 
                  ? 'bg-white/20' 
                  : 'bg-gray-100 group-hover:bg-white'
              }`}>
                <Icon className={`text-base sm:text-lg transition-transform duration-300 group-hover:scale-110 ${
                  isActive ? 'text-white' : item.color
                }`} />
              </div>

              {/* Label */}
              <span className={`font-semibold flex-1 text-sm sm:text-base truncate ${
                isActive ? 'text-white' : 'text-dark'
              }`}>
                {item.name}
              </span>

              {/* Chevron indicator */}
              <FaChevronRight className={`text-xs sm:text-sm flex-shrink-0 transition-all duration-300 ${
                isActive 
                  ? 'opacity-100 translate-x-0 text-white' 
                  : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 text-gray-400'
              }`} />

              {/* Hover effect */}
              {!isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Quick Actions */}
      <div className="px-3 sm:px-4 py-3 border-t border-gray-100 bg-gradient-to-b from-white to-gray-50">
        <Link
          to="/"
          target="_blank"
          onClick={handleLinkClick}
          className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 rounded-lg text-xs sm:text-sm text-dark-light hover:text-primary hover:bg-primary/5 transition-all group"
        >
          <FaGlobe className="text-sm sm:text-base group-hover:rotate-12 transition-transform flex-shrink-0" />
          <span className="font-medium truncate">View Website</span>
        </Link>
      </div>

      {/* User Info & Logout */}
      <div className="p-3 sm:p-4 border-t border-gray-100 bg-gradient-to-b from-gray-50 to-white">
        {/* User card */}
        <div className="mb-3 p-2.5 sm:p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0">
              <FaUserCircle className="text-xl sm:text-2xl" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] sm:text-xs text-dark-light">Logged in as</p>
              <p className="font-semibold text-dark text-xs sm:text-sm truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="group relative flex items-center justify-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl w-full transition-all duration-300 overflow-hidden bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl hover:scale-105"
        >
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

          <FaSignOutAlt className="text-base sm:text-lg relative z-10 group-hover:rotate-12 transition-transform flex-shrink-0" />
          <span className="font-bold relative z-10 text-sm sm:text-base">Log Out</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* ✅ Mobile Menu Button - Fixed top-left */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center text-dark hover:text-primary transition-colors border border-gray-200"
        aria-label="Toggle menu"
      >
        {isMobileOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
      </button>

      {/* ✅ Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* ✅ Desktop Sidebar - Hidden on mobile */}
      <div className="hidden lg:flex w-64 bg-white shadow-2xl h-screen sticky top-0 flex-col border-r border-gray-100 relative overflow-hidden">
        {/* Decorative gradient */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />
        <SidebarContent />
      </div>

      {/* ✅ Mobile Sidebar - Drawer from left */}
      <div className={`lg:hidden fixed top-0 left-0 h-screen w-72 bg-white shadow-2xl z-40 transform transition-transform duration-300 ease-in-out border-r border-gray-100 flex flex-col overflow-hidden ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Decorative gradient */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />
        <SidebarContent />
      </div>
    </>
  );
};

export default AdminSidebar;
