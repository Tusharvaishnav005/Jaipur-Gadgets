import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const AutoVideoScroller = ({ videos = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const videoRefs = useRef([])
  const containerRef = useRef(null)
  const playIntervalRef = useRef(null)

  // Default videos if none provided
  const videoList = videos.length > 0 
    ? videos 
    : ['video1.mp4', 'video2.mp4', 'video3.mp4']

  // Function to ensure video is playing - memoized to avoid recreating
  const ensureVideoPlaying = useCallback((video) => {
    if (!video) return
    
    if (video.paused) {
      const playPromise = video.play()
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn('Video play failed, retrying:', error)
          // Retry after a short delay
          setTimeout(() => {
            if (video && video.paused) {
              video.play().catch(() => {})
            }
          }, 500)
        })
      }
    }
  }, [])

  // Main effect to handle video playback and transitions
  useEffect(() => {
    if (videoList.length === 0) return

    const currentVideo = videoRefs.current[currentIndex]
    if (!currentVideo) return

    const handleVideoEnd = () => {
      // Immediately switch to next video without delay for continuous playback
      const nextIndex = (currentIndex + 1) % videoList.length
      
      // Preload next video
      const nextVideo = videoRefs.current[nextIndex]
      if (nextVideo) {
        nextVideo.load()
      }
      
      // Switch immediately
      setIsVisible(false)
      setTimeout(() => {
        setCurrentIndex(nextIndex)
      }, 200) // Reduced delay for faster transition
    }

    const handleVideoError = () => {
      // Skip to next video on error immediately
      const nextIndex = (currentIndex + 1) % videoList.length
      setCurrentIndex(nextIndex)
    }

    const handleVideoPause = () => {
      // Auto-resume if video gets paused (e.g., by browser)
      if (currentVideo.paused && currentVideo.readyState >= 2) {
        ensureVideoPlaying(currentVideo)
      }
    }

    const handleVideoLoadedData = () => {
      // Ensure video starts playing as soon as it's loaded
      ensureVideoPlaying(currentVideo)
    }

    // Add event listeners
    currentVideo.addEventListener('ended', handleVideoEnd)
    currentVideo.addEventListener('error', handleVideoError)
    currentVideo.addEventListener('pause', handleVideoPause)
    currentVideo.addEventListener('loadeddata', handleVideoLoadedData)
    currentVideo.addEventListener('canplay', handleVideoLoadedData)

    // Ensure video is playing immediately
    ensureVideoPlaying(currentVideo)

    // Set up interval to check if video is playing (fallback)
    playIntervalRef.current = setInterval(() => {
      if (currentVideo && currentVideo.paused && currentVideo.readyState >= 2) {
        ensureVideoPlaying(currentVideo)
      }
    }, 1000)

    // Preload next video for smooth transition
    const nextIndex = (currentIndex + 1) % videoList.length
    const nextVideo = videoRefs.current[nextIndex]
    if (nextVideo) {
      nextVideo.load()
    }

    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current)
        playIntervalRef.current = null
      }
      currentVideo.removeEventListener('ended', handleVideoEnd)
      currentVideo.removeEventListener('error', handleVideoError)
      currentVideo.removeEventListener('pause', handleVideoPause)
      currentVideo.removeEventListener('loadeddata', handleVideoLoadedData)
      currentVideo.removeEventListener('canplay', handleVideoLoadedData)
    }
  }, [currentIndex, videoList.length, ensureVideoPlaying])

  // Reset visibility and ensure playing when index changes
  useEffect(() => {
    setIsVisible(true)
    
    // Small delay to ensure DOM is updated, then start playing
    const timer = setTimeout(() => {
      const currentVideo = videoRefs.current[currentIndex]
      if (currentVideo) {
        ensureVideoPlaying(currentVideo)
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [currentIndex, ensureVideoPlaying])

  // Intersection Observer to keep playing when in viewport
  useEffect(() => {
    if (!containerRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const currentVideo = videoRefs.current[currentIndex]
            if (currentVideo) {
              ensureVideoPlaying(currentVideo)
            }
          }
        })
      },
      { threshold: 0.1 }
    )

    observer.observe(containerRef.current)

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current)
      }
    }
  }, [currentIndex, ensureVideoPlaying])

  if (videoList.length === 0) {
    return null
  }

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center lg:justify-end"
    >
      <div className="relative w-full max-w-sm md:max-w-md h-full max-h-[300px] md:max-h-[400px] lg:max-h-[600px] rounded-lg overflow-hidden shadow-2xl">
        <AnimatePresence mode="wait">
          {videoList.map((video, index) => {
            if (index !== currentIndex) return null

            return (
              <motion.div
                key={`${video}-${index}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ 
                  opacity: isVisible ? 1 : 0,
                  scale: isVisible ? 1 : 0.95
                }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="absolute inset-0 w-full h-full"
              >
                <video
                  ref={(el) => {
                    if (el) {
                      videoRefs.current[index] = el
                      // Ensure video plays when ref is set
                      if (index === currentIndex) {
                        setTimeout(() => {
                          ensureVideoPlaying(el)
                        }, 50)
                      }
                    }
                  }}
                  src={`/videos/${video}`}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                  autoPlay
                  loop={false}
                  preload="auto"
                  onLoadedData={() => {
                    const video = videoRefs.current[index]
                    if (video && index === currentIndex) {
                      ensureVideoPlaying(video)
                    }
                  }}
                />
              </motion.div>
            )
          })}
        </AnimatePresence>

        {/* Video indicator dots */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
          {videoList.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'w-8 bg-white'
                  : 'w-2 bg-white/50'
              }`}
            />
          ))}
        </div>

        {/* Gradient overlay for better text visibility if needed */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      </div>
    </div>
  )
}

export default AutoVideoScroller

