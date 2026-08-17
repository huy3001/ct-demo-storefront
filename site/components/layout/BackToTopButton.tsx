'use client';

import { useEffect, useState } from 'react';

const SHOW_AFTER_SCROLL_Y = 200;

export default function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    function updateVisibility() {
      setIsVisible(window.scrollY >= SHOW_AFTER_SCROLL_Y);
    }

    updateVisibility();
    window.addEventListener('scroll', updateVisibility, { passive: true });

    return () => window.removeEventListener('scroll', updateVisibility);
  }, []);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (!isVisible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className="fixed right-4 bottom-4 z-50 flex items-center gap-2 rounded-full bg-charcoal p-3 text-sm font-medium text-white shadow-lg hover:bg-terra focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal md:right-6 md:bottom-6"
      aria-label="Back to top"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-arrow-up-icon lucide-arrow-up"
      >
        <path d="m5 12 7-7 7 7" />
        <path d="M12 19V5" />
      </svg>
    </button>
  );
}
