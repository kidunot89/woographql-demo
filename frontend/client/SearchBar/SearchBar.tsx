import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useShopContext } from '@woographql/client/ShopProvider';
import { Input } from "@woographql/ui/input";

export function SearchBar() {
  const { push } = useRouter();
  const {
    currentUrl,
    buildUrl,
    search,
  } = useShopContext();
  const [searchInput, setSearchInput] = useState(search);
  const [debouncedSearchInput, setDebouncedSearchInput] = useState(searchInput);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearchInput(searchInput);
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    const url = buildUrl({
      search: debouncedSearchInput,
      page: 1,
    });
    if (url !== currentUrl) {
      push(url, { shallow: true });
    }
  }, [debouncedSearchInput]);

  return (
    <Input
      className="mb-4"
      value={searchInput}
      onChange={(event) => setSearchInput(event.target.value)}
    />
  );
}