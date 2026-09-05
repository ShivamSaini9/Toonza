import { motion } from "framer-motion";

const Blob = ({ className, animate }) => (
  <motion.div
    className={`absolute rounded-full blur-3xl opacity-30 ${className}`}
    animate={animate}
    transition={{
      duration: 30,
      repeat: Infinity,
      ease: "linear",
    }}
  />
);

const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden -z-10">
      <Blob
        className="w-[520px] h-[520px] bg-violet-600 top-[-120px] left-[-120px]"
        animate={{ x: [0, 180, 0], y: [0, 120, 0] }}
      />
      <Blob
        className="w-[420px] h-[420px] bg-cyan-500 bottom-[-120px] right-[-120px]"
        animate={{ x: [0, -160, 0], y: [0, -120, 0] }}
      />
      <Blob
        className="w-[320px] h-[320px] bg-fuchsia-500 top-[45%] left-[60%]"
        animate={{ x: [0, 120, 0], y: [0, -120, 0] }}
      />
    </div>
  );
};

export default AnimatedBackground;
