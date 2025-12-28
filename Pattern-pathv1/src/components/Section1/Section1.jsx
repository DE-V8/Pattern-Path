import React from "react";
import Left from "./Left";
import Right from "./Right";
import Background from "./Background";

const Section1 = () => {
  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Background layer */}
      <Background />

      {/* Content layer */}
      <div className="relative z-10 flex h-full w-full">
        <Left />
        <Right />
      </div>
    </div>
  );
};

export default Section1;
