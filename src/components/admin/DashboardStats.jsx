import { FaBed, FaCalendarCheck, FaDollarSign, FaUsers } from 'react-icons/fa';
import Card from '../common/Card';

const DashboardStats = ({ stats }) => {
  const statCards = [
    {
      title: 'Chambres',
      value: stats.totalRooms || 0,
      icon: FaBed,
      color: 'bg-blue-500',
    },
    {
      title: 'Réservations',
      value: stats.totalBookings || 0,
      icon: FaCalendarCheck,
      color: 'bg-green-500',
    },
    {
      title: 'Check-ins Aujourd\'hui',
      value: stats.todayCheckIns || 0,
      icon: FaUsers,
      color: 'bg-orange-500',
    },
    {
      title: 'Revenus du mois',
      value: `${stats.monthlyRevenue || 0} €`,
      icon: FaDollarSign,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat, index) => (
        <Card key={index} className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-light text-sm mb-1">{stat.title}</p>
              <h3 className="text-3xl font-bold text-dark">{stat.value}</h3>
            </div>
            <div className={`p-4 rounded-full ${stat.color}`}>
              <stat.icon className="text-2xl text-white" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats;
