import { useState, useRef } from 'react';
import { FaUpload, FaTrash, FaImage } from 'react-icons/fa';

const ImageUpload = ({ images = [], onChange, maxImages = 10, acceptFiles = true }) => {
  const [imageFiles, setImageFiles] = useState([]);

  // ✅ Les previews se calculent directement depuis images (pas de state local)
  const getPreviewUrl = (image) => {
    if (typeof image === 'string') return image;        // URL Cloudinary
    if (image instanceof File) return URL.createObjectURL(image); // Fichier local
    return null;
  };

  // imageUrls = previews calculées depuis props.images directement
  const imageUrls = images.map(getPreviewUrl).filter(Boolean);

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const remainingSlots = maxImages - images.length;

    if (files.length > remainingSlots) {
      alert(`Vous ne pouvez ajouter que ${remainingSlots} image(s) supplémentaire(s).`);
      return;
    }

    const validFiles = [];
    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} n'est pas une image valide.`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} est trop volumineux (max 5MB).`);
        return;
      }
      validFiles.push(file);
    });

    if (validFiles.length === 0) return;

    if (acceptFiles) {
      // ✅ Mode création : envoyer File objects
      const newFiles = [...imageFiles, ...validFiles];
      setImageFiles(newFiles);
      onChange(newFiles);
    } else {
      // ✅ Mode édition : convertir en Base64
      let loadedCount = 0;
      const newUrls = [...images];

      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newUrls.push(reader.result);
          loadedCount++;
          if (loadedCount === validFiles.length) {
            onChange(newUrls);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemove = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    if (acceptFiles) {
      const newFiles = imageFiles.filter((_, i) => i !== index);
      setImageFiles(newFiles);
    }
    onChange(newImages); // ✅ toujours passer le bon array au parent
  };

  const handleUrlAdd = () => {
    const url = prompt("Entrez l'URL de l'image :");
    if (url && url.trim()) {
      onChange([...images, url.trim()]);
    }
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

      {/* Zone de prévisualisation */}
      {imageUrls.length > 0 && (
        <div className="mb-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {imageUrls.map((url, index) => (
              <div key={index} className="relative group aspect-square">
                <img
                  src={url}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg border-2 border-accent"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub24gdmFsaWRlPC90ZXh0Pjwvc3ZnPg==';
                  }}
                />
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
            ))}
          </div>
        </div>
      )}

      {/* Zone d'upload */}
      {images.length < maxImages && (
        <div className="space-y-3">
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

          {!acceptFiles && (
            <button
              type="button"
              onClick={handleUrlAdd}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-accent rounded-lg hover:border-primary hover:bg-accent/10 transition-all"
            >
              <FaImage className="text-primary text-xl" />
              <span className="font-medium text-dark">Ajouter une URL d'image</span>
            </button>
          )}
        </div>
      )}

      {images.length >= maxImages && (
        <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-sm text-orange-800">⚠️ Limite atteinte : {maxImages} images maximum</p>
        </div>
      )}

      {images.length === 0 && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>Astuce :</strong> Vous pouvez sélectionner plusieurs images à la fois en maintenant Ctrl (Windows) ou Cmd (Mac)
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
