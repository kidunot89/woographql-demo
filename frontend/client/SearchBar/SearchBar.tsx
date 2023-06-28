import { useState, useEffect, use } from 'react';

import { useShopContext } from '@woographql/client/ShopProvider';
import { Input } from "@woographql/ui/input";

export function SearchBar() {
  const {
    setSearch,
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
    setSearch(debouncedSearchInput);
  }, [debouncedSearchInput]);

  return (
    <Input
      className="mb-4"
      value={searchInput}
      onChange={(event) => setSearchInput(event.target.value)}
    />
  );
}