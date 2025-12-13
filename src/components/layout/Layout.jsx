import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import FloatingWhatsApp from '../ui/FloatingWhatsApp';
import { motion } from 'framer-motion';

const Layout = ({ children }) => {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <motion.main
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.5 }}
                className="flex-grow pt-20" // pt-20 to account for fixed navbar
            >
                {children}
            </motion.main>
            <FloatingWhatsApp />
            <Footer />
        </div>
    );
};

export default Layout;
