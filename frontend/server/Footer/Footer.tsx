import Link from 'next/link';

import { cn } from '@woographql/utils/ui';

function CreatorInfo() {
  return (
    <>
      <small className="flex-shrink basis-auto lg:mr-2">
        <strong>{process.env.SITE_NAME}</strong>
      </small>
      <small className="mb-6 basis-auto lg:mb-0">
        created by
        &nbsp;
        <Link className="font-bold text-background" href="https://woographql.com/about">Geoff Taylor</Link>
      </small>
    </>
  );
}

function SocialLinks() {
  return (
    <div className="flex items-center justify-center order-first lg:order-last lg:justify-end basis-full lg:basis-1/3">
      <Link className="h-16 pr-5 text-2xl text-background icon-button" href="https://twitter.com/kidunot89" aria-label="Follow me on Twitter">
        <i className="fa-brands fa-twitter" aria-hidden />
      </Link>
      <Link className="h-16 pr-5 text-2xl text-background icon-button" href="https://github.com/kidunot89" aria-label="Follow me on Github">
        <i className="fa-brands fa-github" aria-hidden />
      </Link>
      <Link className="h-16 pr-5 text-2xl text-background icon-button" href="https://linkedin.com/in/kidunot89/" aria-label="Follow me on LinkedIn">
        <i className="fa-brands fa-linkedin" aria-hidden />
      </Link>
    </div>
  );
}

export function Footer() {
  return (
    <div className="w-full h-48 mx-auto text-background bg-foreground">
      <div
        className={cn(
          'min-h-full h-full w-full mx-auto max-w-screen-lg flex flex-wrap  justify-center pt-3 px-5',
          'lg:px-6 lg:flex-nowrap lg:items-center',
        )}
      >
        <CreatorInfo />
        <SocialLinks />
      </div>
    </div>
  );
}

export default Footer;
