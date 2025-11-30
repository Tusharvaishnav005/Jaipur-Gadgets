import { Link } from 'react-router-dom'
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-4">Jaipur Gadget</h3>
            <p className="mb-4 text-gray-400">
              Your trusted destination for premium electronics and cutting-edge technology. We bring you the latest gadgets at the best prices.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-white transition-colors">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <Twitter className="w-6 h-6" />
              </a>
              <a 
                href="https://www.instagram.com/jaipurgadgets29?igsh=Y3M4bGVscWZzb2pt" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
                aria-label="Follow us on Instagram"
              >
                <Instagram className="w-6 h-6" />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <Youtube className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/products" className="hover:text-white transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-white font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/shipping" className="hover:text-white transition-colors">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link to="/returns" className="hover:text-white transition-colors">
                  Returns
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Instagram className="w-5 h-5 flex-shrink-0" />
                <a 
                  href="https://www.instagram.com/jaipurgadgets29?igsh=Y3M4bGVscWZzb2pt" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  @jaipurgadgets29
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Jaipur Gadget. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

