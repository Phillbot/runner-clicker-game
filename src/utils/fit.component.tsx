import { FC, ReactNode, useEffect, useRef, useState } from 'react';

type Props = Readonly<{
  children: ReactNode;
  className?: string;
}>;

export const Fit: FC<Props> = ({ children, className }) => {
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

    const resizeObserver = new ResizeObserver(() => {
      resizeText();
    });

    const container = containerRef.current;
    const parent = container?.parentElement;
    if (parent) {
      resizeObserver.observe(parent);
    }

    // Initial resize after component mounts
    resizeText();

    return () => {
      if (parent) {
        resizeObserver.unobserve(parent);
      }
      resizeObserver.disconnect();
    };
  }, [children]);

  return (
    <div ref={containerRef} className={className} style={{ fontSize }}>
      {children}
    </div>
  );
};
