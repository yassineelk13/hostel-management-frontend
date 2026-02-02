import { useState, useEffect } from 'react';
import { FaEye, FaCheck, FaTimes, FaBoxOpen, FaTrash, FaSearch, FaCalendarAlt, FaUser, FaFilter, FaDownload, FaClock, FaUserCheck, FaExclamationTriangle, FaBed } from 'react-icons/fa';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import { bookingsAPI } from '../../services/api';
import { formatDate } from '../../utils/dateHelpers';
import { formatPrice } from '../../utils/priceFormatter';


const BookingsManagementPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false); // ✅ État de chargement pour delete

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await bookingsAPI.getAll();
      const activeBookings = response.data.data.filter(
        booking => booking.status !== 'CANCELLED' && booking.status !== 'PENDING'
      );
      setBookings(activeBookings);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await bookingsAPI.updateStatus(id, status);
      alert(`✅ Status updated: ${getStatusLabel(status)}`);
      fetchBookings();
    } catch (error) {
      alert('❌ Error updating status');
    }
  };

  const handleDeleteClick = (booking) => {
    setBookingToDelete(booking);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!bookingToDelete) return;

    setDeleting(true); // ✅ Active le chargement

    try {
      await bookingsAPI.cancel(bookingToDelete.id);
      alert(`✅ Booking ${bookingToDelete.bookingReference} deleted!`);
      setShowDeleteConfirm(false);
      setBookingToDelete(null);
      fetchBookings();
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error deleting booking');
    } finally {
      setDeleting(false); // ✅ Désactive le chargement
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setBookingToDelete(null);
    setDeleting(false); // ✅ Réinitialise l'état
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  const getStatusBadge = (status) => {
    const styles = {
      CONFIRMED: 'bg-blue-500 text-white shadow-blue-200',
      CHECKED_IN: 'bg-green-500 text-white shadow-green-200',
      CHECKED_OUT: 'bg-gray-500 text-white shadow-gray-200',
    };
    return styles[status] || 'bg-gray-500 text-white shadow-gray-200';
  };

  const getStatusIcon = (status) => {
    const icons = {
      CONFIRMED: FaCalendarAlt,
      CHECKED_IN: FaUserCheck,
      CHECKED_OUT: FaClock,
    };
    return icons[status] || FaClock;
  };

  // ✅ Labels en anglais
  const getStatusLabel = (status) => {
    const labels = {
      CONFIRMED: 'Confirmed',
      CHECKED_IN: 'In Progress',
      CHECKED_OUT: 'Completed',
    };
    return labels[status] || status;
  };

  const filteredByStatus = filter === 'ALL' 
    ? bookings 
    : bookings.filter(b => b.status === filter);

  const filteredBookings = filteredByStatus.filter(booking => {
    if (!searchTerm) return true;
    
    const search = searchTerm.toLowerCase();
    return (
      booking.guestName?.toLowerCase().includes(search) ||
      booking.guestEmail?.toLowerCase().includes(search) ||
      booking.guestPhone?.toLowerCase().includes(search) ||
      booking.bookingReference?.toLowerCase().includes(search) ||
      booking.accessCode?.toLowerCase().includes(search) ||
      booking.beds?.some(bed => 
        bed.roomNumber?.toLowerCase().includes(search) ||
        bed.bedNumber?.toLowerCase().includes(search)
      ) ||
      booking.pack?.name?.toLowerCase().includes(search)
    );
  });

  // ✅ Filters en anglais
  const statusFilters = [
    { value: 'ALL', label: 'All', icon: FaFilter, color: 'bg-gray-500', count: bookings.length },
    { value: 'CONFIRMED', label: 'Confirmed', icon: FaCalendarAlt, color: 'bg-blue-500', count: bookings.filter(b => b.status === 'CONFIRMED').length },
    { value: 'CHECKED_IN', label: 'In Progress', icon: FaUserCheck, color: 'bg-green-500', count: bookings.filter(b => b.status === 'CHECKED_IN').length },
    { value: 'CHECKED_OUT', label: 'Completed', icon: FaClock, color: 'bg-gray-500', count: bookings.filter(b => b.status === 'CHECKED_OUT').length },
  ];

  if (loading) return <Loader />;

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6 animate-fade-in">
      {/* ✅ Header responsive + Anglais */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-display font-bold text-dark mb-2 flex items-center gap-2 sm:gap-3">
            <span className="inline-block w-1.5 sm:w-2 h-8 sm:h-10 bg-gradient-to-b from-primary to-primary-dark rounded-full flex-shrink-0" />
            <span className="break-words">Bookings Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-dark-light flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0" />
            <span>{bookings.length} active booking{bookings.length !== 1 ? 's' : ''}</span>
          </p>
        </div>

        {/* Export button */}
        <Button className="flex items-center justify-center gap-2 shadow-lg hover:shadow-xl text-sm sm:text-base flex-shrink-0 w-full sm:w-auto">
          <FaDownload className="flex-shrink-0" />
          <span>Export Excel</span>
        </Button>
      </div>

      {/* ✅ Filters Card responsive + Anglais */}
      <Card className="border-2 border-gray-100 shadow-lg">
        <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
          {/* Status filters */}
          <div>
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FaFilter className="text-primary text-sm sm:text-base" />
              </div>
              <h3 className="font-bold text-dark text-sm sm:text-base md:text-lg">Filter by Status</h3>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
              {statusFilters.map((status) => {
                const Icon = status.icon;
                return (
                  <button
                    key={status.value}
                    onClick={() => setFilter(status.value)}
                    className={`relative group p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 ${
                      filter === status.value
                        ? 'border-primary bg-primary/5 shadow-xl scale-105 ring-2 sm:ring-4 ring-primary/20'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-lg hover:scale-102'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl ${status.color} flex items-center justify-center text-white shadow-lg flex-shrink-0`}>
                        <Icon className="text-xs sm:text-sm md:text-base" />
                      </div>
                      {filter === status.value && (
                        <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                          <FaCheck className="text-white text-[10px] sm:text-xs" />
                        </div>
                      )}
                    </div>
                    <div className="text-left">
                      <div className={`text-xl sm:text-2xl md:text-3xl font-bold mb-0.5 sm:mb-1 ${filter === status.value ? 'text-primary' : 'text-dark'}`}>
                        {status.count}
                      </div>
                      <div className={`text-[10px] sm:text-xs md:text-sm font-semibold truncate ${filter === status.value ? 'text-primary' : 'text-dark-light'}`}>
                        {status.label}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ✅ Search bar responsive + Anglais */}
          <div className="relative">
            <div className="absolute left-3 sm:left-4 md:left-5 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <FaSearch className="text-primary text-sm sm:text-base md:text-lg" />
            </div>
            <input
              type="text"
              placeholder="🔍 Search by name, email, reference, access code, room..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 sm:pl-12 md:pl-14 pr-10 sm:pr-12 md:pr-14 py-3 sm:py-4 md:py-5 border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:border-primary focus:outline-none focus:ring-2 sm:focus:ring-4 focus:ring-primary/10 transition-all text-sm sm:text-base md:text-lg font-medium placeholder:text-dark-light/60"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 sm:right-4 md:right-5 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg sm:rounded-xl bg-red-100 hover:bg-red-200 flex items-center justify-center transition-all group"
                title="Clear search"
              >
                <FaTimes className="text-red-600 group-hover:scale-110 transition-transform text-sm sm:text-base" />
              </button>
            )}
          </div>

          {/* ✅ Results counter + Anglais */}
          {searchTerm && (
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500 p-3 sm:p-4 rounded-xl animate-slide-down">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
                  <FaSearch className="text-white text-xs sm:text-sm" />
                </div>
                <p className="font-bold text-blue-800 text-xs sm:text-sm md:text-base">
                  {filteredBookings.length} result{filteredBookings.length !== 1 ? 's' : ''} found
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* ✅ Desktop Table View - Hidden on mobile */}
      <Card className="overflow-hidden border-2 border-gray-100 shadow-xl hidden lg:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 border-b-2 border-gray-200">
                <th className="px-6 py-5 text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FaUser className="text-primary text-sm" />
                    </div>
                    <span className="text-sm font-bold text-dark">Guest</span>
                  </div>
                </th>
                <th className="px-6 py-5 text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                      <FaCalendarAlt className="text-green-600 text-sm" />
                    </div>
                    <span className="text-sm font-bold text-dark">Dates</span>
                  </div>
                </th>
                <th className="px-6 py-5 text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center">
                      <FaBoxOpen className="text-pink-600 text-sm" />
                    </div>
                    <span className="text-sm font-bold text-dark">Package</span>
                  </div>
                </th>
                <th className="px-6 py-5 text-left">
                  <span className="text-sm font-bold text-dark">Price</span>
                </th>
                <th className="px-6 py-5 text-left">
                  <span className="text-sm font-bold text-dark">Status</span>
                </th>
                <th className="px-6 py-5 text-left">
                  <span className="text-sm font-bold text-dark">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-5 animate-fade-in">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <FaSearch className="text-4xl text-gray-400" />
                      </div>
                      <div>
                        <p className="text-xl font-bold text-dark mb-2">
                          {searchTerm ? 'No results found' : 'No active bookings'}
                        </p>
                        <p className="text-dark-light">
                          {searchTerm 
                            ? 'Try different search terms' 
                            : 'New bookings will appear here'}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking, index) => {
                  const StatusIcon = getStatusIcon(booking.status);
                  return (
                    <tr 
                      key={booking.id} 
                      className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-transparent transition-all duration-200 group"
                      style={{ 
                        animation: 'slideIn 0.3s ease-out',
                        animationDelay: `${index * 50}ms`,
                        animationFillMode: 'both'
                      }}
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                            {booking.guestName?.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-dark text-base mb-1 truncate">{booking.guestName}</div>
                            <div className="text-sm text-dark-light mb-1 truncate">{booking.guestEmail}</div>
                            <div className="text-sm text-dark-light mb-2">{booking.guestPhone}</div>
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 rounded-lg">
                              <span className="text-xs font-bold text-primary">
                                Code: {booking.accessCode}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <div className="w-6 h-6 rounded-lg bg-green-100 flex items-center justify-center">
                              <FaCalendarAlt className="text-green-600 text-xs" />
                            </div>
                            <span className="font-semibold text-dark">{formatDate(booking.checkInDate)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <div className="w-6 h-6 rounded-lg bg-orange-100 flex items-center justify-center">
                              <FaClock className="text-orange-600 text-xs" />
                            </div>
                            <span className="text-dark-light">{formatDate(booking.checkOutDate)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        {booking.pack ? (
                          <div className="inline-flex items-center gap-2 px-3 py-2 bg-pink-50 border-2 border-pink-200 rounded-xl hover:shadow-md transition-shadow">
                            <FaBoxOpen className="text-pink-600" />
                            <span className="text-sm font-bold text-pink-700 truncate max-w-[120px]">{booking.pack.name}</span>
                          </div>
                        ) : (
                          <span className="text-dark-light text-sm font-medium">Standard</span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                          {formatPrice(booking.totalPrice)}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold shadow-md ${getStatusBadge(booking.status)}`}>
                          <StatusIcon className="text-sm" />
                          {getStatusLabel(booking.status)}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex gap-2 flex-wrap">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewDetails(booking)}
                            className="border-2 border-blue-500 text-blue-600 hover:bg-blue-50 hover:scale-110 transition-all"
                            title="View details"
                          >
                            <FaEye />
                          </Button>

                          {booking.status === 'CONFIRMED' && (
                            <Button 
                              size="sm" 
                              onClick={() => handleUpdateStatus(booking.id, 'CHECKED_IN')}
                              className="bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all"
                              title="Check-in"
                            >
                              <FaUserCheck />
                            </Button>
                          )}
                          
                          {booking.status === 'CHECKED_IN' && (
                            <Button 
                              size="sm" 
                              onClick={() => handleUpdateStatus(booking.id, 'CHECKED_OUT')}
                              className="bg-gray-500 hover:bg-gray-600 text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all"
                              title="Check-out"
                            >
                              <FaClock />
                            </Button>
                          )}

                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDeleteClick(booking)}
                            className="border-2 border-red-500 text-red-600 hover:bg-red-50 hover:scale-110 transition-all"
                            title="Delete booking"
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ✅ Mobile Cards View - Visible only on mobile/tablet */}
      <div className="lg:hidden space-y-3 sm:space-y-4">
        {filteredBookings.length === 0 ? (
          <Card className="p-8 sm:p-12">
            <div className="flex flex-col items-center gap-4 text-center animate-fade-in">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <FaSearch className="text-3xl sm:text-4xl text-gray-400" />
              </div>
              <div>
                <p className="text-lg sm:text-xl font-bold text-dark mb-2">
                  {searchTerm ? 'No results found' : 'No active bookings'}
                </p>
                <p className="text-sm text-dark-light">
                  {searchTerm 
                    ? 'Try different search terms' 
                    : 'New bookings will appear here'}
                </p>
              </div>
            </div>
          </Card>
        ) : (
          filteredBookings.map((booking, index) => {
            const StatusIcon = getStatusIcon(booking.status);
            return (
              <Card 
                key={booking.id}
                className="p-3 sm:p-4 border-2 border-gray-100 hover:shadow-xl transition-all"
                style={{ 
                  animation: 'slideIn 0.3s ease-out',
                  animationDelay: `${index * 50}ms`,
                  animationFillMode: 'both'
                }}
              >
                {/* Header */}
                <div className="flex items-start gap-3 mb-3 pb-3 border-b border-gray-100">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-lg sm:text-xl flex-shrink-0 shadow-lg">
                    {booking.guestName?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-dark text-base sm:text-lg mb-1 truncate">{booking.guestName}</h3>
                    <p className="text-xs sm:text-sm text-dark-light mb-1 truncate">{booking.guestEmail}</p>
                    <p className="text-xs sm:text-sm text-dark-light">{booking.guestPhone}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold shadow-md flex-shrink-0 ${getStatusBadge(booking.status)}`}>
                    <StatusIcon className="text-xs sm:text-sm" />
                    <span className="hidden sm:inline">{getStatusLabel(booking.status)}</span>
                  </span>
                </div>

                {/* Info Grid */}
                <div className="space-y-2 sm:space-y-3 mb-3">
                  {/* Reference & Access Code */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                      <p className="text-[10px] text-blue-600 mb-0.5 font-bold uppercase">Reference</p>
                      <p className="text-xs sm:text-sm font-bold text-blue-700 truncate">{booking.bookingReference}</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                      <p className="text-[10px] text-green-600 mb-0.5 font-bold uppercase">Access Code</p>
                      <p className="text-xs sm:text-sm font-bold text-green-700">{booking.accessCode}</p>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg p-2">
                      <FaCalendarAlt className="text-green-600 text-xs flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] text-green-600 font-bold">Check-in</p>
                        <p className="text-xs font-semibold text-dark truncate">{formatDate(booking.checkInDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg p-2">
                      <FaClock className="text-orange-600 text-xs flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] text-orange-600 font-bold">Check-out</p>
                        <p className="text-xs font-semibold text-dark truncate">{formatDate(booking.checkOutDate)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Package if exists */}
                  {booking.pack && (
                    <div className="flex items-center gap-2 bg-pink-50 border border-pink-200 rounded-lg p-2">
                      <FaBoxOpen className="text-pink-600 flex-shrink-0" />
                      <span className="text-xs sm:text-sm font-bold text-pink-700 truncate">{booking.pack.name}</span>
                    </div>
                  )}

                  {/* Price */}
                  <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30 rounded-lg p-2 flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-bold text-dark">Total Price</span>
                    <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                      {formatPrice(booking.totalPrice)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleViewDetails(booking)}
                    className="flex-1 border-2 border-blue-500 text-blue-600 hover:bg-blue-50 text-xs sm:text-sm"
                  >
                    <FaEye className="sm:mr-1" />
                    <span className="hidden sm:inline">Details</span>
                  </Button>

                  {booking.status === 'CONFIRMED' && (
                    <Button 
                      size="sm" 
                      onClick={() => handleUpdateStatus(booking.id, 'CHECKED_IN')}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white shadow-lg text-xs sm:text-sm"
                    >
                      <FaUserCheck className="sm:mr-1" />
                      <span className="hidden sm:inline">Check-in</span>
                    </Button>
                  )}
                  
                  {booking.status === 'CHECKED_IN' && (
                    <Button 
                      size="sm" 
                      onClick={() => handleUpdateStatus(booking.id, 'CHECKED_OUT')}
                      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white shadow-lg text-xs sm:text-sm"
                    >
                      <FaClock className="sm:mr-1" />
                      <span className="hidden sm:inline">Check-out</span>
                    </Button>
                  )}

                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDeleteClick(booking)}
                    className="border-2 border-red-500 text-red-600 hover:bg-red-50"
                  >
                    <FaTrash className="text-xs sm:text-sm" />
                  </Button>
                </div>
              </Card>
            );
          })
        )}
      </div>

            {/* ✅ Details Modal - Responsive + Anglais */}
      {selectedBooking && (
        <Modal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedBooking(null);
          }}
          title={
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-xl sm:text-2xl shadow-xl flex-shrink-0">
                {selectedBooking.guestName?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-base sm:text-lg md:text-xl break-words">Booking {selectedBooking.bookingReference}</div>
                <div className="text-xs sm:text-sm font-normal text-dark-light truncate">{selectedBooking.guestName}</div>
              </div>
            </div>
          }
        >
          <div className="space-y-4 sm:space-y-6">
            {/* Reference & Access Code */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <Card className="p-3 sm:p-4 md:p-5 border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-lg transition-shadow">
                <div className="text-[10px] sm:text-xs text-blue-700 mb-1 sm:mb-2 font-bold uppercase tracking-wide">Reference</div>
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600 break-all">{selectedBooking.bookingReference}</div>
              </Card>
              <Card className="p-3 sm:p-4 md:p-5 border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100 hover:shadow-lg transition-shadow">
                <div className="text-[10px] sm:text-xs text-green-700 mb-1 sm:mb-2 font-bold uppercase tracking-wide">Access Code</div>
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-green-600">{selectedBooking.accessCode}</div>
              </Card>
            </div>

            {/* Package Info */}
            {selectedBooking.pack && (
              <Card className="p-3 sm:p-4 md:p-5 border-2 border-pink-200 bg-gradient-to-r from-pink-50 to-rose-50 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-pink-500 flex items-center justify-center text-white shadow-lg flex-shrink-0">
                    <FaBoxOpen className="text-xl sm:text-2xl" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-pink-700 text-base sm:text-lg md:text-xl mb-0.5 sm:mb-1 break-words">{selectedBooking.pack.name}</h4>
                    <p className="text-xs sm:text-sm text-pink-600 font-semibold">
                      {selectedBooking.pack.durationDays} days · {formatPrice(selectedBooking.pack.promoPrice)}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Guest Info */}
            <div>
              <h4 className="font-bold text-dark mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base md:text-lg">
                <FaUser className="text-primary flex-shrink-0" />
                <span>Guest Information</span>
              </h4>
              <Card className="p-3 sm:p-4 md:p-5 bg-gradient-to-br from-gray-50 to-gray-100 space-y-2 sm:space-y-3 text-xs sm:text-sm border-2 border-gray-200">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-gray-200 gap-1">
                  <span className="text-dark-light font-semibold">Full Name</span>
                  <span className="font-bold text-dark break-words">{selectedBooking.guestName}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-gray-200 gap-1">
                  <span className="text-dark-light font-semibold">Email</span>
                  <span className="font-bold text-dark break-all">{selectedBooking.guestEmail}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 gap-1">
                  <span className="text-dark-light font-semibold">Phone</span>
                  <span className="font-bold text-dark">{selectedBooking.guestPhone}</span>
                </div>
              </Card>
            </div>

            {/* Dates */}
            <div>
              <h4 className="font-bold text-dark mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base md:text-lg">
                <FaCalendarAlt className="text-primary flex-shrink-0" />
                <span>Stay Dates</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <Card className="p-3 sm:p-4 md:p-5 bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-200 hover:shadow-lg transition-shadow">
                  <div className="text-[10px] sm:text-xs text-green-700 mb-1 sm:mb-2 font-bold uppercase">Check-in</div>
                  <div className="font-bold text-green-700 text-sm sm:text-base md:text-lg break-words">{formatDate(selectedBooking.checkInDate)}</div>
                </Card>
                <Card className="p-3 sm:p-4 md:p-5 bg-gradient-to-br from-orange-50 to-red-100 border-2 border-orange-200 hover:shadow-lg transition-shadow">
                  <div className="text-[10px] sm:text-xs text-orange-700 mb-1 sm:mb-2 font-bold uppercase">Check-out</div>
                  <div className="font-bold text-orange-700 text-sm sm:text-base md:text-lg break-words">{formatDate(selectedBooking.checkOutDate)}</div>
                </Card>
              </div>
            </div>

            {/* Beds */}
            {selectedBooking.beds && selectedBooking.beds.length > 0 && (
              <div>
                <h4 className="font-bold text-dark mb-2 sm:mb-3 text-sm sm:text-base md:text-lg flex items-center gap-2">
                  <FaBed className="text-primary flex-shrink-0" />
                  <span>Reserved Beds</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {selectedBooking.beds.map((bed, index) => (
                    <Card key={index} className="p-3 sm:p-4 bg-purple-50 border-2 border-purple-200 hover:shadow-md transition-shadow">
                      <div className="text-xs sm:text-sm font-bold text-purple-700">
                        Room {bed.roomNumber} - Bed {bed.bedNumber}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Services */}
            {selectedBooking.services && selectedBooking.services.length > 0 && (
              <div>
                <h4 className="font-bold text-dark mb-2 sm:mb-3 text-sm sm:text-base md:text-lg">Included Services</h4>
                <div className="space-y-2 sm:space-y-3">
                  {selectedBooking.services.map((service, index) => (
                    <Card key={index} className="p-3 sm:p-4 bg-orange-50 border-2 border-orange-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 hover:shadow-md transition-shadow">
                      <span className="font-bold text-orange-700 text-sm sm:text-base break-words">{service.name}</span>
                      <span className="text-lg sm:text-xl font-bold text-orange-600 whitespace-nowrap">{formatPrice(service.price)}</span>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {selectedBooking.notes && (
              <div>
                <h4 className="font-bold text-dark mb-2 sm:mb-3 text-sm sm:text-base md:text-lg">Special Notes</h4>
                <Card className="p-3 sm:p-4 md:p-5 bg-yellow-50 border-l-4 border-yellow-400">
                  <p className="text-xs sm:text-sm text-yellow-800 leading-relaxed break-words">{selectedBooking.notes}</p>
                </Card>
              </div>
            )}

            {/* Total Price */}
            <Card className="p-4 sm:p-5 md:p-6 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-2 border-primary/30 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <span className="text-lg sm:text-xl md:text-2xl font-bold text-dark">Total Amount</span>
                <span className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent break-all">
                  {formatPrice(selectedBooking.totalPrice)}
                </span>
              </div>
            </Card>
          </div>
        </Modal>
      )}

      {/* ✅ Delete Confirmation Modal - Responsive + Anglais */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={handleCancelDelete}
        title="⚠️ Confirmation Required"
      >
        <div className="text-center py-4 sm:py-6 md:py-8">
          <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center mb-4 sm:mb-6 animate-pulse">
            <FaExclamationTriangle className="text-3xl sm:text-4xl text-red-600" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-dark mb-2 sm:mb-3 break-words px-2">
            Delete this booking?
          </h3>
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 sm:p-4 mb-3 sm:mb-4">
            <p className="text-xs sm:text-sm text-dark-light mb-1 sm:mb-2">
              Reference: <strong className="text-red-600 text-sm sm:text-base md:text-lg break-all">{bookingToDelete?.bookingReference}</strong>
            </p>
            <p className="text-xs sm:text-sm text-dark-light">
              Guest: <strong className="text-dark break-words">{bookingToDelete?.guestName}</strong>
            </p>
          </div>
          <p className="text-xs sm:text-sm text-red-600 font-semibold mb-4 sm:mb-6 px-2">
            ⚠️ This action is irreversible and will permanently delete the booking
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button
              variant="outline"
              onClick={handleCancelDelete}
              className="flex-1 border-2 hover:bg-gray-50 text-sm sm:text-base"
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              className={`flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl text-sm sm:text-base ${deleting ? 'opacity-75 cursor-not-allowed' : ''}`}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="ml-2">Deleting...</span>
                </>
              ) : (
                <>
                  <FaTrash className="flex-shrink-0" />
                  <span className="ml-2">Delete Permanently</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default BookingsManagementPage;

