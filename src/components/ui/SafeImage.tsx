import { useState, type ImgHTMLAttributes } from 'react'
import { IMAGES } from '@/lib/utils'

interface SafeImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string
}

export default function SafeImage({ src, fallback = IMAGES.fallback, onError, ...rest }: SafeImageProps) {
  const [failed, setFailed] = useState(false)
  return (
    <img
      src={failed ? fallback : src}
      loading="lazy"
      onError={(e) => {
        if (!failed) {
          setFailed(true)
          onError?.(e)
        }
      }}
      {...rest}
    />
  )
}