import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ShoppingBag, ArrowRight } from 'lucide-react'
import AutoVideoScroller from './AutoVideoScroller'

const Hero = () => {
  return (
    <section className="relative min-h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden py-8 md:py-0">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-900 via-primary-700 to-accent-orange">
        <div className="absolute inset-0 bg-black/20"></div>
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')]"></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center py-8 md:py-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-center w-full">
            {/* Left side - Text content */}
            <div className="max-w-2xl w-full text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 md:mb-4 leading-tight"
                >
                  Welcome to{' '}
                  <span className="text-accent-orange">Jaipur Gadget</span>
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 mb-6 md:mb-8 px-2 md:px-0"
                >
                  Your one-stop destination for premium electronics and cutting-edge technology
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center lg:justify-start"
                >
                  <Link
                    to="/products"
                    className="group inline-flex items-center justify-center px-6 md:px-8 py-3 md:py-4 bg-white text-primary-700 rounded-lg font-semibold text-base md:text-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <ShoppingBag className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                    Shop Now
                    <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  
                  <Link
                    to="/products?featured=true"
                    className="inline-flex items-center justify-center px-6 md:px-8 py-3 md:py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold text-base md:text-lg hover:bg-white/10 transition-all duration-300"
                  >
                    Explore Featured
                  </Link>
                </motion.div>
              </motion.div>
            </div>

            {/* Right side - Auto-scrolling video bar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex items-center justify-center lg:justify-end h-full min-h-[200px] sm:min-h-[250px] md:min-h-[300px] lg:min-h-[400px] w-full mt-4 lg:mt-0"
            >
              <AutoVideoScroller />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero

