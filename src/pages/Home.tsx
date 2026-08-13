import Hero from '@/components/home/Hero'
import Features from '@/components/home/Features'
import Occasions from '@/components/home/Occasions'
import FeaturedFlowers from '@/components/home/FeaturedFlowers'
import SpecialOffer from '@/components/home/SpecialOffer'
import BestSellers from '@/components/home/BestSellers'
import Testimonials from '@/components/home/Testimonials'
import AboutStrip from '@/components/home/AboutStrip'
import FlowerCare from '@/components/home/FlowerCare'
import StoreInfo from '@/components/home/StoreInfo'
import InstagramGrid from '@/components/home/InstagramGrid'
import Newsletter from '@/components/home/Newsletter'

export default function Home() {
  return (
    <div className="page home-page">
      <Hero />
      <Features />
      <Occasions />
      <FeaturedFlowers />
      <SpecialOffer />
      <BestSellers />
      <Testimonials />
      <AboutStrip />
      <FlowerCare />
      <StoreInfo />
      <InstagramGrid />
      <Newsletter />
    </div>
  )
}