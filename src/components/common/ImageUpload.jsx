import { useState, useCallback, useEffect } from 'react';
import { FaUpload, FaTrash } from 'react-icons/fa';

const ImageUpload = ({ images = [], onChange, maxImages = 10 }) => {
  const [blobUrls, setBlobUrls] = useState(new Map());

  useEffect(() => {
    return () => {
      blobUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  const getPreviewUrl = useCallback((image) => {
    if (typeof image === 'string') return image; // ✅ URL Cloudinary existante
    if (image instanceof File) {
      if (!blobUrls.has(image)) {
        const url = URL.createObjectURL(image);
        setBlobUrls(prev => new Map(prev).set(image, url));
        return url;
      }
      return blobUrls.get(image);
    }
    return null;
  }, [blobUrls]);

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const remainingSlots = maxImages - images.length;

    if (files.length > remainingSlots) {
      alert(`Vous ne pouvez ajouter que ${remainingSlots} image(s) supplémentaire(s).`);
      return;
    }

    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} n'est pas une image valide.`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} est trop volumineux (max 5MB).`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      onChange([...images, ...validFiles]); // ✅ Toujours des File objects
    }
  };

  const handleRemove = (index) => {
    const imageToRemove = images[index];
    if (imageToRemove instanceof File && blobUrls.has(imageToRemove)) {
      URL.revokeObjectURL(blobUrls.get(imageToRemove));
      setBlobUrls(prev => {
        const next = new Map(prev);
        next.delete(imageToRemove);
        return next;
      });
    }
    onChange(images.filter((_, i) => i !== index));
  };

  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length > 0) handleFileUpload({ target: { files } });
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-dark mb-3">
        Photos ({images.length}/{maxImages})
      </label>

      {images.length > 0 && (
        <div className="mb-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {images.map((image, index) => {
            const url = getPreviewUrl(image);
            return (
              <div key={index} className="relative group aspect-square">
                {url && (
                  <img
                    src={url}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg border-2 border-accent"
                  />
                )}
                <div className="absolute top-2 left-2 bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-700"
                >
                  <FaTrash className="text-xs" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {images.length < maxImages && (
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="border-2 border-dashed border-accent rounded-lg p-8 text-center hover:border-primary hover:bg-accent/10 transition-all cursor-pointer"
        >
          <label htmlFor="file-upload" className="cursor-pointer">
            <FaUpload className="text-4xl text-primary mx-auto mb-3" />
            <p className="text-dark font-medium mb-1">Glissez-déposez vos images ici</p>
            <p className="text-sm text-dark-light mb-3">ou cliquez pour sélectionner plusieurs fichiers</p>
            <p className="text-xs text-dark-light">PNG, JPG, WEBP jusqu'à 5MB · Maximum {maxImages} images</p>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;