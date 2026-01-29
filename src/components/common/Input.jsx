const Input = ({ 
  label, 
  type = 'text', 
  name, 
  value, 
  onChange, 
  placeholder,
  required = false,
  disabled = false,
  icon = null,
  className = ''
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-dark mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary">
            {icon}
          </div>
        )}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`input w-full ${icon ? 'pl-12' : ''} ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''} ${className}`}
        />
      </div>
    </div>
  );
};

export default Input;
