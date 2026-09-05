const NoiseOverlay = () => {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[5] opacity-[0.035]"
      style={{
        backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')",
      }}
    />
  );
};

export default NoiseOverlay;
