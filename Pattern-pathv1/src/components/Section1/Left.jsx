
// import Button from "./button";
// import React from "react";
// import SplitText from "./Titletext";
// const Left = () => {
//   return (
//     <div className="relative w-full h-full ">
//       <div className="flex h-screen pt-90 flex-col justify-center items-start pl-10">
//         <Button />
//       </div>
//       <div className="h-screen bg-black flex items-center justify-center">
//         <PatternPathText />
//       </div>
//     </div>
//   );
// };

// export default Left;

import React from "react";
import Button from "./button";
import SplitText from "./PatternPathText";
import PatternPathText from "./PatternPathText";
import ScrambledText from "./ScrambleText.jsx";

const Left = () => {
  return (
    <div className="relative w-full h-screen text-amber-100">
      <div className="absolute left-20 top-1/2 -translate-y-1/2 flex flex-col gap-7 max-w-lg">
        {/* Title */}
        <PatternPathText className="text-5xl font-bold" />

        {/* Description */}
        <ScrambledText className="text-lg leading-relaxed text-white/80">
          PatternPath is a free, pattern-based learning platform built for
          engineering students who want real understanding and long-term
          retention.
        </ScrambledText>

        {/* Button */}
        <Button />
      </div>
    </div>
  );
};

export default Left;
