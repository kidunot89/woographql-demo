import { useEffect, useState } from "react";

import { ProductTypesEnum } from "@woographql/graphql";
import { useShopContext, ProductWithPrice } from "@woographql/client/ShopProvider";
import { Input } from "@woographql/ui/input";
import { Slider } from "@woographql/ui/slider";

export function PriceRange() {
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(100);
  const [debouncedRange, setDebouncedRange] = useState<[number, number]>([0, 100]);
  const {
    globalMax,
    globalMin,
    priceRange,
    setPriceRange,
  } = useShopContext();

  useEffect(() => {
    setMin(globalMin);
    setMax(globalMax);
  }, []);

  useEffect(() => {
      setMin(priceRange[0]);
      setMax(priceRange[1] || globalMax);
  }, [priceRange]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPriceRange(debouncedRange);
    }, 500);
    return () => clearTimeout(timeout);
  }, [debouncedRange]);

  return (
    <div className="mb-4 flex gap-x-2 gap-y-4 flex-wrap">
      <Input
        className="basis-1/2 shrink"
        min={globalMin}
        max={globalMax}
        value={min}
        type="number"
        onChange={(event) => {
          const value = Number(event.target.value);
          setDebouncedRange([value, max]);
        }}
      />
      <Input
        className="basis-0 grow"
        value={max}
        min={globalMin}
        max={globalMax}
        type="number"
        onChange={(event) => {
          const value = Number(event.target.value);
          setDebouncedRange([min, value]);
        }}
      />
      <Slider
        className="w-full"
        minStepsBetweenThumbs={1}
        defaultValue={[globalMin, globalMax]}
        step={1}
        onValueChange={(values: [number, number]) => {
          if (values !== debouncedRange) {
            setDebouncedRange(values as [number, number]);
          }
          
        }}
      />
    </div>
  );
}