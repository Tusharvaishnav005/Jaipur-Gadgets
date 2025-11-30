import { motion } from 'framer-motion'
import { HelpCircle, ShoppingCart, CreditCard, Package, Truck, Instagram, Phone, Mail } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Link } from 'react-router-dom'

const FAQ = () => {
  const faqs = [
    {
      question: 'How can I place an order on Jaipur Gadget?',
      answer: (
        <>
          You can place an order by adding the product to your <Link to="/cart" className="text-primary-600 dark:text-primary-400 hover:underline font-semibold">Cart</Link> and clicking Place Order.
          <br /><br />
          Your order is only confirmed after completing the UPI Payment or selecting Cash on Delivery (COD) (if available).
        </>
      ),
      icon: ShoppingCart
    },
    {
      question: "Is my order confirmed if I don't complete the payment?",
      answer: (
        <>
          No. If you move forward without paying on the payment link, your order request will not be accepted.
          <br /><br />
          You can contact us for help, and in most cases, we will reach out to you directly to complete the payment and confirm the order.
        </>
      ),
      icon: CreditCard
    },
    {
      question: 'How can I track my order?',
      answer: (
        <>
          You can track your order from your <Link to="/profile" className="text-primary-600 dark:text-primary-400 hover:underline font-semibold">Profile Icon</Link> → <Link to="/orders" className="text-primary-600 dark:text-primary-400 hover:underline font-semibold">Orders</Link> → View Details.
          <br /><br />
          All order status updates will be visible there.
        </>
      ),
      icon: Package
    },
    {
      question: 'Do you provide all-India delivery?',
      answer: (
        <>
          Yes, we provide delivery across India.
          <br /><br />
          Simply add the product to your cart, enter your address, and place the order.
          <br /><br />
          For some locations, our team may contact you directly to confirm availability and delivery details.
        </>
      ),
      icon: Truck
    },
    {
      question: 'Where can I get updates about your latest products?',
      answer: (
        <>
          You can find all new product updates, offers, and announcements on our{' '}
          <a 
            href="https://www.instagram.com/jaipurgadgets29?igsh=Y3M4bGVscWZzb2pt" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary-600 dark:text-primary-400 hover:underline font-semibold"
          >
            Instagram channel
          </a>.
          <br /><br />
          Follow us to stay updated!
        </>
      ),
      icon: Instagram
    },
    {
      question: 'What should I do if I face issues during payment or order placement?',
      answer: (
        <>
          If your payment fails or you're unable to place the order:
          <br /><br />
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Reach out to us via <Link to="/contact" className="text-primary-600 dark:text-primary-400 hover:underline font-semibold">Contact Us</Link></li>
            <li>Or wait—our team often contacts customers directly to help complete the payment and finalize the order.</li>
          </ul>
        </>
      ),
      icon: Phone
    },
    {
      question: 'What payment methods do you accept?',
      answer: (
        <>
          We support:
          <br /><br />
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>UPI Payment</strong> - Free delivery</li>
            <li><strong>COD (Cash on Delivery)</strong> — for selected products/locations (Includes ₹150 delivery charge)</li>
          </ul>
        </>
      ),
      icon: CreditCard
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <HelpCircle className="w-12 h-12 text-primary-600 dark:text-primary-400" />
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                Frequently Asked Questions
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Find answers to common questions about ordering, delivery, and payment
            </p>
          </motion.div>

          <div className="space-y-6">
            {faqs.map((faq, index) => {
              const Icon = faq.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                        {index + 1}. {faq.question}
                      </h2>
                      <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Contact Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="mt-12 bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-800 dark:to-primary-900 rounded-lg shadow-lg p-8 text-center"
          >
            <h2 className="text-2xl font-bold text-white mb-4">
              Still have questions?
            </h2>
            <p className="text-primary-100 mb-6">
              Our customer support team is here to help you. Get in touch with us!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:+919928378277"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                <Phone className="w-5 h-5" />
                Call Us: 9928378277
              </a>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white border-2 border-white rounded-lg font-semibold hover:bg-white/20 transition-colors"
              >
                <Mail className="w-5 h-5" />
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default FAQ

