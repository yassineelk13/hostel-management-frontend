import { useState, useEffect } from 'react';
import { FaUpload, FaTrash, FaImage } from 'react-icons/fa';

const ImageUpload = ({ images = [], onChange, maxImages = 10, acceptFiles = true }) => {
  const [imageUrls, setImageUrls] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);

  // Initialiser les previews lors du premier rendu ou quand images change
  useEffect(() => {
    if (images.length > 0) {
      // Si ce sont des URLs (string), les utiliser directement
      if (typeof images[0] === 'string') {
        setImageUrls(images);
        setImageFiles([]);
      } 
      // Si ce sont des objets File, créer des previews
      else if (images[0] instanceof File) {
        const urls = images.map(file => URL.createObjectURL(file));
        setImageUrls(urls);
        setImageFiles(images);
      }
    } else {
      setImageUrls([]);
      setImageFiles([]);
    }
  }, []);

  const handleUrlAdd = () => {
    const url = prompt('Entrez l\'URL de l\'image :');
    if (url && url.trim()) {
      const newUrls = [...imageUrls, url.trim()];
      setImageUrls(newUrls);
      onChange(newUrls); // Pour l'édition (Base64/URL)
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const remainingSlots = maxImages - imageUrls.length;
    
    if (files.length > remainingSlots) {
      alert(`Vous ne pouvez ajouter que ${remainingSlots} image(s) supplémentaire(s).`);
      return;
    }

    // Filtrer et valider les fichiers
    const validFiles = [];
    
    files.forEach(file => {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} n'est pas une image valide.`);
        return;
      }

      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} est trop volumineux (max 5MB).`);
        return;
      }

      validFiles.push(file);
    });

    if (validFiles.length === 0) return;

    // Si acceptFiles est true, envoyer les objets File (pour création avec MultipartFile)
    if (acceptFiles) {
      const newFiles = [...imageFiles, ...validFiles];
      const newUrls = [...imageUrls, ...validFiles.map(file => URL.createObjectURL(file))];
      
      setImageFiles(newFiles);
      setImageUrls(newUrls);
      onChange(newFiles); // Envoyer les objets File
    } 
    // Sinon, convertir en Base64 (pour édition)
    else {
      let loadedCount = 0;
      const newUrls = [...imageUrls];

      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newUrls.push(reader.result);
          loadedCount++;
          
          if (loadedCount === validFiles.length) {
            setImageUrls(newUrls);
            onChange(newUrls); // Envoyer les Base64
          }
        };
        reader.onerror = () => {
          alert(`Erreur lors du chargement de ${file.name}`);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemove = (index) => {
    const newUrls = imageUrls.filter((_, i) => i !== index);
    setImageUrls(newUrls);

    if (acceptFiles && imageFiles.length > 0) {
      const newFiles = imageFiles.filter((_, i) => i !== index);
      setImageFiles(newFiles);
      onChange(newFiles);
    } else {
      onChange(newUrls);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      handleFileUpload({ target: { files: imageFiles } });
    }
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-dark mb-3">
        Photos ({imageUrls.length}/{maxImages})
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
                {/* Badge numéro */}
                <div className="absolute top-2 left-2 bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
                {/* Bouton supprimer */}
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-700"
                  title="Supprimer cette image"
                >
                  <FaTrash className="text-xs" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Zone d'upload */}
      {imageUrls.length < maxImages && (
        <div className="space-y-3">
          {/* Drag & Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="border-2 border-dashed border-accent rounded-lg p-8 text-center hover:border-primary hover:bg-accent/10 transition-all cursor-pointer"
          >
            <label htmlFor="file-upload" className="cursor-pointer">
              <FaUpload className="text-4xl text-primary mx-auto mb-3" />
              <p className="text-dark font-medium mb-1">
                Glissez-déposez vos images ici
              </p>
              <p className="text-sm text-dark-light mb-3">
                ou cliquez pour sélectionner plusieurs fichiers
              </p>
              <p className="text-xs text-dark-light">
                PNG, JPG, WEBP jusqu'à 5MB · Maximum {maxImages} images
              </p>
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

          {/* Bouton URL (seulement si acceptFiles est false - mode édition) */}
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

      {/* Message limite atteinte */}
      {imageUrls.length >= maxImages && (
        <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-sm text-orange-800">
            ⚠️ Limite atteinte : {maxImages} images maximum
          </p>
        </div>
      )}

      {/* Instructions */}
      {imageUrls.length === 0 && (
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
