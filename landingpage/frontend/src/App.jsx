import './index.css'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import HowItWorks from './components/HowItWorks'
import Features from './components/Features'
import WhoItsFor from './components/WhoItsFor'
import Testimonials from './components/Testimonials'
import CTASection from './components/CTASection'
import Footer from './components/Footer'

export default function App() {
  return (
    <div className="font-body bg-[#FAFAFA] text-dark">
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <WhoItsFor />
        <Testimonials />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
