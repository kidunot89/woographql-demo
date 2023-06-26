'use client'
/* istanbul ignore file */
// TODO: add test coverage
import { isBrowser } from '@woographql/utils/ssr';
import { emStringToPixels } from '@woographql/utils/conversion';

export const getWindowWidth = (): number => window.innerWidth
  || document.documentElement.clientWidth
  || document.body.clientWidth;

export const getWindowHeight = (): number => window.innerHeight
  || document.documentElement.clientHeight
  || document.body.clientHeight;

const breakpointToPixels = (breakpoint: string): string|number => {
  let breakpointPixels;
  if (breakpoint.endsWith('em')) {
    breakpointPixels = emStringToPixels(breakpoint);
  } else {
    [breakpointPixels] = breakpoint.split('px');
  }

  return breakpointPixels;
};

export const isLessThanBreakpoint = (breakpoint: string): boolean => {
  /*
   * Determines whether the current window viewport is less
   * than a given breakpoint, in ems.  Uses ems because that's how
   * our breakpoints are currently defined in `theme.ts`
   *
   * params:
   *  - breakpoint: string of the form 'XXem'
   * returns
   *  - boolean: true if less than the given breakpoint, otherwise false
   */
  if (!isBrowser()) return false; // SSR sanity check

  const breakpointPixels = breakpointToPixels(breakpoint);

  const width = getWindowWidth();
  return width < Number(breakpointPixels);
};

export const isMoreThanBreakpoint = (breakpoint: string): boolean => {
  /*
   * Determines whether the current window viewport is less
   * than a given breakpoint, in ems.  Uses ems because that's how
   * our breakpoints are currently defined in `theme.ts`
   *
   * params:
   *  - breakpoint: string of the form 'XXem'
   * returns
   *  - boolean: true if less than the given breakpoint, otherwise false
   */
  if (!isBrowser()) return false; // SSR sanity check

  const breakpointPixels = breakpointToPixels(breakpoint);

  const width = getWindowWidth();
  return width >= Number(breakpointPixels);
};