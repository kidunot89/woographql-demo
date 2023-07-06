import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useShopContext } from '@woographql/client/ShopProvider';
import { Input } from '@woographql/ui/input';
import { Slider } from '@woographql/ui/slider';

export function PriceRange() {
  const { push } = useRouter();
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(100);
  const [debouncedRange, setDebouncedRange] = useState<[number, number]>([0, 100]);
  const {
    globalMax,
    globalMin,
    buildUrl,
  } = useShopContext();

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedRange([min, max]);
    }, 500);
    return () => clearTimeout(timeout);
  }, [min, max]);

  useEffect(() => {
    const url = buildUrl({
      price: debouncedRange,
    });
    
    push(url, { shallow: true });
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
          setMin(value);
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
          setMax(value);
        }}
      />
      <Slider
        className="w-full"
        minStepsBetweenThumbs={1}
        defaultValue={[globalMin, globalMax]}
        step={1}
        onValueChange={(values: [number, number]) => {
          if (values[0] !== min) {
            setMin(values[0]);
          }
          if (values[1] !== max) {
            setMax(values[1]);
          }
        }}
      />
    </div>
  );
}