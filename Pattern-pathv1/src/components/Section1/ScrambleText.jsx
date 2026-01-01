import { useEffect, useRef } from "react";
import gsap from "gsap";

const SCRAMBLE_POOL = "@#$%&*+=-";

const ScrambledText = ({
  children,
  radius = 120,
  duration = 0.5,
  className = "",
}) => {
  const charsRef = useRef([]);

  useEffect(() => {
    const chars = charsRef.current;

    const scrambleChar = () =>
      SCRAMBLE_POOL[Math.floor(Math.random() * SCRAMBLE_POOL.length)];

    const handleMove = (e) => {
      chars.forEach((el) => {
        if (!el || el.dataset.space === "true") return;

        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.hypot(dx, dy);

        if (dist < radius) {
          gsap.to(el, {
            duration: duration * (1 - dist / radius),
            overwrite: true,
            onUpdate: () => {
              el.textContent = scrambleChar();
            },
            onComplete: () => {
              el.textContent = el.dataset.char;
            },
          });
        }
      });
    };

    window.addEventListener("pointermove", handleMove);
    return () => window.removeEventListener("pointermove", handleMove);
  }, [radius, duration]);

  return (
    <div
      className={`inline-flex flex-wrap items-start font-mono leading-relaxed ${className}`}
    >
      {children.split("").map((char, i) => {
        if (char === " ") {
          return (
            <span
              key={i}
              data-space="true"
              className="inline-block w-[0.6em]"
            />
          );
        }

        return (
          <span
            key={i}
            ref={(el) => (charsRef.current[i] = el)}
            data-char={char}
            className="inline-flex justify-center w-[1ch]"
          >
            {char}
          </span>
        );
      })}
    </div>
  );
};

export default ScrambledText;
