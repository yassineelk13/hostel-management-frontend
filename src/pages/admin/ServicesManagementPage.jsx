import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaConciergeBell, FaUtensils, FaHiking, FaCar, FaEllipsisH, FaCheckCircle, FaExclamationTriangle, FaClock, FaMoneyBillWave } from 'react-icons/fa';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import { servicesAPI } from '../../services/api';
import { formatPrice } from '../../utils/priceFormatter';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ServicesManagementPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'MEAL',
    priceType: 'FIXED'
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await servicesAPI.getAll();
      setServices(response.data.data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('❌ Error loading services');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price.toString(),
      category: service.category,
      priceType: service.priceType || 'FIXED'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingService) {
        await servicesAPI.update(editingService.id, formData);
        toast.success('✅ Service updated successfully!');
      } else {
        await servicesAPI.create(formData);
        toast.success('✅ Service created successfully!');
      }
      
      handleCloseModal();
      fetchServices();
    } catch (error) {
      console.error('Error:', error);
      toast.error(`❌ ${error.response?.data?.message || 'Error saving service'}`);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingService(null);
    setFormData({ 
      name: '', 
      description: '', 
      price: '', 
      category: 'MEAL', 
      priceType: 'FIXED' 
    });
  };

  const handleDeleteClick = (service) => {
    setServiceToDelete(service);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!serviceToDelete) return;
    
    try {
      await servicesAPI.delete(serviceToDelete.id);
      toast.success('✅ Service deleted successfully!');
      setShowDeleteConfirm(false);
      setServiceToDelete(null);
      fetchServices();
    } catch (error) {
      console.error('Error:', error);
      toast.error('❌ Error deleting service');
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      MEAL: FaUtensils,
      ACTIVITY: FaHiking,
      TRANSPORT: FaCar,
      OTHER: FaEllipsisH
    };
    return icons[category] || FaConciergeBell;
  };

  const getCategoryLabel = (category) => {
    const labels = {
      MEAL: 'Meals',
      ACTIVITY: 'Activity',
      TRANSPORT: 'Transport',
      OTHER: 'Other'
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category) => {
    const colors = {
      MEAL: { bg: 'bg-orange-500', light: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-200' },
      ACTIVITY: { bg: 'bg-blue-500', light: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200' },
      TRANSPORT: { bg: 'bg-purple-500', light: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200' },
      OTHER: { bg: 'bg-gray-500', light: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' }
    };
    return colors[category] || colors.OTHER;
  };

  const getPriceTypeLabel = (priceType) => {
    return priceType === 'PER_NIGHT' ? 'Per night' : 'Fixed';
  };

  const servicesByCategory = {
    MEAL: services.filter(s => s.category === 'MEAL'),
    ACTIVITY: services.filter(s => s.category === 'ACTIVITY'),
    TRANSPORT: services.filter(s => s.category === 'TRANSPORT'),
    OTHER: services.filter(s => s.category === 'OTHER')
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6 animate-fade-in">
      {/* ✅ Header responsive + Anglais */}
      <div className="flex flex-col gap-4 sm:gap-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-display font-bold text-dark mb-2 flex items-center gap-2 sm:gap-3">
            <span className="inline-block w-1.5 sm:w-2 h-8 sm:h-10 bg-gradient-to-b from-orange-500 to-orange-700 rounded-full flex-shrink-0" />
            <span className="break-words">Services Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-dark-light flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0" />
            <span>{services.length} service{services.length !== 1 ? 's' : ''} total</span>
          </p>
        </div>

        {/* ✅ Quick Stats - Grid responsive 2x2 mobile, 4 colonnes desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
          {[
            { label: 'Meals', count: servicesByCategory.MEAL.length, icon: FaUtensils, color: 'orange' },
            { label: 'Activities', count: servicesByCategory.ACTIVITY.length, icon: FaHiking, color: 'blue' },
            { label: 'Transport', count: servicesByCategory.TRANSPORT.length, icon: FaCar, color: 'purple' },
            { label: 'Other', count: servicesByCategory.OTHER.length, icon: FaEllipsisH, color: 'gray' }
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className={`p-2 sm:p-3 border-2 border-${stat.color}-200 bg-gradient-to-br from-${stat.color}-50 to-${stat.color}-100`}>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-${stat.color}-500 flex items-center justify-center text-white flex-shrink-0`}>
                    <Icon className="text-xs sm:text-sm" />
                  </div>
                  <div className="min-w-0">
                    <div className={`text-base sm:text-lg font-bold text-${stat.color}-700`}>{stat.count}</div>
                    <div className={`text-[10px] sm:text-xs text-${stat.color}-600 font-semibold truncate`}>{stat.label}</div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ✅ Add button responsive */}
      <div className="flex justify-end">
        <Button 
          onClick={() => setShowModal(true)}
          className="shadow-xl hover:shadow-2xl group bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-sm sm:text-base w-full sm:w-auto"
        >
          <FaPlus className="group-hover:rotate-90 transition-transform duration-300 flex-shrink-0" />
          <span>Create Service</span>
        </Button>
      </div>

      {/* ✅ Services Grid responsive */}
      {services.length === 0 ? (
        <Card className="p-8 sm:p-12 md:p-16 text-center border-2 border-dashed border-gray-300">
          <div className="flex flex-col items-center gap-4 sm:gap-6 animate-fade-in">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
              <FaConciergeBell className="text-4xl sm:text-5xl text-orange-400" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-dark mb-2 break-words">No services created</p>
              <p className="text-sm sm:text-base text-dark-light mb-4 sm:mb-6">Create services to enrich your packages</p>
              <Button onClick={() => setShowModal(true)} className="text-sm sm:text-base">
                <FaPlus className="flex-shrink-0" />
                <span>Create Service</span>
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {services.map((service, index) => {
            const Icon = getCategoryIcon(service.category);
            const colors = getCategoryColor(service.category);
            
            return (
              <Card 
                key={service.id} 
                className="overflow-hidden border-2 border-gray-100 hover:border-orange-300 hover:shadow-2xl transition-all duration-300 group"
                style={{ 
                  animation: 'slideUp 0.4s ease-out',
                  animationDelay: `${index * 100}ms`,
                  animationFillMode: 'both'
                }}
              >
                {/* Header avec icon */}
                <div className={`p-4 sm:p-6 bg-gradient-to-r ${colors.light} border-b-2 ${colors.border}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl ${colors.bg} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform flex-shrink-0`}>
                      <Icon className="text-lg sm:text-2xl" />
                    </div>
                    <div className="flex flex-col items-end gap-1.5 sm:gap-2 min-w-0">
                      <span className={`px-2 sm:px-3 py-1 sm:py-1.5 ${colors.light} ${colors.text} rounded-full text-[10px] sm:text-xs font-bold truncate max-w-full`}>
                        {getCategoryLabel(service.category)}
                      </span>
                      <span className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold flex items-center gap-1 flex-shrink-0 ${
                        service.priceType === 'PER_NIGHT' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {service.priceType === 'PER_NIGHT' ? <FaClock className="text-[10px] flex-shrink-0" /> : <FaCheckCircle className="text-[10px] flex-shrink-0" />}
                        <span className="whitespace-nowrap">{getPriceTypeLabel(service.priceType)}</span>
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-dark mb-2 sm:mb-3 line-clamp-2 break-words">{service.name}</h3>
                  <p className="text-dark-light text-xs sm:text-sm mb-4 sm:mb-5 line-clamp-2 leading-relaxed">
                    {service.description}
                  </p>
                  
                  {/* Price Card */}
                  <Card className="p-3 sm:p-4 mb-4 sm:mb-5 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                        <FaMoneyBillWave className="text-green-600 text-sm sm:text-base flex-shrink-0" />
                        <span className="text-xs sm:text-sm font-semibold text-green-700 truncate">Price</span>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-xl sm:text-2xl font-bold text-green-600 whitespace-nowrap">
                          {formatPrice(service.price)}
                        </span>
                        {service.priceType === 'PER_NIGHT' && (
                          <span className="text-[10px] sm:text-xs text-green-600 block">/night</span>
                        )}
                      </div>
                    </div>
                  </Card>

                  {/* Actions */}
                  <div className="flex gap-2 sm:gap-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 border-2 border-orange-500 text-orange-600 hover:bg-orange-50 hover:scale-105 transition-all text-xs sm:text-sm"
                      onClick={() => handleEdit(service)}
                    >
                      <FaEdit className="flex-shrink-0" />
                      <span className="hidden xs:inline ml-1">Edit</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-2 border-red-500 text-red-600 hover:bg-red-50 hover:scale-105 transition-all flex-shrink-0"
                      onClick={() => handleDeleteClick(service)}
                    >
                      <FaTrash className="text-xs sm:text-sm" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ✅ Add/Edit Modal - Responsive + Anglais */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center text-white flex-shrink-0">
              {editingService ? <FaEdit className="text-sm sm:text-base" /> : <FaPlus className="text-sm sm:text-base" />}
            </div>
            <span className="text-base sm:text-lg break-words">{editingService ? 'Edit Service' : 'Create Service'}</span>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
  <Input
    label="Service Name"
    name="name"
    value={formData.name}
    onChange={(e) => setFormData({...formData, name: e.target.value})}
    placeholder="Full breakfast"
    required
    disabled={isSubmitting} // ✅ Désactive pendant submit
  />
  
  <div>
    <label className="block text-xs sm:text-sm font-bold text-dark mb-2">
      Description <span className="text-red-500">*</span>
    </label>
    <textarea
      name="description"
      value={formData.description}
      onChange={(e) => setFormData({...formData, description: e.target.value})}
      className="input resize-none w-full text-sm sm:text-base"
      rows="3"
      placeholder="Describe the service in detail..."
      required
      disabled={isSubmitting} // ✅ Désactive pendant submit
    ></textarea>
  </div>

  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
    <div>
      <label className="block text-xs sm:text-sm font-bold text-dark mb-2">
        Category <span className="text-red-500">*</span>
      </label>
      <select
        name="category"
        value={formData.category}
        onChange={(e) => setFormData({...formData, category: e.target.value})}
        className="input w-full text-sm sm:text-base"
        required
        disabled={isSubmitting} // ✅ Désactive pendant submit
      >
        <option value="MEAL">🍽️ Meals</option>
        <option value="ACTIVITY">🏄 Activity</option>
        <option value="TRANSPORT">🚗 Transport</option>
        <option value="OTHER">📦 Other</option>
      </select>
    </div>

    <div>
      <label className="block text-xs sm:text-sm font-bold text-dark mb-2">
        Price Type <span className="text-red-500">*</span>
      </label>
      <select
        name="priceType"
        value={formData.priceType}
        onChange={(e) => setFormData({...formData, priceType: e.target.value})}
        className="input w-full text-sm sm:text-base"
        required
        disabled={isSubmitting} // ✅ Désactive pendant submit
      >
        <option value="FIXED">💰 Fixed</option>
        <option value="PER_NIGHT">🌙 Per night</option>
      </select>
    </div>
  </div>

  <Input
    label="Price (MAD)"
    type="number"
    step="0.01"
    name="price"
    value={formData.price}
    onChange={(e) => setFormData({...formData, price: e.target.value})}
    placeholder="50"
    required
    disabled={isSubmitting} // ✅ Désactive pendant submit
  />

  {/* Info Card */}
  <Card className={`p-3 sm:p-4 ${
    formData.priceType === 'PER_NIGHT' 
      ? 'bg-blue-50 border-2 border-blue-200' 
      : 'bg-green-50 border-2 border-green-200'
  }`}>
    <div className="flex items-start gap-2 sm:gap-3">
      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
        formData.priceType === 'PER_NIGHT' 
          ? 'bg-blue-500' 
          : 'bg-green-500'
      }`}>
        {formData.priceType === 'PER_NIGHT' ? (
          <FaClock className="text-white text-sm sm:text-base" />
        ) : (
          <FaCheckCircle className="text-white text-sm sm:text-base" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-xs sm:text-sm font-bold mb-0.5 sm:mb-1 ${
          formData.priceType === 'PER_NIGHT' 
            ? 'text-blue-800' 
            : 'text-green-800'
        }`}>
          {formData.priceType === 'PER_NIGHT' ? 'Price per night' : 'Fixed price'}
        </p>
        <p className={`text-[10px] sm:text-xs break-words ${
          formData.priceType === 'PER_NIGHT' 
            ? 'text-blue-700' 
            : 'text-green-700'
        }`}>
          {formData.priceType === 'PER_NIGHT' 
            ? '💡 Price will be multiplied by the number of nights' 
            : '💡 Price will be charged once during the stay'}
        </p>
      </div>
    </div>
  </Card>

  {/* Action Buttons */}
  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 border-t-2 border-gray-100">
    <Button 
      type="button" 
      variant="outline" 
      onClick={handleCloseModal} 
      disabled={isSubmitting} // ✅ Désactive Cancel pendant submit
      className={`flex-1 border-2 text-sm sm:text-base ${
        isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      Cancel
    </Button>
    <Button 
      type="submit" 
      disabled={isSubmitting}
      className={`flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl text-sm sm:text-base transition-all ${
        isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
      }`}
    >
      {isSubmitting ? (
        <>
          <FaSpinner className="animate-spin flex-shrink-0" />
          <span>{editingService ? 'Updating...' : 'Creating...'}</span>
        </>
      ) : editingService ? (
        <>
          <FaCheckCircle className="flex-shrink-0" />
          <span>Update</span>
        </>
      ) : (
        <>
          <FaPlus className="flex-shrink-0" />
          <span>Create</span>
        </>
      )}
    </Button>
  </div>
</form>

      </Modal>

      {/* ✅ Delete Confirmation Modal - Responsive + Anglais */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setServiceToDelete(null);
        }}
        title="⚠️ Delete Confirmation"
      >
        <div className="text-center py-4 sm:py-6">
          <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center mb-4 sm:mb-6 animate-pulse">
            <FaExclamationTriangle className="text-3xl sm:text-4xl text-red-600" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-dark mb-2 sm:mb-3 break-words px-2">
            Delete this service?
          </h3>
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 sm:p-4 mb-3 sm:mb-4">
            <p className="text-xs sm:text-sm text-dark-light mb-1 break-words">
              Service: <strong className="text-red-600 text-sm sm:text-base md:text-lg">{serviceToDelete?.name}</strong>
            </p>
            <p className="text-xs sm:text-sm text-dark-light">
              Category: <strong className="text-dark">{getCategoryLabel(serviceToDelete?.category)}</strong>
            </p>
          </div>
          <p className="text-xs sm:text-sm text-red-600 font-semibold mb-4 sm:mb-6 px-2">
            ⚠️ This action is irreversible
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteConfirm(false);
                setServiceToDelete(null);
              }}
              className="flex-1 border-2 text-sm sm:text-base"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg text-sm sm:text-base"
            >
              <FaTrash className="flex-shrink-0" />
              <span>Delete</span>
            </Button>
          </div>
        </div>
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

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ServicesManagementPage;
