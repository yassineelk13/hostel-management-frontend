import { useState, useCallback, useEffect } from 'react';
import { FaUpload, FaTrash, FaImage } from 'react-icons/fa';

const ImageUpload = ({ images = [], onChange, maxImages = 10, acceptFiles = true }) => {

  // ✅ Une seule source de vérité : les props images
  // ✅ Les blob URLs sont mémorisées pour éviter le memory leak
  const [blobUrls, setBlobUrls] = useState(new Map());

  // ✅ Libère les blob URLs quand le composant unmount
  useEffect(() => {
    return () => {
      blobUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  const getPreviewUrl = useCallback((image) => {
    if (typeof image === 'string') return image;
    if (image instanceof File) {
      // ✅ Réutilise le blob URL existant au lieu d'en créer un nouveau
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

    if (validFiles.length === 0) return;

    if (acceptFiles) {
      // ✅ Une seule source de vérité : on passe tout au parent
      onChange([...images, ...validFiles]);
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
    // ✅ Si c'est un File avec un blob URL, on le libère
    const imageToRemove = images[index];
    if (imageToRemove instanceof File && blobUrls.has(imageToRemove)) {
      URL.revokeObjectURL(blobUrls.get(imageToRemove));
      setBlobUrls(prev => {
        const next = new Map(prev);
        next.delete(imageToRemove);
        return next;
      });
    }
    // ✅ Une seule opération, une seule source de vérité
    onChange(images.filter((_, i) => i !== index));
  };

  const handleUrlAdd = () => {
    const url = prompt("Entrez l'URL de l'image :");
    if (url && url.trim()) onChange([...images, url.trim()]);
  };

  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length > 0) handleFileUpload({ target: { files } });
  };

  const imageUrls = images.map(getPreviewUrl).filter(Boolean);

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-dark mb-3">
        Photos ({images.length}/{maxImages})
      </label>

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
                    e.target.src = 'data:image/svg+xml;base64,...';
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

      {images.length < maxImages && (
        <div className="space-y-3">
          <div onDragOver={handleDragOver} onDrop={handleDrop}
            className="border-2 border-dashed border-accent rounded-lg p-8 text-center hover:border-primary hover:bg-accent/10 transition-all cursor-pointer"
          >
            <label htmlFor="file-upload" className="cursor-pointer">
              <FaUpload className="text-4xl text-primary mx-auto mb-3" />
              <p className="text-dark font-medium mb-1">Glissez-déposez vos images ici</p>
              <p className="text-sm text-dark-light mb-3">ou cliquez pour sélectionner plusieurs fichiers</p>
              <p className="text-xs text-dark-light">PNG, JPG, WEBP jusqu'à 5MB · Maximum {maxImages} images</p>
              <input id="file-upload" type="file" accept="image/*" multiple
                onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {!acceptFiles && (
            <button type="button" onClick={handleUrlAdd}
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
            💡 <strong>Astuce :</strong> Ctrl (Windows) ou Cmd (Mac) pour sélectionner plusieurs images
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;