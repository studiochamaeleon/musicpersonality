'use client';

import type { ComponentProps } from 'react';

type ResultSectionLinkProps = Omit<ComponentProps<'a'>, 'href'> & { href: `#${string}` };

/** Move within the result without replacing the fragment that stores a music match. */
export default function ResultSectionLink({ href, onClick, ...props }: ResultSectionLinkProps) {
  return <a {...props} href={href} onClick={event => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    event.preventDefault();
    const target = document.getElementById(href.slice(1));
    if (!target) return;
    target.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    target.focus({ preventScroll: true });
  }} />;
}
