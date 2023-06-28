import cn from 'clsx';

import { PaColor } from "@woographql/graphql";
import { useShopContext } from '@woographql/client/ShopProvider';

import { Badge } from "@woographql/ui/badge";
import { Button } from "@woographql/ui/button";

interface ColorSwatchProps {
  color: string;
  circle?: boolean;
  small?: boolean;
}

function ColorSwatch({ color, circle, small }: ColorSwatchProps) {
  return (
    <div
      className={cn(
        circle ? 'rounded-full' : 'rounded',
        small ? 'w-4 h-4' : 'w-6 h-6',
      )}
      style={{ backgroundColor: color }}
    />
  );
}

export interface PaColorPickerProps {
  colors: PaColor[];
}

export function PaColorPicker({ colors }: PaColorPickerProps) {
  const {
    selectedColors,
    addColor,
    removeColor,
  } = useShopContext();
  return (
    <>
      <div className="flex gap-2 flex-wrap mb-4">
        {selectedColors.map((slug) => {
          const color = colors.find((c) => c.slug === slug);
          if (!color) {
            return null;
          }
          return (
            <Badge
              variant="outline"
              onClick={() => removeColor(slug)}
              className={cn(
                'hover:bg-red-500 hover:text-white cursor-pointer',
                'transition-colors duration-250 ease-in-out',
                'flex gap-1 border-0'
              )}
            >
              <ColorSwatch color={color.slug as string} circle small />
              {color.name}
            </Badge>
          )
        })}
      </div>
      <ul className="mb-4">
        {colors.map((color) => {
          if (selectedColors.includes(color.slug as string)) {
            return null;
          }
          return (
            <li key={color.id}>
              <Button
                variant="link"
                className="px-0 flex gap-2"
                onClick={() => addColor(color.slug as string)}
              >
                <ColorSwatch color={color.slug as string} />
                {color.name}
              </Button>
            </li>
          );
        })}
      </ul>
    </>
  );
}