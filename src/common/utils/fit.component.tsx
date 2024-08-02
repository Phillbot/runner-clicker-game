import React, { useRef, useEffect, useState } from 'react';

type Props = {
  children: React.ReactNode;
  className?: string;
};

export const Fit: React.FC<Props> = ({ children, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState('inherit');

  useEffect(() => {
    const resizeText = () => {
      const container = containerRef.current;
      if (!container) return;

      const parent = container.parentElement;
      if (!parent) return;

      const parentWidth = parent.clientWidth;
      const containerWidth = container.scrollWidth;

      if (containerWidth > parentWidth) {
        const newFontSize = (parentWidth / containerWidth) * 100;
        setFontSize(`${newFontSize}%`);
      } else {
        setFontSize('inherit');
      }
    };

    resizeText();

    window.addEventListener('resize', resizeText);
    return () => {
      window.removeEventListener('resize', resizeText);
    };
  }, [children]);

  return (
    <div ref={containerRef} className={className} style={{ fontSize }}>
      {children}
    </div>
  );
};
