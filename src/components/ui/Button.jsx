import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ children, variant = 'solid', className = '', ...props }) => {
    const baseStyles = "px-8 py-3 rounded-full font-medium transition-all duration-300 font-sans tracking-wide text-sm uppercase";

    const variants = {
        solid: "bg-gold text-white hover:bg-gold-dark shadow-lg hover:shadow-xl",
        outline: "border-2 border-gold text-gold hover:bg-gold hover:text-white",
        white: "bg-white text-dark hover:bg-gray-100 shadow-lg"
    };

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`${baseStyles} ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </motion.button>
    );
};

export default Button;
