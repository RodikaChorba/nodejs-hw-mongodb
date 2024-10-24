const parseType = (contactType) => {
  const isString = typeof contactType === 'string';
  if (!isString) return;
  const isType = (contactType) =>
    ['work', 'home', 'personal'].includes(contactType);

  if (isType(contactType)) return contactType;
};

const parseStatus = (isFavourite) => {
  if (typeof isFavourite === 'boolean') return isFavourite;

  if (typeof isFavourite === 'string') {
    if (isFavourite.toLowerCase() === 'true') return true;
    if (isFavourite.toLowerCase() === 'false') return false;
  }

  return;
};

export const parseFilterParams = (query = {}) => {
  const { contactType, isFavourite } = query;

  const parsedType = parseType(contactType);
  const parsedStatus = parseStatus(isFavourite);

  const filter = {};
  if (parsedType) filter.contactType = parsedType;
  if (parsedStatus !== undefined) filter.isFavourite = parsedStatus;

  return filter;
};
