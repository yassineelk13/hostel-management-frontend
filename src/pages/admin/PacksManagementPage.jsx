import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaBoxOpen, FaExclamationTriangle, FaCheck, FaPercentage, FaClock, FaTags, FaDoorOpen, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import ImageUpload from '../../components/common/ImageUpload';
import Loader from '../../components/common/Loader';
import { packsAPI, servicesAPI, roomsAPI } from '../../services/api';
import { formatPrice } from '../../utils/priceFormatter';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PacksManagementPage = () => {
  const [packs, setPacks] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [packToDelete, setPackToDelete] = useState(null);
  const [editingPack, setEditingPack] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    originalPrice: '',
    promoPrice: '',
    duration: '',
    roomType: 'DOUBLE',
    serviceIds: [],
    photos: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [packsRes, servicesRes] = await Promise.all([
        packsAPI.getAll(),
        servicesAPI.getAll()
      ]);
      setPacks(packsRes.data.data);
      setServices(servicesRes.data.data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('❌ Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePhotosChange = (photos) => {
    setFormData({
      ...formData,
      photos: photos
    });
  };

  const handleServiceToggle = (serviceId) => {
    setFormData(prev => ({
      ...prev,
      serviceIds: prev.serviceIds.includes(serviceId)
        ? prev.serviceIds.filter(id => id !== serviceId)
        : [...prev.serviceIds, serviceId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    
    if (formData.originalPrice && parseFloat(formData.promoPrice) >= parseFloat(formData.originalPrice)) {
      toast.error('❌ Promo price must be lower than regular price!');
      setUploading(false);
      return;
    }

    if (formData.serviceIds.length === 0) {
      toast.error('❌ Select at least one service!');
      setUploading(false);
      return;
    }

    try {
      let photoUrls = [];

      if (!editingPack && formData.photos.length > 0 && formData.photos[0] instanceof File) {
        setUploadProgress({ current: 0, total: formData.photos.length });
        
        for (let i = 0; i < formData.photos.length; i++) {
          const file = formData.photos[i];
          const photoFormData = new FormData();
          photoFormData.append('photo', file);
          
          try {
            const response = await roomsAPI.uploadPhoto(photoFormData);
            
            if (response.data.success) {
              photoUrls.push(response.data.data);
              setUploadProgress({ current: i + 1, total: formData.photos.length });
            }
          } catch (error) {
            console.error(`Error uploading photo ${i + 1}:`, error);
            toast.warning(`⚠️ Error photo ${i + 1}`);
          }
        }
      } else {
        photoUrls = formData.photos.filter(p => typeof p === 'string');
      }

      const dataToSend = {
        name: formData.name,
        description: formData.description,
        durationDays: parseInt(formData.duration),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        promoPrice: parseFloat(formData.promoPrice),
        roomType: formData.roomType,
        photos: photoUrls,
        includedServiceIds: formData.serviceIds
      };

      if (editingPack) {
        await packsAPI.update(editingPack.id, dataToSend);
        toast.success('✅ Package updated successfully!');
      } else {
        await packsAPI.create(dataToSend);
        toast.success('✅ Package created successfully!');
      }

      handleCloseModal();
      fetchData();
      
    } catch (error) {
      console.error('Error:', error);
      toast.error(`❌ ${error.response?.data?.message || 'Error saving package'}`);
    } finally {
      setUploading(false);
      setUploadProgress({ current: 0, total: 0 });
    }
  };

  const handleEdit = (pack) => {
    setEditingPack(pack);
    setFormData({
      name: pack.name,
      description: pack.description,
      originalPrice: pack.originalPrice?.toString() || '',
      promoPrice: pack.promoPrice.toString(),
      duration: pack.durationDays?.toString() || pack.duration?.toString() || '',
      roomType: pack.roomType || 'DOUBLE',
      serviceIds: pack.includedServices ? pack.includedServices.map(s => s.id) : [],
      photos: pack.photos || []
    });
    setShowModal(true);
  };

  const handleDeleteClick = (pack) => {
    setPackToDelete(pack);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!packToDelete) return;

    try {
      await packsAPI.delete(packToDelete.id);
      toast.success('✅ Package deactivated successfully!');
      setShowDeleteConfirm(false);
      setPackToDelete(null);
      fetchData();
    } catch (error) {
      console.error('Error:', error);
      toast.error('❌ Error deleting package');
    }
  };

  const handleReactivate = async (id) => {
    try {
      await packsAPI.update(id, { isActive: true });
      toast.success('✅ Package reactivated successfully!');
      fetchData();
    } catch (error) {
      console.error('Error:', error);
      toast.error('❌ Error reactivating package');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPack(null);
    setFormData({
      name: '',
      description: '',
      originalPrice: '',
      promoPrice: '',
      duration: '',
      roomType: 'DOUBLE',
      serviceIds: [],
      photos: []
    });
  };

  const calculateEconomies = (original, promo) => {
    return original - promo;
  };

  const calculateDiscount = (original, promo) => {
    return Math.round((1 - promo / original) * 100);
  };

  const getRoomTypeLabel = (type) => {
    const labels = {
      SINGLE: 'Single',
      DOUBLE: 'Double',
      DORTOIR: 'Dormitory'
    };
    return labels[type] || type;
  };

  const getRoomTypeColor = (type) => {
    const colors = {
      SINGLE: 'bg-blue-500',
      DOUBLE: 'bg-purple-500',
      DORTOIR: 'bg-green-500'
    };
    return colors[type] || 'bg-gray-500';
  };

  const activePacks = packs.filter(p => p.isActive !== false);
  const inactivePacks = packs.filter(p => p.isActive === false);

  if (loading) return <Loader />;

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6 animate-fade-in">
      {/* ✅ Header responsive + Anglais */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 sm:gap-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-display font-bold text-dark mb-2 flex items-center gap-2 sm:gap-3">
            <span className="inline-block w-1.5 sm:w-2 h-8 sm:h-10 bg-gradient-to-b from-pink-500 to-rose-700 rounded-full flex-shrink-0" />
            <span className="break-words">Packages Management</span>
          </h1>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-dark-light">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0" />
              <span>{activePacks.length} active</span>
            </div>
            {inactivePacks.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
                <span>{inactivePacks.length} deactivated</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <Card className="p-3 sm:p-4 border-2 border-pink-200 bg-gradient-to-br from-pink-50 to-rose-100 min-w-[120px] sm:min-w-[140px] flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-pink-500 flex items-center justify-center text-white flex-shrink-0">
              <FaBoxOpen className="text-sm sm:text-base" />
            </div>
            <div className="min-w-0">
              <div className="text-xl sm:text-2xl font-bold text-pink-700">{packs.length}</div>
              <div className="text-[10px] sm:text-xs text-pink-600 font-semibold truncate">Total packages</div>
            </div>
          </div>
        </Card>
      </div>

      {/* ✅ Add button responsive */}
      <div className="flex justify-end">
        <Button 
          onClick={() => setShowModal(true)}
          className="shadow-xl hover:shadow-2xl group bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-sm sm:text-base w-full sm:w-auto"
        >
          <FaPlus className="group-hover:rotate-90 transition-transform duration-300 flex-shrink-0" />
          <span>Create Package</span>
        </Button>
      </div>

      {/* ✅ Packs Grid responsive */}
      {packs.length === 0 ? (
        <Card className="p-8 sm:p-12 md:p-16 text-center border-2 border-dashed border-gray-300">
          <div className="flex flex-col items-center gap-4 sm:gap-6 animate-fade-in">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-pink-100 to-rose-200 flex items-center justify-center">
              <FaBoxOpen className="text-4xl sm:text-5xl text-pink-400" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-dark mb-2 break-words">No packages created</p>
              <p className="text-sm sm:text-base text-dark-light mb-4 sm:mb-6">Create your first package to attract customers</p>
              <Button onClick={() => setShowModal(true)} className="text-sm sm:text-base">
                <FaPlus className="flex-shrink-0" />
                <span>Create Package</span>
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {packs.map((pack, index) => {
            const discount = pack.originalPrice ? calculateDiscount(pack.originalPrice, pack.promoPrice) : 0;
            
            return (
              <Card 
                key={pack.id} 
                className={`overflow-hidden border-2 hover:shadow-2xl transition-all duration-300 group ${
                  pack.isActive === false 
                    ? 'border-red-300 opacity-75' 
                    : 'border-gray-100 hover:border-pink-300'
                }`}
                style={{ 
                  animation: 'slideUp 0.4s ease-out',
                  animationDelay: `${index * 100}ms`,
                  animationFillMode: 'both'
                }}
              >
                {/* Status Banner */}
                {pack.isActive === false && (
                  <div className="bg-gradient-to-r from-red-500 to-red-600 text-white text-center py-2 sm:py-2.5 font-bold text-xs sm:text-sm flex items-center justify-center gap-2">
                    <FaTimesCircle className="flex-shrink-0" />
                    <span>PACKAGE DEACTIVATED</span>
                  </div>
                )}

                {/* Image */}
                <div className="relative h-48 sm:h-56 bg-gradient-to-br from-pink-100 via-rose-100 to-orange-100 overflow-hidden">
                  {pack.photos && pack.photos.length > 0 ? (
                    <img 
                      src={pack.photos[0]} 
                      alt={pack.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FaBoxOpen className="text-5xl sm:text-7xl text-pink-300" />
                    </div>
                  )}
                  
                  {/* Discount badge */}
                  {pack.originalPrice && pack.isActive !== false && (
                    <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-2xl animate-pulse">
                        <div className="text-center">
                          <div className="text-white font-bold text-lg sm:text-xl">-{discount}%</div>
                          <div className="text-white text-[10px] sm:text-xs">OFF</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Room type badge */}
                  <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
                    <span className={`inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 ${getRoomTypeColor(pack.roomType)} text-white rounded-full text-[10px] sm:text-xs font-bold shadow-lg`}>
                      <FaDoorOpen className="flex-shrink-0" />
                      <span className="hidden xs:inline">{getRoomTypeLabel(pack.roomType)}</span>
                    </span>
                  </div>

                  {/* Duration badge */}
                  <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4">
                    <span className="inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-black/70 backdrop-blur-sm text-white rounded-full text-[10px] sm:text-xs font-bold">
                      <FaClock className="flex-shrink-0" />
                      <span>{pack.durationDays || pack.duration} day{(pack.durationDays || pack.duration) > 1 ? 's' : ''}</span>
                    </span>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-dark mb-2 sm:mb-3 line-clamp-2 break-words">{pack.name}</h3>
                  <p className="text-dark-light text-xs sm:text-sm mb-4 sm:mb-5 line-clamp-2 leading-relaxed">
                    {pack.description}
                  </p>
                  
                  {/* Price Card */}
                  <Card className="p-3 sm:p-4 mb-4 sm:mb-5 bg-gradient-to-br from-pink-50 to-rose-50 border-2 border-pink-200">
                    {pack.originalPrice && (
                      <div className="flex items-center justify-between mb-1 sm:mb-2">
                        <span className="text-xs sm:text-sm text-dark-light">Regular price</span>
                        <span className="text-base sm:text-lg line-through text-dark-light">{formatPrice(pack.originalPrice)}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between mb-1 sm:mb-2">
                      <span className="text-xs sm:text-sm font-bold text-pink-700">Package price</span>
                      <span className="text-2xl sm:text-3xl font-bold text-pink-600">{formatPrice(pack.promoPrice)}</span>
                    </div>
                    {pack.originalPrice && (
                      <div className="pt-2 border-t border-pink-200">
                        <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-green-600 font-bold">
                          <FaTags className="flex-shrink-0" />
                          <span>Save {formatPrice(calculateEconomies(pack.originalPrice, pack.promoPrice))}</span>
                        </div>
                      </div>
                    )}
                  </Card>

                  {/* Services */}
                  {pack.includedServices && pack.includedServices.length > 0 && (
                    <div className="mb-4 sm:mb-5">
                      <p className="text-[10px] sm:text-xs font-bold text-dark mb-2 flex items-center gap-1.5 sm:gap-2">
                        <FaCheckCircle className="text-green-500 flex-shrink-0" />
                        <span>Included services</span>
                      </p>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {pack.includedServices.slice(0, 3).map(service => (
                          <span key={service.id} className="text-[10px] sm:text-xs bg-green-100 text-green-700 px-2 sm:px-2.5 py-1 rounded-full font-semibold break-words">
                            ✓ {service.name}
                          </span>
                        ))}
                        {pack.includedServices.length > 3 && (
                          <span className="text-[10px] sm:text-xs bg-gray-200 text-dark px-2 sm:px-2.5 py-1 rounded-full font-semibold">
                            +{pack.includedServices.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 sm:gap-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 border-2 border-pink-500 text-pink-600 hover:bg-pink-50 hover:scale-105 transition-all text-xs sm:text-sm"
                      onClick={() => handleEdit(pack)}
                    >
                      <FaEdit className="flex-shrink-0" />
                      <span className="hidden xs:inline ml-1">Edit</span>
                    </Button>
                    
                    {pack.isActive === false ? (
                      <Button 
                        size="sm" 
                        className="bg-green-500 hover:bg-green-600 text-white hover:scale-105 transition-all shadow-lg flex-shrink-0"
                        onClick={() => handleReactivate(pack.id)}
                        title="Reactivate this package"
                      >
                        <FaCheck />
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-2 border-red-500 text-red-600 hover:bg-red-50 hover:scale-105 transition-all flex-shrink-0"
                        onClick={() => handleDeleteClick(pack)}
                      >
                        <FaTrash className="text-xs sm:text-sm" />
                      </Button>
                    )}
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
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white flex-shrink-0">
              {editingPack ? <FaEdit className="text-sm sm:text-base" /> : <FaPlus className="text-sm sm:text-base" />}
            </div>
            <span className="text-base sm:text-lg break-words">{editingPack ? 'Edit Package' : 'Create Package'}</span>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-dark mb-2 sm:mb-3 flex items-center gap-2">
              <FaBoxOpen className="text-pink-500 flex-shrink-0" />
              <span>Package Photos</span>
            </label>
            <ImageUpload
              images={formData.photos}
              onChange={handlePhotosChange}
              maxImages={5}
              acceptFiles={!editingPack}
            />
          </div>

          {/* Upload Progress */}
          {uploading && uploadProgress.total > 0 && (
            <Card className="p-4 sm:p-5 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-300 animate-pulse">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-blue-500 flex items-center justify-center animate-spin flex-shrink-0">
                    <FaBoxOpen className="text-white text-sm sm:text-base" />
                  </div>
                  <p className="font-bold text-blue-800 text-xs sm:text-sm truncate">Uploading...</p>
                </div>
                <p className="text-lg sm:text-xl font-bold text-blue-800 flex-shrink-0">
                  {uploadProgress.current} / {uploadProgress.total}
                </p>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-3 sm:h-4 overflow-hidden shadow-inner">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 sm:h-4 rounded-full transition-all duration-500 flex items-center justify-center"
                  style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                >
                  <span className="text-[10px] sm:text-xs font-bold text-white">
                    {Math.round((uploadProgress.current / uploadProgress.total) * 100)}%
                  </span>
                </div>
              </div>
              <p className="text-[10px] sm:text-xs text-blue-700 mt-2 sm:mt-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping flex-shrink-0" />
                <span>Do not close this window</span>
              </p>
            </Card>
          )}

          {/* Form Fields */}
          <Input
            label="Package Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Relax & Surf Package"
            required
          />

          <div>
            <label className="block text-xs sm:text-sm font-bold text-dark mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input resize-none w-full text-sm sm:text-base"
              rows="3"
              placeholder="Describe the benefits and features of this package..."
              required
            ></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <Input
              label="Regular Price (MAD)"
              type="number"
              step="0.01"
              name="originalPrice"
              value={formData.originalPrice}
              onChange={handleChange}
              placeholder="1500"
            />
            <Input
              label="Promo Price (MAD)"
              type="number"
              step="0.01"
              name="promoPrice"
              value={formData.promoPrice}
              onChange={handleChange}
              placeholder="1200"
              required
            />
            <Input
              label="Duration (days)"
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              placeholder="7"
              min="1"
              required
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-bold text-dark mb-2">
              Room Type <span className="text-red-500">*</span>
            </label>
            <select
              name="roomType"
              value={formData.roomType}
              onChange={handleChange}
              className="input w-full text-sm sm:text-base"
              required
            >
              <option value="SINGLE">🛏️ Single</option>
              <option value="DOUBLE">🛏️🛏️ Double</option>
              <option value="DORTOIR">🏠 Dormitory</option>
            </select>
          </div>

          {/* Savings Preview */}
          {formData.originalPrice && formData.promoPrice && parseFloat(formData.promoPrice) < parseFloat(formData.originalPrice) && (
            <Card className="p-4 sm:p-5 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-green-500 flex items-center justify-center text-white flex-shrink-0">
                  <FaPercentage className="text-lg sm:text-2xl" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-green-800 text-base sm:text-lg">
                    {calculateDiscount(parseFloat(formData.originalPrice), parseFloat(formData.promoPrice))}% discount
                  </p>
                  <p className="text-xs sm:text-sm text-green-700 break-words">
                    Save <strong>{formatPrice(calculateEconomies(parseFloat(formData.originalPrice), parseFloat(formData.promoPrice)))}</strong>
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Services Selection */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-dark mb-2 sm:mb-3 flex items-center gap-2">
              <FaCheckCircle className="text-green-500 flex-shrink-0" />
              <span>Included Services <span className="text-red-500">*</span></span>
            </label>
            {services.length === 0 ? (
              <Card className="p-4 sm:p-5 text-center bg-orange-50 border-2 border-orange-200">
                <p className="text-xs sm:text-sm text-orange-700 font-semibold">
                  ⚠️ No services available. Create services first.
                </p>
              </Card>
            ) : (
              <>
                <Card className="max-h-48 sm:max-h-60 overflow-y-auto border-2 border-gray-200">
                  <div className="divide-y divide-gray-100">
                    {services.map(service => (
                      <label 
                        key={service.id} 
                        className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 cursor-pointer hover:bg-green-50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.serviceIds.includes(service.id)}
                          onChange={() => handleServiceToggle(service.id)}
                          className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 border-2 border-gray-300 rounded focus:ring-green-500 flex-shrink-0"
                        />
                        <span className="text-xs sm:text-sm flex-1 font-medium text-dark break-words min-w-0">{service.name}</span>
                        <span className="text-xs sm:text-sm font-bold text-green-600 whitespace-nowrap">{formatPrice(service.price)}</span>
                      </label>
                    ))}
                  </div>
                </Card>
                <p className="text-[10px] sm:text-xs text-dark-light mt-2 flex items-center gap-2">
                  <FaTags className="text-green-500 flex-shrink-0" />
                  <span>{formData.serviceIds.length} service{formData.serviceIds.length !== 1 ? 's' : ''} selected</span>
                </p>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 border-t-2 border-gray-100">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCloseModal} 
              className="flex-1 border-2 text-sm sm:text-base"
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 shadow-lg hover:shadow-xl text-sm sm:text-base"
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin flex-shrink-0" />
                  <span>Upload {uploadProgress.current}/{uploadProgress.total}</span>
                </>
              ) : (
                <>
                  {editingPack ? <FaCheckCircle className="flex-shrink-0" /> : <FaPlus className="flex-shrink-0" />}
                  <span>{editingPack ? 'Update' : 'Create Package'}</span>
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
          setPackToDelete(null);
        }}
        title="⚠️ Deactivate Package"
      >
        <div className="text-center py-4 sm:py-6">
          <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center mb-4 sm:mb-6 animate-pulse">
            <FaExclamationTriangle className="text-3xl sm:text-4xl text-orange-600" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-dark mb-2 sm:mb-3 break-words px-2">
            Deactivate "{packToDelete?.name}"?
          </h3>
          <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-3 sm:p-4 mb-3 sm:mb-4">
            <p className="text-xs sm:text-sm text-dark-light break-words">
              The package will no longer be visible on the public website
            </p>
            <p className="text-xs sm:text-sm font-semibold text-orange-700 mt-2">
              💡 You can reactivate it later
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteConfirm(false);
                setPackToDelete(null);
              }}
              className="flex-1 border-2 text-sm sm:text-base"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg text-sm sm:text-base"
            >
              <FaTrash className="flex-shrink-0" />
              <span>Deactivate</span>
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

export default PacksManagementPage;
