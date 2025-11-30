import { useEffect, useRef } from 'react'

const AutoScrollImageBar = () => {
  const scrollContainerRef = useRef(null)
  const images = [
    'watch1.jpg',
    'watch2.jpg',
    'watch3.jpg',
    'watch4.jpg',
    'watch5.jpg',
    'watch6.jpg',
    'watch7.jpg',
    'watch8.jpg',
    'watch9.jpg',
    'watch10.jpg',
    'watch11.jpg',
    'watch12.jpg',
    'watch13.jpg',
    'earpods1.jpg',
    'Adapter1.jpg'
  ]

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    let scrollPosition = 0
    const scrollSpeed = 0.5 // pixels per frame
    let animationId = null
    let isPaused = false

    const scroll = () => {
      if (isPaused) {
        animationId = requestAnimationFrame(scroll)
        return
      }

      scrollPosition += scrollSpeed
      
      // Reset scroll position when it reaches the end (seamless loop)
      const maxScroll = container.scrollWidth / 2
      if (scrollPosition >= maxScroll) {
        scrollPosition = 0
      }
      
      container.scrollLeft = scrollPosition
      animationId = requestAnimationFrame(scroll)
    }

    // Start scrolling
    animationId = requestAnimationFrame(scroll)

    // Pause on hover
    const handleMouseEnter = () => {
      isPaused = true
    }

    const handleMouseLeave = () => {
      isPaused = false
    }

    container.addEventListener('mouseenter', handleMouseEnter)
    container.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
      container.removeEventListener('mouseenter', handleMouseEnter)
      container.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  // Duplicate images for seamless infinite scroll
  const duplicatedImages = [...images, ...images]

  return (
    <div className="w-full overflow-hidden py-8">
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-hidden hide-scrollbar"
        style={{
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {duplicatedImages.map((image, index) => (
          <div
            key={`${image}-${index}`}
            className="flex-shrink-0"
          >
            <img
              src={`/images/${image}`}
              alt={`Product showcase ${index + 1}`}
              className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-72 lg:h-72 object-cover rounded-lg shadow-lg"
              loading="lazy"
              onError={(e) => {
                // Fallback if image doesn't exist
                e.target.style.display = 'none'
              }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default AutoScrollImageBar

