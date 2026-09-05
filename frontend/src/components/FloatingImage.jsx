// import { motion } from "framer-motion";

// const FloatingImage = () => {
//   return (
//     <motion.img
//       src="dog.jpg" // put image in public/images
//       alt="AI Preview"
//       className="w-full max-w-lg mx-auto"
//       animate={{ y: [0, -12, 0] }}
//       transition={{
//         duration: 4,
//         repeat: Infinity,
//         ease: "easeInOut",
//       }}
//     />
//   );
// };

// export default FloatingImage;

import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  cubicBezier,
} from "framer-motion";

export const ImageFrame = ({
  src,
  tilt = 0,
  direction = { x: 0, y: 1 }, // default: down
}) => {
  const { scrollYProgress } = useScroll();

  // Clamp scroll progress (prevents jitter)
  const clamped = useTransform(scrollYProgress, (v) =>
    Math.min(Math.max(v, 0), 1)
  );

  // Helper to create smooth parallax per axis
  const createParallax = (axisValue) =>
    useSpring(
      useTransform(clamped, (v) => {
        const eased = cubicBezier(0.22, 1, 0.36, 1)(v);
        return eased * 260 * axisValue;
      }),
      {
        stiffness: 70,
        damping: 30,
        mass: 1,
      }
    );

  const x = createParallax(direction.x);
  const y = createParallax(direction.y);

  return (
    <motion.div
      style={{ x, y, rotate: tilt }}
      className="relative p-[15px] rounded-[32px]
        bg-white/10 backdrop-blur-xl
        border border-white/20
        shadow-[0_30px_80px_rgba(0,0,0,0.6)]
        will-change-transform"
    >
      {/* Inner image container */}
      <div className="relative rounded-3xl overflow-hidden bg-black">
        <img src={src} alt="art" className="w-72 h-72 object-cover" />
      </div>
    </motion.div>
  );
};

const FramedParallaxImages = () => {
  return (
    <div className=" flex justify-between items-center pointer-events-none">
      {/* LEFT */}
      <ImageFrame src="/image1.jpg" tilt={10} direction={{ x: -1, y: -0.6 }} />

      {/* RIGHT */}
      <ImageFrame
        src="/image3.png"
        tilt={-10}
        direction={{ x: 0.6, y: -1 }} // top-right
      />
    </div>
  );
};

export default FramedParallaxImages;

// import { motion, useMotionValue, useTransform } from "framer-motion";

// const ParallaxImage = () => {
//   const x = useMotionValue(0);
//   const y = useMotionValue(0);

//   const rotateX = useTransform(y, [-50, 50], [8, -8]);
//   const rotateY = useTransform(x, [-50, 50], [-8, 8]);

//   return (
//     <div
//       className="flex justify-center"
//       onMouseMove={(e) => {
//         const rect = e.currentTarget.getBoundingClientRect();
//         x.set(e.clientX - rect.left - rect.width / 2);
//         y.set(e.clientY - rect.top - rect.height / 2);
//       }}
//       onMouseLeave={() => {
//         x.set(0);
//         y.set(0);
//       }}
//     >
//       <motion.img
//         src="dog.jpg"
//         className="w-full max-w-lg"
//         style={{ rotateX, rotateY }}
//         transition={{ type: "spring", stiffness: 120, damping: 12 }}
//       />
//     </div>
//   );
// };

// export default ParallaxImage;
