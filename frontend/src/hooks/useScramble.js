import { useState, useEffect } from 'react'

export function useScramble(target, duration = 1800) {
  const [value, setValue] = useState('--')

  useEffect(() => {
    if (target === null || target === undefined) return
    const chars = '0123456789'
    const targetStr = String(target)
    const totalFrames = Math.floor(duration / 30)
    let frame = 0

    const interval = setInterval(() => {
      frame++
      const progress = frame / totalFrames

      if (progress >= 1) {
        setValue(targetStr)
        clearInterval(interval)
      } else if (progress > 0.65) {
        setValue(targetStr)
        clearInterval(interval)
      } else {
        setValue(
          targetStr.split('').map(char => {
            if (char === '.' || char === '%' || char === ' ' || char === '-') return char
            if (Math.random() < progress * 2.5) return char
            return chars[Math.floor(Math.random() * chars.length)]
          }).join('')
        )
      }
    }, 50)

    return () => clearInterval(interval)
  }, [target, duration])

  return value
}