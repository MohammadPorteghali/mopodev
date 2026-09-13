import { useEffect, useRef } from 'react'

const VIDEO_SRC = '/hero.mp4'

// The clip is a look-around sequence; this range is the one clean eye-level
// turn from screen-left (SWEEP_START) to screen-right (SWEEP_END).
const SWEEP_START = 7.25
const SWEEP_END = 8.3

export default function BackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const targetTime = useRef((SWEEP_START + SWEEP_END) / 2)
  const lastRequested = useRef<number | null>(null)
  const isSeeking = useRef(false)

  const seekTo = (video: HTMLVideoElement) => {
    isSeeking.current = true
    lastRequested.current = targetTime.current
    video.currentTime = targetTime.current
  }

  const handleSeeked = () => {
    const video = videoRef.current
    isSeeking.current = false
    // Queue the next seek only if the target moved while the last one was in flight.
    if (video && targetTime.current !== lastRequested.current) seekTo(video)
  }

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      const video = videoRef.current
      if (!video || !Number.isFinite(video.duration)) return

      // Cursor position maps directly to head direction: left edge looks left, right edge looks right.
      const progress = Math.min(Math.max(e.clientX / window.innerWidth, 0), 1)
      const end = Math.min(SWEEP_END, video.duration)
      targetTime.current = SWEEP_START + progress * (end - SWEEP_START)

      if (!isSeeking.current) seekTo(video)
    }

    window.addEventListener('mousemove', onMouseMove)
    return () => window.removeEventListener('mousemove', onMouseMove)
  }, [])

  return (
    <video
      ref={videoRef}
      src={VIDEO_SRC}
      muted
      playsInline
      preload="auto"
      onLoadedMetadata={(e) => seekTo(e.currentTarget)}
      onSeeked={handleSeeked}
      className="fixed inset-0 z-0 h-full w-full object-cover"
      style={{ objectPosition: '70% center' }}
    />
  )
}
