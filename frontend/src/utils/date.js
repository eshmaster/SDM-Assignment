const defaultOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
const defaultDateTimeOptions = {
  ...defaultOptions,
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
};

export const formatDate = (value, options = defaultOptions) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString(undefined, options);
};

export const formatDateTime = (value, options = defaultDateTimeOptions) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString(undefined, options);
};
