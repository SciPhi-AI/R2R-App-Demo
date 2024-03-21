export const getSearchUrl = (query: string, search_uuid: string) => {
  const prefix = "";
  return `${prefix}?q=${encodeURIComponent(query)}&rid=${search_uuid}`;
};
