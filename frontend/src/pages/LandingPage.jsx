import Header from './Header';
import Hero from './Hero';
import PageBackground from './PageBackground';
import Reveal from './Reveal';
import UnifiedInbox from './UnifiedInbox';
import HowItWorks from './HowItWorks';
import IntentDetection from './IntentDetection.jsx';
import FAQ from './FAQ';
import Footer from './Footer.jsx';
import SlippingThrough from './SlippingThrough.jsx'
import OnePlace from './OnePlace.jsx';

// Reveal wraps the sections that get the scroll-in animation on Arlo's
// real site (their .hs-sec / .hs-closing elements). The hero and footer
// are not wrapped because Arlo's own markup doesn't tag its hero or
// footer with .hs-reveal either — both are static there too.
//
// Order matches the Header nav: Product, then How it works.
export default function LandingPage() {
    return (
        <div id="top" style={{ position: 'relative', background: '#F6F1E7' }}>
            <PageBackground />
            <Header />
            <Hero />
            <Reveal><HowItWorks /></Reveal>
            <Reveal><SlippingThrough /></Reveal>
            <Reveal><OnePlace /></Reveal>
            <Reveal><FAQ /></Reveal>
            <Footer />
        </div>
    );
}