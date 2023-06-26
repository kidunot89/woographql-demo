export const isBrowser = () => typeof window !== 'undefined';
export const isNavigator = () => typeof window !== 'undefined' && typeof window.navigator !== 'undefined';
export function isSSR() {
  return typeof window === 'undefined';
}