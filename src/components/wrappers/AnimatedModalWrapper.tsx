import React, { PropsWithChildren } from "react";
import { AnimatePresence, motion } from "framer-motion";
const backdrop = {
  visible: { opacity: 1 },
  hidden: { opacity: 0 },
};
const modal = {
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
type AnimatedModalWrapperProps = {
  modalIsOpen: boolean;
  width: string;
  height: string;
};
function AnimatedModalWrapper({
  children,
  modalIsOpen,
  width,
  height,
}: PropsWithChildren<AnimatedModalWrapperProps>) {
  const MODAL_STYLES = {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%,-50%)",
    backgroundColor: "#fff",
    minWidth: width ? width : "93%",
    height: height ? height : "98%",
    borderRadius: "10px",
    padding: "10px",
    zIndex: 1000,
  };
  const OVERLAY_STYLES = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,.85)",
    zIndex: 1000,
  };
  return (
    <>
      {modalIsOpen && (
        <AnimatePresence>
          <motion.div
            variants={backdrop}
            initial="hidden"
            animate="visible"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,.85)",
              zIndex: 1000,
            }}
          >
            <motion.div
              variants={modal}
              initial="hidden"
              animate="visible"
              className={`fixed top-[50%] left-[50%] z-[1000] h-[90%] w-[90%] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-[#fff] p-3 lg:h-[${height}] lg:w-[${width}]`}
              // style={{
              //   position: "fixed",
              //   top: "50%",
              //   left: "50%",
              //   transform: "translate(-50%,-50%)",
              //   backgroundColor: "#fff",
              //   minWidth: width ? width : "93%",
              //   height: height ? height : "98%",
              //   borderRadius: "10px",
              //   padding: "10px",
              //   zIndex: 1000,
              // }}
            >
              {children}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}
    </>
  );
}

export default AnimatedModalWrapper;
