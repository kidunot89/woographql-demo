/* eslint-disable import/no-extraneous-dependencies */
import { useState } from 'react';
import useThrottledCallback from 'beautiful-react-hooks/useThrottledCallback';
import useWindowResize from 'beautiful-react-hooks/useWindowResize';

import { theme } from '@woographql/tailwind.config.js';
import { isLessThanBreakpoint, isMoreThanBreakpoint } from '@woographql/utils/mobile';
import type { ScreensConfig } from 'tailwindcss/types/config';

type AxisScreensConfig = {
  sm: string;
  md: string;
  lg: string;
  xl: string;
} & ScreensConfig

// Creates a hook for tracking whether the current window is below a certain breakpoint
const createHookFromBreakpoint = (breakpoint: string) => (): boolean => {
  const [belowBreakpoint, setBelowBreakpoint] = useState(
    isLessThanBreakpoint(breakpoint),
  );
  const onWindowResize = useWindowResize();

  const options = {
    leading: false,
    trailing: true,
  };

  const onWindowResizeHandler = useThrottledCallback(
    () => {
      setBelowBreakpoint(isLessThanBreakpoint(breakpoint));
    },
    [breakpoint],
    500,
    options,
  );

  onWindowResize(onWindowResizeHandler);

  return belowBreakpoint;
};

const createHookFromBreakpointRange = (min: string, max: string) => (): boolean => {
  const [minBreakpoint, setMinBreakpoint] = useState<boolean>(
    isMoreThanBreakpoint(min),
  );
  const [maxBreakpoint, setMaxBreakpoint] = useState<boolean>(
    isLessThanBreakpoint(max),
  );
  const onWindowResize = useWindowResize();

  const options = {
    leading: false,
    trailing: true,
  };

  const onWindowResizeHandler = useThrottledCallback(
    () => {
      setMaxBreakpoint(isLessThanBreakpoint(min));
      setMinBreakpoint(isMoreThanBreakpoint(max));
    },
    [min, max],
    500,
    options,
  );

  onWindowResize(onWindowResizeHandler);

  return minBreakpoint && maxBreakpoint;
};

export const useIsMobile = createHookFromBreakpoint((theme?.screens as AxisScreensConfig)?.sm);

export const useIsTabletOrMobile = createHookFromBreakpointRange(
  '0px',
  (theme?.screens as AxisScreensConfig)?.lg,
);

export const useIsTablet = createHookFromBreakpointRange(
  (theme?.screens as AxisScreensConfig)?.md,
  (theme?.screens as AxisScreensConfig)?.lg,
);

export const useIsDesktopOrXL = createHookFromBreakpointRange(
  (theme?.screens as AxisScreensConfig)?.md,
  (theme?.screens as AxisScreensConfig)?.xl,
);

export const useIsDesktop = createHookFromBreakpointRange(
  (theme?.screens as AxisScreensConfig)?.md,
  (theme?.screens as AxisScreensConfig)?.lg,
);

export const useIsXLDesktop = createHookFromBreakpointRange(
  (theme?.screens as AxisScreensConfig)?.lg,
  (theme?.screens as AxisScreensConfig)?.xl,
);