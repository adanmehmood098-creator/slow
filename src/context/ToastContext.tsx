import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'

export interface ToastItem {
  id: number
  title: string
  sub?: string
  image?: string
}

interface ToastContextValue {
  toasts: ToastItem[]
  push: (title: string, opts?: { sub?: string; image?: string; duration?: number }) => void
  dismiss: (id: number) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const idRef = useRef(1)

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, leaving: true as never } : t)))
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 320)
  }, [])

  const push = useCallback(
    (title: string, opts?: { sub?: string; image?: string; duration?: number }) => {
      const id = idRef.current++
      setToasts((prev) => [...prev.slice(-3), { id, title, sub: opts?.sub, image: opts?.image }])
      setTimeout(() => dismiss(id), opts?.duration ?? 3800)
    },
    [dismiss]
  )

  return <ToastContext.Provider value={{ toasts, push, dismiss }}>{children}</ToastContext.Provider>
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

export function cartAddedToast(push: ToastContextValue['push'], name: string, image?: string) {
  push(name + ' added to your cart', { sub: 'Beautiful choice 🌸', image })
}