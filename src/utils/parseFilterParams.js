const parseContactType = (type) => {
  const isString = typeof type === 'string';
  if (!isString) return;
  const contactType = (type) => ['work', 'home', 'personal'].includes(type);
  if (contactType(type)) return type;
};

const parseIsFavorite = (isFavoriteValue) => {
  if (typeof isFavoriteValue === 'boolean') return { isFavoriteValue };
  const toString = String(isFavoriteValue).toLowerCase();
  if (toString === 'true' || toString === '1') return true;
  if (toString === 'false' || toString === '0') return false;
  return undefined;
};

export const parseFilterParams = (query) => {
  const { isFavorite, contactType } = query;
  const parsedIsFavorite = parseIsFavorite(isFavorite);
  const parsedContactType = parseContactType(contactType);
  return { isFavorite: parsedIsFavorite, contactType: parsedContactType };
};
