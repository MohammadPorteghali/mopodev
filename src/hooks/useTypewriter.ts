import { useEffect, useState } from 'react'

export function useTypewriter(text: string, speed = 38, startDelay = 600) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    setCount(0)
    let interval: ReturnType<typeof setInterval> | undefined

    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        setCount((c) => {
          if (c + 1 >= text.length) clearInterval(interval)
          return Math.min(c + 1, text.length)
        })
      }, speed)
    }, startDelay)

    return () => {
      clearTimeout(timeout)
      clearInterval(interval)
    }
  }, [text, speed, startDelay])

  return { displayed: text.slice(0, count), done: count >= text.length }
}
