interface SectionHeadingProps {
  eyebrow: string
  title: React.ReactNode
  subtitle?: string
  align?: 'center' | 'left'
}

export default function SectionHeading({ eyebrow, title, subtitle, align = 'center' }: SectionHeadingProps) {
  return (
    <div className={`section-head ${align === 'left' ? 'section-head--left' : ''}`}>
      <span className="eyebrow">🌸 {eyebrow}</span>
      <h2>{title}</h2>
      {subtitle && <p>{subtitle}</p>}
    </div>
  )
}