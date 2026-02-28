export const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: '€',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
};

export const calculateNights = (checkIn, checkOut) => {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
