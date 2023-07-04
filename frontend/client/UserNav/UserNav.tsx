import cn from 'clsx';

import { useRouter } from 'next/navigation';
import { useSession } from '@woographql/client/SessionProvider';
import { NavLink, linkClassName } from '@woographql/ui/NavLink';
import { Button } from '@woographql/ui/button';

export function UserNav() {
  const { push } = useRouter();
  const {
    cart,
    customer,
    cartUrl,
    checkoutUrl,
    accountUrl,
    logout: killSession,
    isAuthenticated,
    refetchUrls,
    fetching,
  } = useSession();

  const goToCart = () => {
    push(cartUrl);
  };

  const goToCheckout = () => {
    push(checkoutUrl);
  };

  const goToAccount = () => {
    push(accountUrl);
  };

  const logout = () => {
    killSession(`Goodbye, ${customer?.firstName}`);
    refetchUrls();
  };

  return (
    <>
      <li className="group">
        <Button
          data-testid="cart-button"
          className={cn(
            'flex flex-row gap-x-2 items-center p-0 hover:no-underline text-base font-normal',
            linkClassName,
          )}
          disabled={fetching}
          variant='link'
          onClick={goToCart}
        >
          {cart?.contents?.itemCount || 0}
          <i className="fa-solid fa-basket-shopping" aria-hidden />
          <span className="transition-all origin-left w-0 scale-x-0 group-hover:scale-x-100 group-hover:w-8">
            Cart
          </span>
        </Button>
      </li>
      <li className="group w-auto">
        <Button
          data-testid="checkout-button"
          className={cn(
            'flex flex-row gap-x-2 items-center p-0 hover:no-underline text-base font-normal',
            linkClassName,
          )}
          disabled={fetching}
          variant='link'
          onClick={goToCheckout}
        >
          <i className="fa-solid fa-cash-register" aria-hidden />
          <span className="transition-all origin-left w-0 scale-x-0 group-hover:scale-x-100 group-hover:w-16">
            Checkout
          </span>
        </Button>
      </li>
      {isAuthenticated ? (
        <>
          <li className="group">
            <Button
              data-testid="account-button"
              className={cn(
                'flex flex-row gap-x-2 items-center p-0 hover:no-underline text-base font-normal',
                linkClassName,
              )}
              disabled={fetching}
              variant='link'
              onClick={goToAccount}
            >
              <i className="fa-solid fa-user" aria-hidden />
              <span className="transition-all origin-left w-0 scale-x-0 group-hover:scale-x-100 group-hover:w-16">
                Account
              </span>
            </Button>
          </li>
          <li className="group">
            <Button
              data-testid="logout-button"
              className={cn(
                'flex flex-row gap-x-2 items-center p-0 hover:no-underline text-base font-normal',
                linkClassName,
              )}
              disabled={fetching}
              variant='link'
              onClick={logout}
            >
              <i className="fa-solid fa-arrow-right-from-bracket" aria-hidden />
              <span className="transition-all origin-left w-0 scale-x-0 group-hover:scale-x-100 group-hover:w-16">Logout</span>
            </Button>
          </li>
        </>
      ) : (
        <li className="group">
          <NavLink
            data-testid="login-link"
            className="flex flex-row gap-x-2 items-center"
            href="/login"
          >
            <i className="fa-solid fa-arrow-right-to-bracket" aria-hidden />
            <span className="transition-all origin-left w-0 scale-x-0 group-hover:scale-x-100 group-hover:w-8">Login</span>
          </NavLink>
        </li>
      )}
    </>
  )
}