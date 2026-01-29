import { useState, useEffect } from 'react';
import { FaCalendarAlt, FaClock, FaUserCheck, FaUserClock } from 'react-icons/fa';
import DashboardStats from '../../components/admin/DashboardStats';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import { bookingsAPI, roomsAPI } from '../../services/api';
import { formatDate } from '../../utils/dateHelpers';


const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalRooms: 0,
    totalBookings: 0,
    todayCheckIns: 0,
    monthlyRevenue: 0,
  });
  const [checkIns, setCheckIns] = useState([]);
  const [checkOuts, setCheckOuts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchData();
    
    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    try {
      const [roomsRes, bookingsRes, checkInsRes, checkOutsRes] = await Promise.all([
        roomsAPI.getAll(),
        bookingsAPI.getAll(),
        bookingsAPI.getCheckIns(),
        bookingsAPI.getCheckOuts(),
      ]);

      setStats({
        totalRooms: roomsRes.data.data.length,
        totalBookings: bookingsRes.data.data.length,
        todayCheckIns: checkInsRes.data.data.length,
        monthlyRevenue: bookingsRes.data.data
          .reduce((sum, b) => sum + parseFloat(b.totalPrice), 0)
          .toFixed(2),
      });

      setCheckIns(checkInsRes.data.data.slice(0, 5));
      setCheckOuts(checkOutsRes.data.data.slice(0, 5));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  // ✅ Dates en anglais
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
  };

  const formatFullDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-8">
      {/* ✅ Header with welcome & time - Responsive */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-dark mb-2 flex items-center gap-2 sm:gap-3">
            <span className="inline-block w-1.5 sm:w-2 h-6 sm:h-8 bg-primary rounded-full flex-shrink-0" />
            <span className="break-words">Dashboard</span>
          </h1>
          <p className="text-sm sm:text-base text-dark-light break-words">Overview of your Shams House hostel</p>
        </div>
        
        {/* ✅ Real-time clock card - Responsive */}
        <Card className="p-3 sm:p-4 border-2 border-primary/20 bg-gradient-to-br from-white to-primary/5 flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <FaClock className="text-xl sm:text-2xl text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-dark-light">Today</p>
              <p className="font-bold text-dark text-base sm:text-lg">{formatTime(currentTime)}</p>
              <p className="text-[10px] sm:text-xs text-dark-light truncate">{formatFullDate(currentTime)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Stats Cards */}
      <DashboardStats stats={stats} />

      {/* ✅ Check-ins & Check-outs Grid - Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* ✅ Check-ins Card - Responsive + Anglais */}
        <Card className="overflow-hidden border-2 border-green-100">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 sm:p-6">
            <div className="flex items-center justify-between text-white gap-3">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                  <FaUserCheck className="text-xl sm:text-2xl" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base sm:text-xl font-bold truncate">Today's Check-ins</h2>
                  <p className="text-xs sm:text-sm text-white/80">
                    {checkIns.length} arrival{checkIns.length !== 1 ? 's' : ''} expected
                  </p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-2xl sm:text-3xl font-bold">{checkIns.length}</div>
                <div className="text-xs text-white/80">Total</div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6">
            {checkIns.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="inline-block p-4 sm:p-6 bg-green-50 rounded-full mb-3 sm:mb-4">
                  <FaUserCheck className="text-3xl sm:text-4xl text-green-400" />
                </div>
                <p className="text-dark-light font-medium text-sm sm:text-base">No check-ins today</p>
                <p className="text-xs sm:text-sm text-dark-light mt-2">All guests have already arrived</p>
              </div>
            ) : (
              <div className="space-y-3">
                {checkIns.map((booking, index) => (
                  <div 
                    key={booking.id} 
                    className="group relative overflow-hidden p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-xl transition-all duration-300 border-2 border-green-100 hover:border-green-300 hover:shadow-lg"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Number badge */}
                    <div className="absolute top-2 sm:top-3 left-2 sm:left-3 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green-500 text-white text-[10px] sm:text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pl-7 sm:pl-8">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-dark text-base sm:text-lg mb-1 truncate">{booking.guestName}</p>
                        <p className="text-xs sm:text-sm text-dark-light mb-2 truncate">{booking.guestEmail}</p>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-green-500 text-white text-[10px] sm:text-xs font-semibold rounded-full whitespace-nowrap">
                            Ref: {booking.bookingReference}
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0 sm:text-right">
                        <div className="px-3 sm:px-4 py-2 bg-white rounded-lg shadow-sm border border-green-200 inline-block">
                          <p className="text-[10px] sm:text-xs text-dark-light mb-1">Access Code</p>
                          <p className="text-xl sm:text-2xl font-bold text-green-600">{booking.accessCode}</p>
                        </div>
                      </div>
                    </div>

                    {/* Hover indicator */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* ✅ Check-outs Card - Responsive + Anglais */}
        <Card className="overflow-hidden border-2 border-orange-100">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-orange-500 to-red-600 p-4 sm:p-6">
            <div className="flex items-center justify-between text-white gap-3">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                  <FaUserClock className="text-xl sm:text-2xl" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base sm:text-xl font-bold truncate">Today's Check-outs</h2>
                  <p className="text-xs sm:text-sm text-white/80">
                    {checkOuts.length} departure{checkOuts.length !== 1 ? 's' : ''} expected
                  </p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-2xl sm:text-3xl font-bold">{checkOuts.length}</div>
                <div className="text-xs text-white/80">Total</div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6">
            {checkOuts.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="inline-block p-4 sm:p-6 bg-orange-50 rounded-full mb-3 sm:mb-4">
                  <FaUserClock className="text-3xl sm:text-4xl text-orange-400" />
                </div>
                <p className="text-dark-light font-medium text-sm sm:text-base">No check-outs today</p>
                <p className="text-xs sm:text-sm text-dark-light mt-2">All departures are complete</p>
              </div>
            ) : (
              <div className="space-y-3">
                {checkOuts.map((booking, index) => (
                  <div 
                    key={booking.id} 
                    className="group relative overflow-hidden p-3 sm:p-4 bg-gradient-to-r from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 rounded-xl transition-all duration-300 border-2 border-orange-100 hover:border-orange-300 hover:shadow-lg"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Number badge */}
                    <div className="absolute top-2 sm:top-3 left-2 sm:left-3 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-orange-500 text-white text-[10px] sm:text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pl-7 sm:pl-8">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-dark text-base sm:text-lg mb-1 truncate">{booking.guestName}</p>
                        <p className="text-xs sm:text-sm text-dark-light mb-2 truncate">{booking.guestEmail}</p>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-orange-500 text-white text-[10px] sm:text-xs font-semibold rounded-full whitespace-nowrap">
                            Ref: {booking.bookingReference}
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0 sm:text-right">
                        <div className="px-3 sm:px-4 py-2 bg-white rounded-lg shadow-sm border border-orange-200 inline-block">
                          <p className="text-[10px] sm:text-xs text-dark-light mb-1">Deadline</p>
                          <p className="text-xl sm:text-2xl font-bold text-orange-600">12:00 PM</p>
                        </div>
                      </div>
                    </div>

                    {/* Hover indicator */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* ✅ Quick Actions - Responsive + Anglais */}
      <Card className="p-4 sm:p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/20">
        <h3 className="font-bold text-dark mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
          <div className="w-1 h-5 sm:h-6 bg-primary rounded-full flex-shrink-0" />
          <span>Quick Actions</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          <button className="p-3 sm:p-4 bg-white rounded-xl border-2 border-gray-100 hover:border-primary hover:shadow-lg transition-all group text-left">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors flex-shrink-0">
                <FaCalendarAlt className="text-sm sm:text-base" />
              </div>
              <span className="font-semibold text-dark text-xs sm:text-sm md:text-base">New Booking</span>
            </div>
          </button>
          <button className="p-3 sm:p-4 bg-white rounded-xl border-2 border-gray-100 hover:border-primary hover:shadow-lg transition-all group text-left">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors flex-shrink-0">
                <FaUserCheck className="text-sm sm:text-base" />
              </div>
              <span className="font-semibold text-dark text-xs sm:text-sm md:text-base">Register Check-in</span>
            </div>
          </button>
          <button className="p-3 sm:p-4 bg-white rounded-xl border-2 border-gray-100 hover:border-primary hover:shadow-lg transition-all group text-left sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors flex-shrink-0">
                <FaUserClock className="text-sm sm:text-base" />
              </div>
              <span className="font-semibold text-dark text-xs sm:text-sm md:text-base">Register Check-out</span>
            </div>
          </button>
        </div>
      </Card>
    </div>
  );
};

export default DashboardPage;
