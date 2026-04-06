import { useState, useEffect } from 'react';
import {
  FaPlus, FaEdit, FaTrash, FaConciergeBell, FaUtensils,
  FaHiking, FaCar, FaEllipsisH, FaCheckCircle,
  FaExclamationTriangle, FaClock, FaMoneyBillWave, FaUser, FaDoorOpen
} from 'react-icons/fa';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import { servicesAPI } from '../../services/api';
import { formatPrice } from '../../utils/priceFormatter';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORY_META = {
  MEAL:      { icon: FaUtensils, label: 'Meals',     color: { bg: 'bg-orange-500', light: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-200' } },
  ACTIVITY:  { icon: FaHiking,   label: 'Activity',  color: { bg: 'bg-blue-500',   light: 'bg-blue-100',   text: 'text-blue-600',   border: 'border-blue-200'   } },
  TRANSPORT: { icon: FaCar,      label: 'Transport', color: { bg: 'bg-purple-500', light: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200' } },
  OTHER:     { icon: FaEllipsisH,label: 'Other',     color: { bg: 'bg-gray-500',   light: 'bg-gray-100',   text: 'text-gray-600',   border: 'border-gray-200'   } },
};

const PRICE_TYPE_META = {
  FIXED:     { label: 'Fixed',    icon: FaCheckCircle, cls: 'bg-green-100 text-green-700' },
  PER_NIGHT: { label: 'Per night',icon: FaClock,       cls: 'bg-blue-100  text-blue-700'  },
};

// ✅ NEW: PER_PERSON charged per guest | PER_ROOM charged once for the room
const PRICING_TYPE_META = {
  PER_PERSON: { label: 'Per person', icon: FaUser,     cls: 'bg-indigo-100 text-indigo-700', tip: '💡 Price is multiplied by number of guests' },
  PER_ROOM:   { label: 'Per room',   icon: FaDoorOpen, cls: 'bg-amber-100  text-amber-700',  tip: '💡 Price is the same regardless of how many guests' },
};

// ─────────────────────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  category: 'MEAL',
  priceType: 'FIXED',
  pricingType: 'PER_PERSON',   // ✅ NEW
};

const ServicesManagementPage = () => {
  const [services, setServices]               = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [submitting, setSubmitting]           = useState(false);
  const [deleting, setDeleting]               = useState(false);
  const [showModal, setShowModal]             = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [editingService, setEditingService]   = useState(null);
  const [formData, setFormData]               = useState(EMPTY_FORM);

  useEffect(() => { fetchServices(); }, []);

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
      name:        service.name,
      description: service.description,
      price:       service.price.toString(),
      category:    service.category,
      priceType:   service.priceType   || 'FIXED',
      pricingType: service.pricingType || 'PER_PERSON',  // ✅ NEW
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
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
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingService(null);
    setSubmitting(false);
    setFormData(EMPTY_FORM);
  };

  const handleDeleteClick  = (service) => { setServiceToDelete(service); setShowDeleteConfirm(true); };
  const handleCancelDelete = () => { setShowDeleteConfirm(false); setServiceToDelete(null); setDeleting(false); };

  const handleDeleteConfirm = async () => {
    if (!serviceToDelete) return;
    setDeleting(true);
    try {
      await servicesAPI.delete(serviceToDelete.id);
      toast.success('✅ Service deleted successfully!');
      setShowDeleteConfirm(false);
      setServiceToDelete(null);
      fetchServices();
    } catch (error) {
      console.error('Error:', error);
      toast.error('❌ Error deleting service');
    } finally {
      setDeleting(false);
    }
  };

  const servicesByCategory = {
    MEAL:      services.filter(s => s.category === 'MEAL'),
    ACTIVITY:  services.filter(s => s.category === 'ACTIVITY'),
    TRANSPORT: services.filter(s => s.category === 'TRANSPORT'),
    OTHER:     services.filter(s => s.category === 'OTHER'),
  };

  // ✅ Dynamic info card text combining both dimensions
  const getInfoCardText = () => {
    const priceLabel    = formData.priceType   === 'PER_NIGHT' ? 'per night'   : 'fixed (once)';
    const pricingLabel  = formData.pricingType === 'PER_PERSON'? 'per person'  : 'per room';
    return `Price is ${priceLabel} and charged ${pricingLabel}.`;
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6 animate-fade-in">

      {/* ── Header ── */}
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

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
          {Object.entries(CATEGORY_META).map(([key, meta]) => {
            const Icon = meta.icon;
            return (
              <Card key={key} className={`p-2 sm:p-3 border-2 ${meta.color.border}`}>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg ${meta.color.bg} flex items-center justify-center text-white flex-shrink-0`}>
                    <Icon className="text-xs sm:text-sm" />
                  </div>
                  <div className="min-w-0">
                    <div className={`text-base sm:text-lg font-bold ${meta.color.text}`}>{servicesByCategory[key].length}</div>
                    <div className={`text-[10px] sm:text-xs ${meta.color.text} font-semibold truncate`}>{meta.label}</div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Add button */}
      <div className="flex justify-end">
        <Button
          onClick={() => setShowModal(true)}
          className="shadow-xl hover:shadow-2xl group bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-sm sm:text-base w-full sm:w-auto"
        >
          <FaPlus className="group-hover:rotate-90 transition-transform duration-300 flex-shrink-0" />
          <span>Create Service</span>
        </Button>
      </div>

      {/* ── Services Grid ── */}
      {services.length === 0 ? (
        <Card className="p-8 sm:p-12 md:p-16 text-center border-2 border-dashed border-gray-300">
          <div className="flex flex-col items-center gap-4 sm:gap-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
              <FaConciergeBell className="text-4xl sm:text-5xl text-orange-400" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-dark mb-2">No services created</p>
              <p className="text-sm sm:text-base text-dark-light mb-4 sm:mb-6">Create services to enrich your packages</p>
              <Button onClick={() => setShowModal(true)} className="text-sm sm:text-base">
                <FaPlus className="flex-shrink-0" /> <span>Create Service</span>
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {services.map((service, index) => {
            const meta      = CATEGORY_META[service.category] || CATEGORY_META.OTHER;
            const Icon      = meta.icon;
            const colors    = meta.color;
            const ptMeta    = PRICE_TYPE_META[service.priceType]   || PRICE_TYPE_META.FIXED;
            const pricingM  = PRICING_TYPE_META[service.pricingType] || PRICING_TYPE_META.PER_PERSON; // ✅ NEW

            return (
              <Card
                key={service.id}
                className="overflow-hidden border-2 border-gray-100 hover:border-orange-300 hover:shadow-2xl transition-all duration-300 group"
                style={{ animation: 'slideUp 0.4s ease-out', animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
              >
                {/* Header */}
                <div className={`p-4 sm:p-6 ${colors.light} border-b-2 ${colors.border}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl ${colors.bg} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform flex-shrink-0`}>
                      <Icon className="text-lg sm:text-2xl" />
                    </div>

                    {/* ✅ 3 badges: category | priceType | pricingType */}
                    <div className="flex flex-col items-end gap-1.5 min-w-0">
                      <span className={`px-2 py-1 ${colors.light} ${colors.text} rounded-full text-[10px] sm:text-xs font-bold truncate max-w-full`}>
                        {meta.label}
                      </span>

                      <span className={`px-2 py-1 rounded-full text-[10px] sm:text-xs font-bold flex items-center gap-1 ${ptMeta.cls}`}>
                        <ptMeta.icon className="text-[10px] flex-shrink-0" />
                        <span className="whitespace-nowrap">{ptMeta.label}</span>
                      </span>

                      {/* ✅ NEW: pricingType badge */}
                      <span className={`px-2 py-1 rounded-full text-[10px] sm:text-xs font-bold flex items-center gap-1 ${pricingM.cls}`}>
                        <pricingM.icon className="text-[10px] flex-shrink-0" />
                        <span className="whitespace-nowrap">{pricingM.label}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-dark mb-2 sm:mb-3 line-clamp-2 break-words">{service.name}</h3>
                  <p className="text-dark-light text-xs sm:text-sm mb-4 sm:mb-5 line-clamp-2 leading-relaxed">{service.description}</p>

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
                        {/* ✅ Updated suffix: combines priceType + pricingType */}
                        <span className="text-[10px] sm:text-xs text-green-600 block">
                          {service.priceType === 'PER_NIGHT' ? '/night' : ''}
                          {service.pricingType === 'PER_PERSON' ? ' /person' : ' /room'}
                        </span>
                      </div>
                    </div>
                  </Card>

                  {/* Actions */}
                  <div className="flex gap-2 sm:gap-3">
                    <Button
                      variant="outline" size="sm"
                      className="flex-1 border-2 border-orange-500 text-orange-600 hover:bg-orange-50 hover:scale-105 transition-all text-xs sm:text-sm"
                      onClick={() => handleEdit(service)}
                    >
                      <FaEdit className="flex-shrink-0" />
                      <span className="hidden xs:inline ml-1">Edit</span>
                    </Button>
                    <Button
                      variant="outline" size="sm"
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

      {/* ── Add / Edit Modal ── */}
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
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Full breakfast"
            disabled={submitting}
            required
          />

          <div>
            <label className="block text-xs sm:text-sm font-bold text-dark mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input resize-none w-full text-sm sm:text-base"
              rows="3"
              placeholder="Describe the service in detail..."
              disabled={submitting}
              required
            />
          </div>

          {/* Row 1: Category + Price Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-dark mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input w-full text-sm sm:text-base"
                disabled={submitting}
                required
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
                onChange={(e) => setFormData({ ...formData, priceType: e.target.value })}
                className="input w-full text-sm sm:text-base"
                disabled={submitting}
                required
              >
                <option value="FIXED">💰 Fixed (once)</option>
                <option value="PER_NIGHT">🌙 Per night (× nights)</option>
              </select>
            </div>
          </div>

          {/* ✅ NEW Row 2: Pricing Type (PER_PERSON vs PER_ROOM) */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-dark mb-2">
              Billing Mode <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(PRICING_TYPE_META).map(([value, meta]) => {
                const selected = formData.pricingType === value;
                const PIcon = meta.icon;
                return (
                  <button
                    key={value}
                    type="button"
                    disabled={submitting}
                    onClick={() => setFormData({ ...formData, pricingType: value })}
                    className={`flex items-center gap-3 p-3 sm:p-4 rounded-xl border-2 text-left transition-all duration-200
                      ${selected
                        ? 'border-orange-500 bg-orange-50 shadow-md scale-[1.02]'
                        : 'border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-50/30'
                      }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0
                      ${selected ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      <PIcon className="text-base" />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-xs sm:text-sm font-bold truncate ${selected ? 'text-orange-700' : 'text-dark'}`}>
                        {meta.label}
                      </p>
                      <p className="text-[10px] text-gray-500 line-clamp-2 leading-tight mt-0.5">
                        {meta.tip.replace('💡 ', '')}
                      </p>
                    </div>
                    {selected && (
                      <FaCheckCircle className="text-orange-500 flex-shrink-0 ml-auto text-sm" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <Input
            label="Price (€)"
            type="number"
            step="0.01"
            name="price"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            placeholder="50"
            disabled={submitting}
            required
          />

          {/* ✅ Updated info card: combines both dimensions */}
          <Card className={`p-3 sm:p-4 border-2 ${
            formData.priceType === 'PER_NIGHT' ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'
          }`}>
            <div className="flex items-start gap-2 sm:gap-3">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                formData.priceType === 'PER_NIGHT' ? 'bg-blue-500' : 'bg-green-500'
              }`}>
                {formData.priceType === 'PER_NIGHT'
                  ? <FaClock className="text-white text-sm sm:text-base" />
                  : <FaCheckCircle className="text-white text-sm sm:text-base" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs sm:text-sm font-bold mb-1 ${
                  formData.priceType === 'PER_NIGHT' ? 'text-blue-800' : 'text-green-800'
                }`}>
                  {formData.priceType === 'PER_NIGHT' ? 'Price per night' : 'Fixed price'}
                  {' · '}
                  {formData.pricingType === 'PER_PERSON' ? 'per person' : 'per room'}
                </p>
                <p className={`text-[10px] sm:text-xs ${
                  formData.priceType === 'PER_NIGHT' ? 'text-blue-700' : 'text-green-700'
                }`}>
                  💡 {getInfoCardText()}
                  {formData.price && !isNaN(parseFloat(formData.price)) && (
                    <span className="block mt-1 font-semibold">
                      Example: 3 nights
                      {formData.pricingType === 'PER_PERSON' ? ', 2 guests' : ''}
                      {' → '}
                      {formatPrice(
                        parseFloat(formData.price)
                        * (formData.priceType === 'PER_NIGHT' ? 3 : 1)
                        * (formData.pricingType === 'PER_PERSON' ? 2 : 1)
                      )}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 border-t-2 border-gray-100">
            <Button type="button" variant="outline" onClick={handleCloseModal}
              className="flex-1 border-2 text-sm sm:text-base" disabled={submitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              className={`flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl text-sm sm:text-base ${submitting ? 'opacity-75 cursor-not-allowed' : ''}`}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>{editingService ? 'Updating...' : 'Creating...'}</span>
                </>
              ) : editingService ? (
                <><FaCheckCircle className="flex-shrink-0" /><span>Update</span></>
              ) : (
                <><FaPlus className="flex-shrink-0" /><span>Create</span></>
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Delete Confirmation Modal ── */}
      <Modal isOpen={showDeleteConfirm} onClose={handleCancelDelete} title="⚠️ Delete Confirmation">
        <div className="text-center py-4 sm:py-6">
          <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center mb-4 sm:mb-6 animate-pulse">
            <FaExclamationTriangle className="text-3xl sm:text-4xl text-red-600" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-dark mb-2 sm:mb-3 break-words px-2">Delete this service?</h3>
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 sm:p-4 mb-3 sm:mb-4">
            <p className="text-xs sm:text-sm text-dark-light mb-1 break-words">
              Service: <strong className="text-red-600 text-sm sm:text-base md:text-lg">{serviceToDelete?.name}</strong>
            </p>
            <p className="text-xs sm:text-sm text-dark-light">
              Category: <strong className="text-dark">{CATEGORY_META[serviceToDelete?.category]?.label || serviceToDelete?.category}</strong>
            </p>
          </div>
          <p className="text-xs sm:text-sm text-red-600 font-semibold mb-4 sm:mb-6 px-2">⚠️ This action is irreversible</p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button variant="outline" onClick={handleCancelDelete}
              className="flex-1 border-2 text-sm sm:text-base" disabled={deleting}>
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              className={`flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg text-sm sm:text-base ${deleting ? 'opacity-75 cursor-not-allowed' : ''}`}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Deleting...</span>
                </>
              ) : (
                <><FaTrash className="flex-shrink-0" /><span>Delete</span></>
              )}
            </Button>
          </div>
        </div>
      </Modal>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick pauseOnHover draggable theme="light" />

      <style jsx>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
      `}</style>
    </div>
  );
};

export default ServicesManagementPage;
