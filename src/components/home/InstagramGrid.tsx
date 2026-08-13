import { Instagram } from 'lucide-react'
import { INSTAGRAM_POSTS } from '@/data/content'
import SectionHeading from '@/components/ui/SectionHeading'
import Reveal from '@/components/ui/Reveal'
import SafeImage from '@/components/ui/SafeImage'

export default function InstagramGrid() {
  return (
    <section className="section-sm" id="social">
      <div className="container">
        <Reveal>
          <SectionHeading
            eyebrow="@bloomandblush"
            title="Follow Our Floral Journey"
            subtitle="Daily behind-the-scenes, fresh arrivals and arrangement inspiration — tag us to be featured. 🌸"
          />
        </Reveal>
        <div className="instagram-grid">
          {INSTAGRAM_POSTS.map((src, i) => (
            <Reveal key={i} delay={(i % 6) * 60}>
              <a
                className="ig-item"
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Open Instagram"
              >
                <SafeImage src={src} alt="Instagram post" />
                <span className="ig-overlay">
                  <Instagram width={26} height={26} />
                </span>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}