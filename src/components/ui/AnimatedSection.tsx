'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedSectionProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade';
  className?: string;
}

const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  children,
  delay = 0,
  duration = 0.42,
  direction = 'up',
  className = ''
}) => {
  const variants = {
    hidden: {
      opacity: 0,
      y: direction === 'up' ? 18 : direction === 'down' ? -18 : 0,
      x: direction === 'left' ? 18 : direction === 'right' ? -18 : 0,
      scale: 1
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1
    }
  };

  const transitionProps = {
    duration,
    delay
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={variants}
      transition={transitionProps}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedSection;
