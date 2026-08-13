import { MapPin, Phone, Mail, Truck } from 'lucide-react'
import { IMAGES, unsplash } from '@/lib/utils'
import { STORE_HOURS } from '@/data/content'
import SectionHeading from '@/components/ui/SectionHeading'
import Reveal from '@/components/ui/Reveal'

export default function StoreInfo() {
  return (
    <section className="store-info section" id="visit">
      <div className="container">
        <Reveal>
          <SectionHeading
            eyebrow="Visit Us"
            title="Blooming Beautiful, Every Day"
            subtitle="Pop in for a coffee and a browse — or let us bring the flowers to you."
          />
        </Reveal>
        <div className="store-grid">
          <Reveal direction="left">
            <div className="store-hours">
              <h3>Opening Hours</h3>
              <p className="sh-sub">We're always in bloom</p>
              {STORE_HOURS.map((h) => (
                <div className={`hours-row ${h.sunday ? 'sunday' : ''}`} key={h.day}>
                  <span className="day">{h.day}</span>
                  <span className="time">{h.time}</span>
                </div>
              ))}
              <div className="hours-row">
                <span className="day">Holidays</span>
                <span className="time">Open · reduced hours</span>
              </div>
            </div>
          </Reveal>
          <Reveal direction="right" delay={120}>
            <div className="store-contact section-sm" style={{ paddingTop: 0 }}>
              <div className="contact-tile">
                <span className="ct-ico"><Phone width={20} height={20} /></span>
                <div>
                  <h4>Call us</h4>
                  <p>+1 (555) 123-4567 · We answer 9am–8pm, and yes — orders over the phone are welcome.</p>
                </div>
              </div>
              <div className="contact-tile">
                <span className="ct-ico"><Mail width={20} height={20} /></span>
                <div>
                  <h4>Email us</h4>
                  <p>hello@bloomandblush.com · Flowers in 24–48h, responses even faster.</p>
                </div>
              </div>
              <div className="contact-tile">
                <span className="ct-ico"><MapPin width={20} height={20} /></span>
                <div>
                  <h4>Visit the studio</h4>
                  <p>12 Rosewood Avenue, Flower District. Free parking behind the shop.</p>
                </div>
              </div>
              <div className="contact-tile">
                <span className="ct-ico"><Truck width={20} height={20} /></span>
                <div>
                  <h4>Delivery areas</h4>
                  <p>Same-day across the whole city. Next-day to suburbs within 25 miles.</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
        <Reveal delay={100}>
          <div className="store-map">
            <img src={unsplash(IMAGES.lavenderField, 1600)} alt="Map area around our studio" />
            <span className="map-pin">
              <MapPin width={12} height={12} />
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  )
}