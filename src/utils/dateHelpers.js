import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export const formatDate = (date) => {
  if (!date) return '';
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return format(parsedDate, 'dd MMMM yyyy', { locale: fr });
};

export const formatDateTime = (date) => {
  if (!date) return '';
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return format(parsedDate, 'dd/MM/yyyy HH:mm', { locale: fr });
};

export const formatDateInput = (date) => {
  if (!date) return '';
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return format(parsedDate, 'yyyy-MM-dd');
};
