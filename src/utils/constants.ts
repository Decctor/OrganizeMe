// Effects for framer motion

// Config of the two states for animated modal backdrop
export const backdropFramerMotionConfig = {
  visible: { opacity: 1 },
  hidden: { opacity: 0 },
};
// Config of the two states for animated modal
export const modalFramerMotionConfig = {
  hidden: {
    y: "-45%",
    x: "-45%",
    scale: 0.5,
    opacity: 0.3,
  },
  visible: {
    y: "-50%",
    x: "-50%",
    scale: 1,
    opacity: 1,
  },
};
