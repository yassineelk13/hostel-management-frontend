import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaBoxOpen, FaExclamationTriangle, FaCheck,
  FaBed, FaCheckCircle, FaTimesCircle, FaTimes } from 'react-icons/fa';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import ImageUpload from '../../components/common/ImageUpload';
import Loader from '../../components/common/Loader';
import { packsAPI, roomsAPI } from '../../services/api';
import { formatPrice } from '../../utils/priceFormatter';
import { bypassCloudinaryCache } from '../../utils/imageHelper';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const NIGHTS = Array.from({ length: 8 }, (_, i) => i + 3); // 3 → 10


const ROOM_TYPES = [
  { key: 'DORTOIR', label: 'Dormitory', color: 'text-green-600' },
  { key: 'SINGLE',  label: 'Single',    color: 'text-blue-600'  },
  { key: 'DOUBLE',  label: 'Double',    color: 'text-purple-600'},
];


const initNightPrices = () =>
  ROOM_TYPES.flatMap(rt =>
    NIGHTS.map(n => ({ roomType: rt.key, nights: n, promoPrice: '', regularPrice: '' }))
  );


const EMPTY_FORM = {
  name: '',
  description: '',
  nightPrices: initNightPrices(),
  includedFeatures: [],
  photos: []
};


const PacksManagementPage = () => {
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showFeatureInput, setShowFeatureInput] = useState(false);
  const [packToDelete, setPackToDelete] = useState(null);
  const [editingPack, setEditingPack] = useState(null);
  const [newFeature, setNewFeature] = useState('');
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [activePriceTab, setActivePriceTab] = useState('DORTOIR');


  useEffect(() => { fetchData(); }, []);


  const fetchData = async () => {
    try {
      const res = await packsAPI.getAll();
      setPacks(res.data.data);
    } catch {
      toast.error('❌ Error loading packages');
    } finally {
      setLoading(false);
    }
  };


  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handlePhotosChange = (photos) => setFormData({ ...formData, photos });


  const handleNightPriceChange = (roomType, nights, field, value) => {
    setFormData(prev => ({
      ...prev,
      nightPrices: prev.nightPrices.map(np =>
        np.roomType === roomType && np.nights === nights
          ? { ...np, [field]: value }
          : np
      )
    }));
  };


  const handleAddFeature = () => {
    const trimmed = newFeature.trim();
    if (!trimmed) return;
    setFormData(prev => ({ ...prev, includedFeatures: [...prev.includedFeatures, trimmed] }));
    setNewFeature('');
    setShowFeatureInput(false);
  };


  const handleRemoveFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      includedFeatures: prev.includedFeatures.filter((_, i) => i !== index)
    }));
  };


  const handleFeatureKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); handleAddFeature(); }
  };


  // ── Submit ── FIX: upload photos en création ET en édition
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validNightPrices = formData.nightPrices.filter(np => np.promoPrice !== '');
    if (validNightPrices.length === 0) {
      toast.error('❌ Add at least one price for at least one room type!');
      return;
    }
    if (formData.includedFeatures.length === 0) {
      toast.error('❌ Add at least one feature!');
      return;
    }

    setUploading(true);
    try {
      // FIX 1 : sépare les URLs existantes et les nouveaux fichiers
      const existingUrls = formData.photos.filter(p => typeof p === 'string');
      const newFiles     = formData.photos.filter(p => p instanceof File);

      let photoUrls = [...existingUrls]; // garde toujours les URLs existantes

      if (newFiles.length > 0) {
        setUploadProgress({ current: 0, total: newFiles.length });
        for (let i = 0; i < newFiles.length; i++) {
          const fd = new FormData();
          fd.append('photo', newFiles[i]);
          try {
            const res = await roomsAPI.uploadPhoto(fd);
            if (res.data.success) {
              photoUrls.push(res.data.data);
              setUploadProgress({ current: i + 1, total: newFiles.length });
            }
          } catch { toast.warning(`⚠️ Error uploading photo ${i + 1}`); }
        }
      }

      const dataToSend = {
        name: formData.name,
        description: formData.description,
        nightPrices: validNightPrices.map(np => ({
          roomType: np.roomType,
          nights: np.nights,
          promoPrice: parseFloat(np.promoPrice),
          regularPrice: np.regularPrice ? parseFloat(np.regularPrice) : null,
        })),
        includedFeatures: formData.includedFeatures,
        photos: photoUrls
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
      toast.error(`❌ ${error.response?.data?.message || 'Error saving package'}`);
    } finally {
      setUploading(false);
      setUploadProgress({ current: 0, total: 0 });
    }
  };


  const handleEdit = (pack) => {
    setEditingPack(pack);
    const nightPrices = initNightPrices().map(entry => {
      const existing = (pack.nightPrices || []).find(
        np => np.roomType === entry.roomType && np.nights === entry.nights
      );
      if (existing) {
        return {
          ...entry,
          promoPrice: existing.promoPrice?.toString() || '',
          regularPrice: existing.regularPrice?.toString() || '',
        };
      }
      return entry;
    });
    setFormData({
      name: pack.name,
      description: pack.description || '',
      nightPrices,
      includedFeatures: pack.includedFeatures || [],
      photos: pack.photos || []
    });
    setActivePriceTab('DORTOIR');
    setShowModal(true);
  };


  const handleDeleteClick = (pack) => { setPackToDelete(pack); setShowDeleteConfirm(true); };
  const handleCancelDelete = () => { setShowDeleteConfirm(false); setPackToDelete(null); setDeleting(false); };


  const handleDeactivateConfirm = async () => {
    if (!packToDelete) return;
    setDeleting(true);
    try {
      await packsAPI.delete(packToDelete.id);
      toast.success('✅ Package deactivated!');
      setShowDeleteConfirm(false); setPackToDelete(null); fetchData();
    } catch { toast.error('❌ Error deactivating'); }
    finally { setDeleting(false); }
  };


  const handlePermanentDeleteConfirm = async () => {
    if (!packToDelete) return;
    setDeleting(true);
    try {
      await packsAPI.deletePermanently(packToDelete.id);
      toast.success('🗑️ Package deleted permanently!');
      setShowDeleteConfirm(false); setPackToDelete(null); fetchData();
    } catch { toast.error('❌ Error deleting permanently'); }
    finally { setDeleting(false); }
  };


  const handleReactivate = async (id) => {
    try {
      await packsAPI.update(id, { isActive: true });
      toast.success('✅ Package reactivated!'); fetchData();
    } catch { toast.error('❌ Error reactivating'); }
  };


  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPack(null);
    setFormData(EMPTY_FORM);
    setNewFeature('');
    setShowFeatureInput(false);
    setActivePriceTab('DORTOIR');
  };


  const getFromPrice = (pack) => {
    if (!pack.nightPrices || pack.nightPrices.length === 0) return null;
    const prices = pack.nightPrices.map(np => Number(np.promoPrice)).filter(p => p > 0);
    return prices.length > 0 ? Math.min(...prices) : null;
  };


  const getMinPriceByRoomType = (pack, roomType) => {
    if (!pack.nightPrices) return null;
    const prices = pack.nightPrices
      .filter(np => np.roomType === roomType)
      .map(np => Number(np.promoPrice))
      .filter(p => p > 0);
    return prices.length > 0 ? Math.min(...prices) : null;
  };


  const activePacks   = packs.filter(p => p.isActive !== false);
  const inactivePacks = packs.filter(p => p.isActive === false);


  if (loading) return <Loader />;


  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 sm:gap-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-dark mb-2 flex items-center gap-2 sm:gap-3">
            <span className="inline-block w-1.5 sm:w-2 h-8 sm:h-10 bg-gradient-to-b from-pink-500 to-rose-700 rounded-full flex-shrink-0" />
            Packages Management
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-dark-light">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              {activePacks.length} active
            </div>
            {inactivePacks.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full" />
                {inactivePacks.length} deactivated
              </div>
            )}
          </div>
        </div>
        <Card className="p-3 sm:p-4 border-2 border-pink-200 bg-gradient-to-br from-pink-50 to-rose-100 flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-pink-500 flex items-center justify-center text-white">
              <FaBoxOpen />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-pink-700">{packs.length}</div>
              <div className="text-[10px] sm:text-xs text-pink-600 font-semibold">Total packages</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Add Button */}
      <div className="flex justify-end">
        <Button
          onClick={() => setShowModal(true)}
          className="shadow-xl group bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 w-full sm:w-auto"
        >
          <FaPlus className="group-hover:rotate-90 transition-transform duration-300" />
          Create Package
        </Button>
      </div>

      {/* Packs Grid */}
      {packs.length === 0 ? (
        <Card className="p-12 text-center border-2 border-dashed border-gray-300">
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-pink-100 to-rose-200 flex items-center justify-center">
              <FaBoxOpen className="text-5xl text-pink-400" />
            </div>
            <p className="text-xl font-bold text-dark">No packages created</p>
            <Button onClick={() => setShowModal(true)}>
              <FaPlus /> Create Package
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {packs.map((pack, index) => (
            <Card
              key={pack.id}
              className={`overflow-hidden border-2 hover:shadow-2xl transition-all duration-300 group ${
                pack.isActive === false
                  ? 'border-red-300 opacity-75'
                  : 'border-gray-100 hover:border-pink-300'
              }`}
              style={{ animation: 'slideUp 0.4s ease-out', animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
            >
              {pack.isActive === false && (
                <div className="bg-gradient-to-r from-red-500 to-red-600 text-white text-center py-2 font-bold text-xs flex items-center justify-center gap-2">
                  <FaTimesCircle /> PACKAGE DEACTIVATED
                </div>
              )}

              {/* Image */}
              <div className="relative h-48 sm:h-56 bg-gradient-to-br from-pink-100 to-orange-100 overflow-hidden">
                {pack.photos && pack.photos.length > 0 ? (
                  <img
                    src={bypassCloudinaryCache(pack.photos[0])}
                    alt={pack.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FaBoxOpen className="text-7xl text-pink-300" />
                  </div>
                )}
                {getFromPrice(pack) && (
                  <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-xl text-xs font-bold">
                    from {formatPrice(getFromPrice(pack))}/night
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4 sm:p-5">
                <h3 className="text-lg sm:text-xl font-bold text-dark mb-2 line-clamp-1">{pack.name}</h3>
                <p className="text-dark-light text-xs sm:text-sm mb-4 line-clamp-2 leading-relaxed">{pack.description}</p>

                <Card className="p-3 mb-4 bg-gradient-to-br from-pink-50 to-rose-50 border-2 border-pink-200">
                  <p className="text-[10px] font-bold text-pink-700 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <FaBed className="flex-shrink-0" /> Starting price per night
                  </p>
                  <div className="space-y-1.5">
                    {ROOM_TYPES.map(({ key, label, color }) => {
                      const min = getMinPriceByRoomType(pack, key);
                      if (!min) return null;
                      return (
                        <div key={key} className="flex justify-between items-center text-xs">
                          <span className="text-dark-light">{label}</span>
                          <span className={`font-bold ${color}`}>from {formatPrice(min)}</span>
                        </div>
                      );
                    })}
                    {(!pack.nightPrices || pack.nightPrices.length === 0) && (
                      <p className="text-xs text-dark-light italic">No prices defined</p>
                    )}
                  </div>
                </Card>

                {pack.includedFeatures && pack.includedFeatures.length > 0 && (
                  <div className="mb-4">
                    <p className="text-[10px] font-bold text-dark mb-2 flex items-center gap-1.5">
                      <FaCheckCircle className="text-green-500" /> What's included
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {pack.includedFeatures.slice(0, 3).map((f, i) => (
                        <span key={i} className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                          ✓ {f}
                        </span>
                      ))}
                      {pack.includedFeatures.length > 3 && (
                        <span className="text-[10px] bg-gray-200 text-dark px-2 py-1 rounded-full font-semibold">
                          +{pack.includedFeatures.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 sm:gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-2 border-pink-500 text-pink-600 hover:bg-pink-50 text-xs sm:text-sm"
                    onClick={() => handleEdit(pack)}
                  >
                    <FaEdit /> <span className="hidden xs:inline ml-1">Edit</span>
                  </Button>
                  {pack.isActive === false ? (
                    <Button
                      size="sm"
                      className="bg-green-500 hover:bg-green-600 text-white flex-shrink-0"
                      onClick={() => handleReactivate(pack.id)}
                    >
                      <FaCheck />
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-2 border-red-500 text-red-600 hover:bg-red-50 flex-shrink-0"
                      onClick={() => handleDeleteClick(pack)}
                    >
                      <FaTrash />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ===== CREATE / EDIT MODAL ===== */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white">
              {editingPack ? <FaEdit /> : <FaPlus />}
            </div>
            {editingPack ? 'Edit Package' : 'Create Package'}
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="border border-gray-200 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-dark flex items-center gap-2">
              <span>📦</span> General Information
            </h3>
            <div>
              <label className="block text-xs sm:text-sm font-bold text-dark mb-2">Photos</label>
              {/* FIX 2 : acceptFiles toujours true pour permettre l'ajout en création ET en édition */}
              <ImageUpload images={formData.photos} onChange={handlePhotosChange} maxImages={5} acceptFiles={true} />
            </div>
            <Input label="Package Name" name="name" value={formData.name} onChange={handleChange} placeholder="Ride All In" required />
            <div>
              <label className="block text-xs sm:text-sm font-bold text-dark mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input resize-none w-full text-sm"
                rows="3"
                placeholder="For those who want a full surf experience..."
                required
              />
            </div>
          </div>

          {uploading && uploadProgress.total > 0 && (
            <Card className="p-4 bg-blue-50 border-2 border-blue-300 animate-pulse">
              <div className="flex items-center justify-between mb-2">
                <p className="font-bold text-blue-800 text-sm">Uploading photos...</p>
                <p className="font-bold text-blue-800">{uploadProgress.current}/{uploadProgress.total}</p>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                />
              </div>
            </Card>
          )}

          <div className="border border-gray-200 rounded-2xl p-5 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-dark flex items-center gap-2 mb-1">
                <span>🛏️</span> Prices per night (3 to 10 nights)
              </h3>
              <p className="text-[11px] text-dark-light">
                Leave empty to not offer that duration. Promo = displayed price · Regular = crossed-out price (optional)
              </p>
            </div>

            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
              {ROOM_TYPES.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActivePriceTab(key)}
                  className={`flex-1 text-xs font-bold py-2 rounded-lg transition-all duration-200 ${
                    activePriceTab === key
                      ? 'bg-white shadow text-dark'
                      : 'text-dark-light hover:text-dark'
                  }`}
                >
                  {label}
                  {(() => {
                    const count = formData.nightPrices.filter(
                      np => np.roomType === key && np.promoPrice !== ''
                    ).length;
                    return count > 0 ? (
                      <span className="ml-1.5 bg-primary text-white text-[9px] px-1.5 py-0.5 rounded-full">
                        {count}
                      </span>
                    ) : null;
                  })()}
                </button>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 pr-3 text-dark/50 font-semibold w-20">Nights</th>
                    <th className="text-center py-2 px-2 text-dark/50 font-semibold">
                      Promo Price (€) <span className="text-red-400">*</span>
                    </th>
                    <th className="text-center py-2 pl-2 text-dark/50 font-semibold">
                      Regular Price (€) <span className="text-dark/30 font-normal">optional</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {NIGHTS.map(n => {
                    const entry = formData.nightPrices.find(
                      np => np.roomType === activePriceTab && np.nights === n
                    );
                    return (
                      <tr key={n} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-2.5 pr-3">
                          <span className="inline-flex items-center gap-1.5 font-bold text-dark">
                            <span className="w-6 h-6 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                              {n}
                            </span>
                            nights
                          </span>
                        </td>
                        <td className="py-2.5 px-2">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={entry?.promoPrice || ''}
                            onChange={e => handleNightPriceChange(activePriceTab, n, 'promoPrice', e.target.value)}
                            placeholder="—"
                            className="input w-full text-sm text-center"
                          />
                        </td>
                        <td className="py-2.5 pl-2">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={entry?.regularPrice || ''}
                            onChange={e => handleNightPriceChange(activePriceTab, n, 'regularPrice', e.target.value)}
                            placeholder="—"
                            className="input w-full text-sm text-center opacity-70"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {(() => {
              const total = formData.nightPrices.filter(np => np.promoPrice !== '').length;
              return (
                <p className="text-[11px] text-dark-light flex items-center gap-1.5">
                  <FaCheckCircle className="text-green-500" />
                  {total} price{total !== 1 ? 's' : ''} defined across all room types
                </p>
              );
            })()}
          </div>

          <div className="border border-gray-200 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-dark flex items-center gap-2">
              <span>✅</span> What's included
            </h3>

            {formData.includedFeatures.length === 0 ? (
              <p className="text-xs text-dark-light italic py-2">No features added yet.</p>
            ) : (
              <ul className="space-y-2">
                {formData.includedFeatures.map((feature, i) => (
                  <li key={i} className="flex items-center justify-between gap-3 px-3 py-2 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-primary text-xs flex-shrink-0">•</span>
                      <span className="text-sm text-dark truncate">{feature}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(i)}
                      className="text-red-400 hover:text-red-600 transition-colors flex-shrink-0 p-1 hover:bg-red-50 rounded-lg"
                    >
                      <FaTimes className="text-xs" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {showFeatureInput && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newFeature}
                  onChange={e => setNewFeature(e.target.value)}
                  onKeyDown={handleFeatureKeyDown}
                  placeholder="Ex: Daily surf lessons (6 sessions)"
                  className="input flex-1 text-sm"
                  autoFocus
                />
                <Button type="button" onClick={handleAddFeature} className="flex-shrink-0 bg-green-500 hover:bg-green-600 px-3">
                  <FaCheck className="text-xs" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setShowFeatureInput(false); setNewFeature(''); }}
                  className="flex-shrink-0 px-3"
                >
                  <FaTimes className="text-xs" />
                </Button>
              </div>
            )}

            {!showFeatureInput && (
              <button
                type="button"
                onClick={() => setShowFeatureInput(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-sm text-dark-light hover:border-primary hover:text-primary transition-colors"
              >
                <FaPlus className="text-xs" />
                Add a feature
              </button>
            )}

            <p className="text-[10px] text-dark-light flex items-center gap-1.5">
              <FaCheckCircle className="text-green-500" />
              {formData.includedFeatures.length} feature{formData.includedFeatures.length !== 1 ? 's' : ''} added
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={handleCloseModal} className="flex-1" disabled={uploading}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 shadow-lg"
              disabled={uploading}
            >
              {uploading ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Uploading...</>
              ) : (
                <>{editingPack ? <FaCheckCircle /> : <FaPlus />} {editingPack ? 'Update Package' : 'Create Package'}</>
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ===== DELETE MODAL ===== */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={handleCancelDelete}
        title={
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center animate-pulse">
              <FaExclamationTriangle className="text-2xl text-orange-600" />
            </div>
            Delete Package
          </div>
        }
      >
        <div className="space-y-4 py-4">
          <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4">
            <h3 className="text-lg font-bold text-dark mb-1 line-clamp-1">{packToDelete?.name}</h3>
            <p className="text-sm text-dark-light">Choose how you want to handle this package</p>
          </div>

          <Card className="p-4 border-2 border-orange-300">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                <FaTimesCircle className="text-xl text-orange-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-dark mb-1 flex items-center gap-2">
                  Deactivate
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">RECOMMENDED</span>
                </h4>
                <p className="text-xs text-dark-light mb-3">Hide from public. Can be reactivated later.</p>
                <Button
                  onClick={handleDeactivateConfirm}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-sm"
                  disabled={deleting}
                >
                  {deleting
                    ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing...</>
                    : <><FaTimesCircle /> Deactivate Package</>}
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-2 border-red-300">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                <FaTrash className="text-xl text-red-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-dark mb-1 flex items-center gap-2">
                  Delete Permanently
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">IRREVERSIBLE</span>
                </h4>
                <p className="text-xs text-dark-light mb-3">
                  <strong className="text-red-600">⚠️</strong> Deletes all data including Cloudinary photos. Cannot be undone.
                </p>
                <Button
                  onClick={handlePermanentDeleteConfirm}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 text-sm"
                  disabled={deleting}
                >
                  {deleting
                    ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Deleting...</>
                    : <><FaTrash /> Delete Permanently</>}
                </Button>
              </div>
            </div>
          </Card>

          <Button variant="outline" onClick={handleCancelDelete} className="w-full border-2" disabled={deleting}>
            Cancel
          </Button>
        </div>
      </Modal>

      <ToastContainer position="top-right" autoClose={3000} theme="light" />

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};


export default PacksManagementPage;