import './index.css'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import HowItWorks from './components/HowItWorks'
import Features from './components/Features'
import WhoItsFor from './components/WhoItsFor'
import Testimonials from './components/Testimonials'
import CTASection from './components/CTASection'
import Footer from './components/Footer'
import PrivacyPage from './components/PrivacyPage'

export default function App() {
  if (window.location.pathname === '/privacy') {
    return <PrivacyPage />;
  }

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
