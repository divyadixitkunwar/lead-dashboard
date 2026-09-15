import Header from '../components/Header';
import Hero from '../components/Hero';
import PageBackground from '../components/PageBackground';
import Reveal from '../components/Reveal';
import HowItWorks from '../components/HowItWorks';
import FAQ from '../components/FAQ';
import Footer from '../components/Footer';
import SlippingThrough from '../components/SlippingThrough';
import OnePlace from '../components/OnePlace';

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