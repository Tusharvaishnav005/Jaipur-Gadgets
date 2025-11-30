import { motion } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import ProductCard from './ProductCard'

const ProductCarousel = ({ products = [] }) => {
  if (!products || products.length === 0) {
    return null
  }

  return (
    <div className="relative">
      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        spaceBetween={20}
        slidesPerView={1}
        breakpoints={{
          640: {
            slidesPerView: 2,
          },
          768: {
            slidesPerView: 3,
          },
          1024: {
            slidesPerView: 4,
          },
          1280: {
            slidesPerView: 5,
          },
        }}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        navigation
        pagination={{ clickable: true }}
        loop={products.length > 5}
        className="pb-12"
      >
        {products.map((product, index) => (
          <SwiperSlide key={product._id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <ProductCard product={product} />
            </motion.div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}

export default ProductCarousel

