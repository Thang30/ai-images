'use client'

import { motion } from 'framer-motion'

export function Hero() {
  return (
    <div className="relative overflow-hidden">
      {/* Background gradient */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500"
        style={{
          backgroundSize: '400% 400%',
          animation: 'gradient 15s ease infinite',
        }}
      />
      
      {/* Content */}
      <div className="relative max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <motion.h1 
            className="text-4xl md:text-6xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            God&apos;s Creation
          </motion.h1>
          
          <motion.p
            className="text-xl md:text-2xl text-white/90 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Generate stunning AI images with just a few clicks
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="inline-flex rounded-md shadow">
              <a
                href="/generate"
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-purple-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
              >
                Start Generating
              </a>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
} 