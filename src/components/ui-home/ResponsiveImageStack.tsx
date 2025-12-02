"use client";

import { useState, useEffect } from "react";
import ImageStackMobile from "./ImageStackMobile";
import ImageStackTablet from "./ImageStackTablet";
import ImageStackDesktop from "./ImageStackDesktop";

interface ResponsiveImageStackProps {
  imageSrcs: [string, string, string]; // [left, middle, right]
  alt: string;
}

export default function ResponsiveImageStack({ imageSrcs, alt }: ResponsiveImageStackProps) {
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setScreenSize('mobile');
      } else if (width < 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };

    // Check on mount
    checkScreenSize();

    // Add event listener
    window.addEventListener('resize', checkScreenSize);

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Render based on screen size
  if (screenSize === 'mobile') {
    return <ImageStackMobile imageSrcs={imageSrcs} alt={alt} />;
  } else if (screenSize === 'tablet') {
    return <ImageStackTablet imageSrcs={imageSrcs} alt={alt} />;
  } else {
    return <ImageStackDesktop imageSrcs={imageSrcs} alt={alt} />;
  }
}
