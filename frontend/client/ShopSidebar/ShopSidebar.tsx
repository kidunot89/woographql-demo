import { PropsWithChildren } from 'react';

import { useIsTabletOrMobile } from '@woographql/hooks/mobile';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@woographql/ui/sheet"
import { Button } from "@woographql/ui/button";


export function ShopSidebar({ children }: PropsWithChildren) {
  const isTabletOrMobile = useIsTabletOrMobile();

  if (isTabletOrMobile) {
    return (
      <Sheet>
        <SheetTrigger className="fixed inset-x-0 mx-auto bottom-10 z-30">
          <Button type="button">
            <i className="fa-solid fa-filter" aria-label="Open sidebar" />
          </Button>
        </SheetTrigger>
        <SheetContent>
          {children}
          <SheetFooter>
            <SheetClose asChild className="mt-4">
              <Button className="w-full" type="button">
                <i className="fa-solid fa-circle-xmark" aria-label="close sidebar" />
              </Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="w-1/4 px-4">
      {children}
    </div>
  )
}