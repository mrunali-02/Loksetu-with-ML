import { useSearchParams } from 'react-router-dom';

export function useEventFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = {
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    tags: searchParams.get('tags') ? searchParams.get('tags').split(',') : [],
    dateFrom: searchParams.get('dateFrom') || '',
    dateTo: searchParams.get('dateTo') || '',
    availability: searchParams.get('availability') || ''
  };

  const setFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);

    if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
      newParams.delete(key);
    } else {
      if (Array.isArray(value)) {
        newParams.set(key, value.join(','));
      } else {
        newParams.set(key, value);
      }
    }

    setSearchParams(newParams, { replace: true });
  };

  const clearAll = () => {
    setSearchParams({}, { replace: true });
  };

  return { filters, setFilter, clearAll };
}
