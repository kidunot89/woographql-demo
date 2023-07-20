import { useRouter } from 'next/navigation';

import { cn } from '@woographql/utils/ui';
import { deleteClientSessionId } from '@woographql/utils/client';
import { useSession } from '@woographql/client/SessionProvider';
import { NavLink, linkClassName } from '@woographql/ui/NavLink';
import { Button } from '@woographql/ui/button';

export function UserNav() {
  const router = useRouter();
  const {
    cart,
    customer,
    cartUrl,
    checkoutUrl,
    accountUrl,
    logout: killSession,
    isAuthenticated,
    fetching,
  } = useSession();

  console.log(cartUrl);

  const goToCartPage = () => {
    deleteClientSessionId();
    console.log('Go to cart page');
    window.location.href = cartUrl;
  };
  const goToCheckoutPage = () => {
    deleteClientSessionId();
    window.location.href = checkoutUrl;
  };
  const goToAccountPage = () => {
    deleteClientSessionId();
    window.location.href = accountUrl;
  };

  const logout = () => {
    killSession(`Goodbye, ${customer?.firstName}`);
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
          onClick={goToCartPage}
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
          onClick={goToCheckoutPage}
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
              onClick={goToAccountPage}
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