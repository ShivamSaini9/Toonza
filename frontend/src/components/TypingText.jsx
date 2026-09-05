import { useEffect, useState } from "react";

const TypingText = ({ text }) => {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i));
      i++;
      if (i > text.length) clearInterval(interval);
    }, 60);

    return () => clearInterval(interval);
  }, [text]);

  return (
    <p className="mt-6 text-sm text-cyan-400 font-mono tracking-wide">
      {displayed}
      <span className="animate-pulse">▍</span>
    </p>
  );
};

export default TypingText;
