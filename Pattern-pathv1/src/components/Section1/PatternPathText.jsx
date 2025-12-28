import { useEffect, useRef } from "react";
import gsap from "gsap";

const PatternPathText = ({
  text = "PatternPath",
}) => {
  const lettersRef = useRef([]);

  useEffect(() => {
    gsap.fromTo(
      lettersRef.current,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.15,
      }
    );
  }, []);

  return (
    <div className="text-white text-5xl font-semibold tracking-widest">
      {text.split("").map((char, index) => (
        <span
          key={index}
          ref={(el) => (lettersRef.current[index] = el)}
          className="inline-block"
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </div>
  );
};

export default PatternPathText;
