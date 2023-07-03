import { PropsWithChildren, ReactElement } from 'react';
import {
  render,
  RenderOptions,
  RenderResult,
  act,
} from '@testing-library/react';
import { queries, Queries } from '@testing-library/dom';
import ResizeObserver from 'resize-observer-polyfill'

function AllTheProviders({ children }: PropsWithChildren<unknown>) {
  return (
    <>
      {children}
    </>
  );
}

function customRender<
  Q extends Queries = typeof queries,
  Container extends Element | DocumentFragment = HTMLElement
>(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'queries'>,
): RenderResult {
  return render(ui, { wrapper: AllTheProviders, ...options });
}

export const whenStable = async () => act(async () => {
  await new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
});

export * from '@testing-library/react';
export { customRender as render };
global.ResizeObserver = ResizeObserver;

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));