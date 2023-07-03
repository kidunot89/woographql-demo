import { PropsWithChildren } from 'react';

import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@woographql/ui/sheet"
import { Button } from "@woographql/ui/button";


export function ShopSidebar({ children }: PropsWithChildren) {
  return (
    <>
      <Sheet>
        <SheetTrigger asChild className="lg:hidden w-16 fixed inset-x-0 mx-auto bottom-10 z-30">
          <Button type="button">
            <i className="fa-solid fa-filter" aria-label="Open sidebar" />
          </Button>
        </SheetTrigger>
        <SheetContent>
          {children}
          <SheetFooter>
            <SheetClose asChild className="mt-4">
              <Button className="w-full flex items-center gap-x-2" type="button">
                <i className="fa-solid fa-circle-xmark" aria-label="close sidebar" />
                Close
              </Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      <div className="hidden lg:block w-1/4 px-4">
        {children}
      </div>
    </>
  )
}