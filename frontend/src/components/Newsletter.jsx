import { motion } from 'framer-motion'
import { Instagram } from 'lucide-react'

const Newsletter = () => {
  const instagramUrl = 'https://www.instagram.com/jaipurgadgets29?igsh=Y3M4bGVscWZzb2pt'
  const instagramHandle = '@jaipurgadgets29'

  return (
    <section className="py-16 px-4 bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-800 dark:to-primary-900">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left Side - Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center md:text-left"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Stay Updated with Latest Offers
            </h2>
            <p className="text-primary-100 mb-6 text-lg">
              Subscribe to our Instagram channel and get exclusive deals, new product launches, and special discounts delivered to your inbox.
            </p>
            
            {/* Instagram Profile Highlight */}
            <div className="flex items-center justify-center md:justify-start gap-3">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-6 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors group"
              >
                <Instagram className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <span className="font-bold">{instagramHandle}</span>
              </a>
            </div>
          </motion.div>

          {/* Right Side - Image */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex justify-center md:justify-end"
          >
            <div className="relative">
              <img
                src="/photo/WhatsApp Image 2025-11-28 at 4.54.34 PM.jpeg"
                alt="Stay Updated with Latest Offers"
                className="w-full max-w-md h-auto rounded-lg shadow-2xl object-cover"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23ddd" width="400" height="400"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="20" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EImage%3C/text%3E%3C/svg%3E'
                }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Newsletter

