/**
 * @file MotionWrappers.jsx
 * @description Standard motion wrappers using Framer Motion (Fade, Slide, Scale, Button presses, Floating icons).
 */

import React from "react";
import { motion } from "framer-motion";

// 1. Fade In
export const FadeIn = ({ children, delay = 0, duration = 0.2, ...props }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration, delay, ease: "easeOut" }}
    {...props}
  >
    {children}
  </motion.div>
);

// 2. Fade Up
export const FadeUp = ({ children, delay = 0, duration = 0.25, ...props }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration, delay, ease: "easeOut" }}
    {...props}
  >
    {children}
  </motion.div>
);

// 3. Scale In
export const ScaleIn = ({ children, delay = 0, duration = 0.2, ...props }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration, delay, ease: "easeOut" }}
    {...props}
  >
    {children}
  </motion.div>
);

// 4. Slide Left
export const SlideLeft = ({ children, delay = 0, duration = 0.25, ...props }) => (
  <motion.div
    initial={{ opacity: 0, x: 25 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration, delay, ease: "easeOut" }}
    {...props}
  >
    {children}
  </motion.div>
);

// 5. Slide Right
export const SlideRight = ({ children, delay = 0, duration = 0.25, ...props }) => (
  <motion.div
    initial={{ opacity: 0, x: -25 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration, delay, ease: "easeOut" }}
    {...props}
  >
    {children}
  </motion.div>
);

// 6. Drawer Animation (Slides from bottom or side depending on anchor)
export const DrawerAnimation = ({ children, position = "right", ...props }) => {
  const slideDirections = {
    right: { initial: { x: "100%" }, animate: { x: 0 }, exit: { x: "100%" } },
    left: { initial: { x: "-100%" }, animate: { x: 0 }, exit: { x: "-100%" } },
    bottom: { initial: { y: "100%" }, animate: { y: 0 }, exit: { y: "100%" } },
  };

  return (
    <motion.div
      {...slideDirections[position]}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// 7. Page Transition
export const PageTransition = ({ children, ...props }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.15 }}
    {...props}
  >
    {children}
  </motion.div>
);

// 8. Card Hover
export const CardHover = ({ children, ...props }) => (
  <motion.div
    whileHover={{ y: -4, shadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
    transition={{ type: "spring", stiffness: 400, damping: 25 }}
    {...props}
  >
    {children}
  </motion.div>
);

// 9. Floating Animation (Pulsing bounce for pins)
export const FloatingAnimation = ({ children, ...props }) => (
  <motion.div
    animate={{ y: [0, -6, 0] }}
    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
    {...props}
  >
    {children}
  </motion.div>
);

// 10. Button Press
export const ButtonPress = ({ children, ...props }) => (
  <motion.button
    whileTap={{ scale: 0.96 }}
    transition={{ type: "spring", stiffness: 500, damping: 30 }}
    {...props}
  >
    {children}
  </motion.button>
);

// 11. Loading Pulse
export const LoadingPulse = ({ children, ...props }) => (
  <motion.div
    animate={{ opacity: [0.4, 1, 0.4] }}
    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
    {...props}
  >
    {children}
  </motion.div>
);
