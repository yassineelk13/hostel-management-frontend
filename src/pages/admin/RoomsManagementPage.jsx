import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaBed, FaImage, FaDoorOpen, FaMoneyBillWave, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import ImageUpload from '../../components/common/ImageUpload';
import Loader from '../../components/common/Loader';
import { roomsAPI } from '../../services/api';
import { formatPrice } from '../../utils/priceFormatter';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { bypassCloudinaryCache } from '../../utils/imageHelper'; // ✅ AJOUTE


const RoomsManagementPage = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false); // ✅ État de chargement pour delete
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);
  const [formData, setFormData] = useState({
    roomNumber: '',
    roomType: 'DOUBLE',
    description: '',
    pricePerNight: '',
    numberOfBeds: '1',
    photos: []
  });


  useEffect(() => {
    fetchRooms();
  }, []);


  const fetchRooms = async () => {
    try {
      const response = await roomsAPI.getAll();
      setRooms(response.data.data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('❌ Error loading rooms');
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


  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      let photoUrls = [];


      // Upload photos
      if (!editingRoom && formData.photos.length > 0 && formData.photos[0] instanceof File) {
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
            } else {
              throw new Error(response.data.message || 'Upload error');
            }
          } catch (error) {
            console.error(`Error uploading photo ${i + 1}:`, error);
            toast.warning(`⚠️ Error photo ${i + 1}. Continuing...`);
          }
        }

        if (photoUrls.length === 0) {
          toast.error('❌ No photos uploaded');
          setUploading(false);
          return;
        }
      } else {
        photoUrls = formData.photos;
      }


      const roomData = {
        roomNumber: formData.roomNumber,
        roomType: formData.roomType,
        description: formData.description,
        pricePerNight: parseFloat(formData.pricePerNight),
        numberOfBeds: parseInt(formData.numberOfBeds),
        photos: photoUrls
      };


      if (editingRoom) {
        await roomsAPI.update(editingRoom.id, roomData);
        toast.success('✅ Room updated successfully!');
      } else {
        await roomsAPI.createWithUrls(roomData);
        toast.success('✅ Room created successfully!');
      }


      handleCloseModal();
      fetchRooms();

    } catch (error) {
      console.error('Error:', error);
      toast.error(`❌ ${error.response?.data?.message || 'Error saving room'}`);
    } finally {
      setUploading(false);
    }
  };


  const handleEdit = (room) => {
    setEditingRoom(room);
    setFormData({
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      description: room.description,
      pricePerNight: room.pricePerNight.toString(),
      numberOfBeds: room.totalBeds?.toString() || '1',
      photos: room.photos || []
    });
    setShowModal(true);
  };


  const handleDeleteClick = (room) => {
    setRoomToDelete(room);
    setShowDeleteConfirm(true);
  };


  const handleDeleteConfirm = async () => {
    if (!roomToDelete) return;

    setDeleting(true); // ✅ Active le chargement pour delete

    try {
      await roomsAPI.delete(roomToDelete.id);
      toast.success('✅ Room deleted successfully!');
      setShowDeleteConfirm(false);
      setRoomToDelete(null);
      fetchRooms();
    } catch (error) {
      console.error('Error:', error);
      toast.error('❌ Error deleting room');
    } finally {
      setDeleting(false); // ✅ Désactive le chargement
    }
  };


  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setRoomToDelete(null);
    setDeleting(false); // ✅ Réinitialise l'état
  };


  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRoom(null);
    setFormData({
      roomNumber: '',
      roomType: 'DOUBLE',
      description: '',
      pricePerNight: '',
      numberOfBeds: '1',
      photos: []
    });
    setUploadProgress({ current: 0, total: 0 });
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


  const totalBeds = rooms.reduce((sum, room) => sum + (room.totalBeds || 0), 0);
  const avgPrice = rooms.length > 0 
    ? (rooms.reduce((sum, room) => sum + room.pricePerNight, 0) / rooms.length).toFixed(0)
    : 0;


  if (loading) return <Loader />;


  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6 animate-fade-in">
      {/* Header responsive */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 sm:gap-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-display font-bold text-dark mb-2 flex items-center gap-2 sm:gap-3">
            <span className="inline-block w-1.5 sm:w-2 h-8 sm:h-10 bg-gradient-to-b from-purple-500 to-purple-700 rounded-full flex-shrink-0" />
            <span className="break-words">Rooms Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-dark-light flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0" />
            <span>{rooms.length} room{rooms.length !== 1 ? 's' : ''} total</span>
          </p>
        </div>


        {/* Quick Stats */}
        <div className="flex gap-3 sm:gap-4">
          <Card className="p-3 sm:p-4 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 min-w-[100px] sm:min-w-[120px] flex-shrink-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-purple-500 flex items-center justify-center text-white flex-shrink-0">
                <FaBed className="text-sm sm:text-base" />
              </div>
              <div className="min-w-0">
                <div className="text-xl sm:text-2xl font-bold text-purple-700">{totalBeds}</div>
                <div className="text-[10px] sm:text-xs text-purple-600 font-semibold truncate">Total beds</div>
              </div>
            </div>
          </Card>
          <Card className="p-3 sm:p-4 border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100 min-w-[100px] sm:min-w-[120px] flex-shrink-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-green-500 flex items-center justify-center text-white flex-shrink-0">
                <FaMoneyBillWave className="text-sm sm:text-base" />
              </div>
              <div className="min-w-0">
                <div className="text-xl sm:text-2xl font-bold text-green-700">{avgPrice}</div>
                <div className="text-[10px] sm:text-xs text-green-600 font-semibold truncate">Avg. price</div>
              </div>
            </div>
          </Card>
        </div>
      </div>


      {/* Add button */}
      <div className="flex justify-end">
        <Button 
          onClick={() => setShowModal(true)}
          className="shadow-xl hover:shadow-2xl group text-sm sm:text-base w-full sm:w-auto"
        >
          <FaPlus className="group-hover:rotate-90 transition-transform duration-300 flex-shrink-0" />
          <span>Add Room</span>
        </Button>
      </div>


      {/* Rooms Grid */}
      {rooms.length === 0 ? (
        <Card className="p-8 sm:p-12 md:p-16 text-center border-2 border-dashed border-gray-300">
          <div className="flex flex-col items-center gap-4 sm:gap-6 animate-fade-in">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
              <FaBed className="text-4xl sm:text-5xl text-purple-400" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-dark mb-2 break-words">No rooms yet</p>
              <p className="text-sm sm:text-base text-dark-light mb-4 sm:mb-6">Start by adding your first room</p>
              <Button onClick={() => setShowModal(true)} className="text-sm sm:text-base">
                <FaPlus className="flex-shrink-0" />
                <span>Add Room</span>
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {rooms.map((room, index) => (
            <Card 
              key={room.id} 
              className="overflow-hidden border-2 border-gray-100 hover:border-purple-300 hover:shadow-2xl transition-all duration-300 group"
              style={{ 
                animation: 'slideUp 0.4s ease-out',
                animationDelay: `${index * 100}ms`,
                animationFillMode: 'both'
              }}
            >
              {/* Image */}
              <div className="relative h-48 sm:h-56 bg-gradient-to-br from-purple-100 to-pink-100 overflow-hidden">
                {room.photos && room.photos.length > 0 ? (
                  <>
                     <img 
      src={bypassCloudinaryCache(room.photos[0])} // ✅ CHANGE ICI
      alt={`Room ${room.roomNumber}`} 
      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
    />
                    {room.photos.length > 1 && (
                      <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 px-2 sm:px-3 py-1 sm:py-1.5 bg-black/70 backdrop-blur-sm rounded-full flex items-center gap-1.5 sm:gap-2">
                        <FaImage className="text-white text-[10px] sm:text-xs flex-shrink-0" />
                        <span className="text-white text-[10px] sm:text-xs font-bold">{room.photos.length} photos</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FaBed className="text-5xl sm:text-7xl text-purple-300" />
                  </div>
                )}

                {/* Room type badge */}
                <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
                  <span className={`inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 ${getRoomTypeColor(room.roomType)} text-white rounded-full text-[10px] sm:text-xs font-bold shadow-lg`}>
                    <FaDoorOpen className="flex-shrink-0" />
                    <span className="hidden xs:inline">{getRoomTypeLabel(room.roomType)}</span>
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-dark truncate">Room {room.roomNumber}</h3>
                  <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-purple-100 rounded-lg flex-shrink-0">
                    <FaBed className="text-purple-600 text-xs sm:text-sm" />
                    <span className="text-xs sm:text-sm font-bold text-purple-700">{room.totalBeds || 0}</span>
                  </div>
                </div>

                <p className="text-dark-light text-xs sm:text-sm mb-4 sm:mb-5 line-clamp-2 leading-relaxed">
                  {room.description}
                </p>

                {/* Price */}
                <div className="mb-4 sm:mb-5 p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs sm:text-sm text-green-700 font-semibold">Price per night</span>
                    <span className="text-xl sm:text-2xl font-bold text-green-600 whitespace-nowrap">{formatPrice(room.pricePerNight)}</span>
                  </div>
                </div>


                {/* Actions */}
                <div className="flex gap-2 sm:gap-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 border-2 border-purple-500 text-purple-600 hover:bg-purple-50 hover:scale-105 transition-all text-xs sm:text-sm"
                    onClick={() => handleEdit(room)}
                  >
                    <FaEdit className="flex-shrink-0" />
                    <span className="hidden xs:inline ml-1">Edit</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-2 border-red-500 text-red-600 hover:bg-red-50 hover:scale-105 transition-all flex-shrink-0"
                    onClick={() => handleDeleteClick(room)}
                  >
                    <FaTrash className="text-xs sm:text-sm" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}


      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white flex-shrink-0">
              {editingRoom ? <FaEdit className="text-sm sm:text-base" /> : <FaPlus className="text-sm sm:text-base" />}
            </div>
            <span className="text-base sm:text-lg break-words">{editingRoom ? 'Edit Room' : 'Add Room'}</span>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-dark mb-2 sm:mb-3 flex items-center gap-2">
              <FaImage className="text-purple-500 flex-shrink-0" />
              <span>Room Photos</span>
            </label>
            <ImageUpload
              images={formData.photos}
              onChange={handlePhotosChange}
              maxImages={10}
              acceptFiles={!editingRoom}
            />
          </div>


          {/* Upload Progress */}
          {uploading && uploadProgress.total > 0 && (
            <Card className="p-4 sm:p-5 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-300 animate-pulse">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-blue-500 flex items-center justify-center animate-spin flex-shrink-0">
                    <FaImage className="text-white text-sm sm:text-base" />
                  </div>
                  <p className="font-bold text-blue-800 text-xs sm:text-sm truncate">Uploading...</p>
                </div>
                <p className="text-lg sm:text-xl font-bold text-blue-800 flex-shrink-0">
                  {uploadProgress.current} / {uploadProgress.total}
                </p>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-3 sm:h-4 overflow-hidden shadow-inner">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 sm:h-4 rounded-full transition-all duration-500 flex items-center justify-center relative"
                  style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                >
                  <span className="text-[10px] sm:text-xs font-bold text-white absolute">
                    {Math.round((uploadProgress.current / uploadProgress.total) * 100)}%
                  </span>
                </div>
              </div>
              <p className="text-[10px] sm:text-xs text-blue-700 mt-2 sm:mt-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping flex-shrink-0" />
                <span>Please wait, do not close this window</span>
              </p>
            </Card>
          )}


          {/* Form fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Input
              label="Room Number"
              name="roomNumber"
              value={formData.roomNumber}
              onChange={handleChange}
              placeholder="101"
              required
            />


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
          </div>


          <div>
            <label className="block text-xs sm:text-sm font-bold text-dark mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input resize-none w-full text-sm sm:text-base"
              rows="4"
              placeholder="Describe the room, its amenities, view..."
              required
            ></textarea>
          </div>


          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Input
              label="Price per Night (MAD)"
              type="number"
              name="pricePerNight"
              value={formData.pricePerNight}
              onChange={handleChange}
              placeholder="350"
              required
            />


            <Input
              label="Number of Beds"
              type="number"
              name="numberOfBeds"
              value={formData.numberOfBeds}
              onChange={handleChange}
              min="1"
              required
            />
          </div>


          {/* Action buttons */}
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
              className="flex-1 shadow-lg hover:shadow-xl text-sm sm:text-base"
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin flex-shrink-0" />
                  <span>Upload {uploadProgress.current}/{uploadProgress.total}</span>
                </>
              ) : (
                <>
                  {editingRoom ? <FaCheckCircle className="flex-shrink-0" /> : <FaPlus className="flex-shrink-0" />}
                  <span>{editingRoom ? 'Update' : 'Create'}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </Modal>


      {/* ✅ Delete Confirmation Modal AVEC LOADING */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={handleCancelDelete}
        title="⚠️ Delete Confirmation"
      >
        <div className="text-center py-4 sm:py-6">
          <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center mb-4 sm:mb-6 animate-pulse">
            <FaExclamationTriangle className="text-3xl sm:text-4xl text-red-600" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-dark mb-2 sm:mb-3 break-words px-2">
            Delete this room?
          </h3>
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 sm:p-4 mb-3 sm:mb-4">
            <p className="text-xs sm:text-sm text-dark-light">
              Room: <strong className="text-red-600 text-sm sm:text-base md:text-lg">#{roomToDelete?.roomNumber}</strong>
            </p>
            <p className="text-xs sm:text-sm text-dark-light">
              Type: <strong className="text-dark">{getRoomTypeLabel(roomToDelete?.roomType)}</strong>
            </p>
          </div>
          <p className="text-xs sm:text-sm text-red-600 font-semibold mb-4 sm:mb-6 px-2">
            ⚠️ This action is irreversible
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button
              variant="outline"
              onClick={handleCancelDelete}
              className="flex-1 border-2 text-sm sm:text-base"
              disabled={deleting}
            >
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
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <FaTrash className="flex-shrink-0" />
                  <span>Delete</span>
                </>
              )}
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


export default RoomsManagementPage;
