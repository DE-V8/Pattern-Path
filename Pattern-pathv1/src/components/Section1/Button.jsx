import React from 'react'
import { motion } from "framer-motion";

const button = () => {
  return (
    <div>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className=" bg-yellow-400 text-black px-6 py-3 rounded-full font-semibold
  shadow-[0_0_20px_rgba(250,204,21,0.6)]
  hover:shadow-[0_0_30px_rgba(250,204,21,0.8)]
  transition-shadow duration-300 "
      >
        Get Started
      </motion.button>
    </div>
  );
}

export default button
