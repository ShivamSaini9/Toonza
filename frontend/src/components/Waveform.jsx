import { motion } from "framer-motion";

const bars = Array.from({ length: 18 });

const Waveform = () => {
  return (
    <div className="flex items-end gap-1 h-12 justify-center mt-10">
      {bars.map((_, i) => (
        <motion.span
          key={i}
          className="w-1 rounded-full bg-gradient-to-t from-cyan-400 to-violet-500"
          animate={{
            height: ["20%", "100%", "40%"],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.08,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export default Waveform;
