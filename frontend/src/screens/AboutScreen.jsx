import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';

// =============================================
// Animated Counter (counts up on mount / scroll)
// =============================================
function AnimatedCounter({ end, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const counted = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true;
          const startTime = performance.now();

          const animate = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // ease-out quad
            const eased = 1 - (1 - progress) * (1 - progress);
            setCount(Math.floor(eased * end));
            if (progress < 1) requestAnimationFrame(animate);
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration]);

  return (
    <span ref={ref} className="fw-bold">
      {count}{suffix}
    </span>
  );
}

// =============================================
// FAQ Accordion Item
// =============================================
function FaqItem({ question, answer, isOpen, onToggle }) {
  return (
    <div className={`faq-item border rounded-3 mb-2 overflow-hidden ${isOpen ? 'shadow-sm' : ''}`}>
      <button
        className="btn btn-light w-100 text-start d-flex justify-content-between align-items-center py-3 px-4 border-0 rounded-0"
        onClick={onToggle}
        style={{ background: isOpen ? '#f8f9fa' : 'white' }}
      >
        <span className="fw-semibold">{question}</span>
        <i className={`fa fa-chevron-${isOpen ? 'up' : 'down'} text-muted transition-all`}></i>
      </button>
      {isOpen && (
        <div className="px-4 pb-3 pt-1 text-muted">
          {answer}
        </div>
      )}
    </div>
  );
}

// =============================================
// Testimonial Card
// =============================================
function TestimonialCard({ name, role, text, avatar, rating }) {
  return (
    <div className="testimonial-card bg-white rounded-4 shadow-sm p-4 h-100 d-flex flex-column">
      <div className="d-flex align-items-center mb-3">
        <img
          src={avatar}
          alt={name}
          className="rounded-circle me-3"
          width={48}
          height={48}
          style={{ objectFit: 'cover' }}
        />
        <div>
          <h6 className="mb-0">{name}</h6>
          <small className="text-muted">{role}</small>
        </div>
      </div>
      <div className="mb-2 text-warning">
        {Array.from({ length: 5 }, (_, i) => (
          <i key={i} className={`fa fa-star${i < rating ? '' : '-o'} me-1`} style={{ fontSize: 13 }}></i>
        ))}
      </div>
      <p className="text-muted mb-0 flex-grow-1"><i className="fa fa-quote-left me-2 text-primary opacity-50"></i>{text}</p>
    </div>
  );
}

// =============================================
// Team Member Card
// =============================================
function TeamCard({ name, role, img, social }) {
  return (
    <div className="text-center p-3">
      <div className="position-relative mx-auto mb-3" style={{ width: 120, height: 120 }}>
        <img
          src={img}
          alt={name}
          className="rounded-circle w-100 h-100"
          style={{ objectFit: 'cover' }}
        />
        <div className="position-absolute bottom-0 end-0 bg-success rounded-circle p-2" style={{ width: 32, height: 32 }}>
          <i className="fa fa-check text-white" style={{ fontSize: 12, lineHeight: '16px' }}></i>
        </div>
      </div>
      <h6 className="mb-1">{name}</h6>
      <small className="text-muted d-block mb-2">{role}</small>
      <div className="d-flex justify-content-center gap-2">
        {social?.linkedin && <a href={social.linkedin} className="btn btn-outline-secondary btn-sm rounded-circle" style={{ width: 32, height: 32, lineHeight: '20px' }}><i className="fa fa-linkedin"></i></a>}
        {social?.twitter && <a href={social.twitter} className="btn btn-outline-secondary btn-sm rounded-circle" style={{ width: 32, height: 32, lineHeight: '20px' }}><i className="fa fa-twitter"></i></a>}
        {social?.email && <a href={`mailto:${social.email}`} className="btn btn-outline-secondary btn-sm rounded-circle" style={{ width: 32, height: 32, lineHeight: '20px' }}><i className="fa fa-envelope"></i></a>}
      </div>
    </div>
  );
}

// =============================================
// Main About Page
// =============================================
const features = [
  { icon: 'fa-search', title: 'Easy Discovery', desc: 'Browse thousands of curated properties with smart filters, date pickers, and instant availability.' },
  { icon: 'fa-shield', title: 'Secure Booking', desc: 'Industry-standard encryption protects your payments. Book with confidence every time.' },
  { icon: 'fa-headphones', title: '24/7 Support', desc: 'Our dedicated team is always ready to help — before, during, and after your stay.' },
  { icon: 'fa-home', title: 'List Your Space', desc: 'Property owners can submit listings in minutes. We review and publish within 48 hours.' },
];

export default function AboutScreen() {
  const [activeFaq, setActiveFaq] = useState(null);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [activeFeature, setActiveFeature] = useState(0);
  const [email, setEmail] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [contactSent, setContactSent] = useState(false);

  const featuresRef = useRef(null);
  const revealRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) entry.target.classList.add('visible');
        });
      },
      { threshold: 0.15 }
    );

    revealRefs.current.forEach(el => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Auto-rotate testimonials
  const testimonials = [
    { name: 'Sarah Johnson', role: 'Business Traveler', avatar: 'https://i.pravatar.cc/100?img=1', rating: 5, text: 'StayVerse made booking my business trip effortless. The room was exactly as described and the check-in process was smooth.' },
    { name: 'Mike Chen', role: 'Family Vacationer', avatar: 'https://i.pravatar.cc/100?img=3', rating: 4, text: 'We booked a Premium Villa for our family reunion and it was incredible. The kids loved the pool and the view was breathtaking.' },
    { name: 'Emily Davis', role: 'Solo Traveler', avatar: 'https://i.pravatar.cc/100?img=5', rating: 5, text: 'As a solo traveler, safety and comfort are my priorities. StayVerse delivered on both. Highly recommended!' },
    { name: 'Raj Patel', role: 'Digital Nomad', avatar: 'https://i.pravatar.cc/100?img=8', rating: 4, text: 'The Wi-Fi was blazing fast and the work desk setup was perfect for my remote work needs. Will definitely book again.' },
  ];

  const team = [
    { name: 'Alex Rivera', role: 'CEO & Founder', img: 'https://i.pravatar.cc/150?img=11', social: { linkedin: '#', twitter: '#', email: 'alex@stayverse.com' } },
    { name: 'Priya Sharma', role: 'Head of Operations', img: 'https://i.pravatar.cc/150?img=12', social: { linkedin: '#', email: 'priya@stayverse.com' } },
    { name: 'David Kim', role: 'CTO', img: 'https://i.pravatar.cc/150?img=13', social: { linkedin: '#', twitter: '#', email: 'david@stayverse.com' } },
    { name: 'Lisa Thompson', role: 'Customer Experience', img: 'https://i.pravatar.cc/150?img=16', social: { linkedin: '#', email: 'lisa@stayverse.com' } },
  ];

  const milestones = [
    { year: '2020', title: 'The Idea', desc: 'StayVerse was born from a simple idea — make hotel booking as easy as ordering food.' },
    { year: '2021', title: 'First 100 Properties', desc: 'We onboarded our first 100 properties and served over 1,000 happy guests.' },
    { year: '2023', title: '10,000 Bookings', desc: 'Crossed 10,000 successful bookings milestone with a 4.8★ average rating.' },
    { year: '2025', title: 'Global Expansion', desc: 'Expanded to 15 countries with 5,000+ properties and introduced premium villa experiences.' },
  ];

  const faqs = [
    { q: 'How do I book a room?', a: 'Simply browse our rooms, select your dates, and click "Book Now". You\'ll be guided through a secure payment process.' },
    { q: 'Can I cancel my booking?', a: 'Yes, you can cancel your booking from the "My Bookings" page. Cancellation policies vary by property.' },
    { q: 'Is my payment information safe?', a: 'Absolutely. We use industry-standard encryption and never store your full card details on our servers.' },
    { q: 'What if I need help during my stay?', a: 'Our 24/7 support team is just a call or email away. We\'re here to ensure you have a great experience.' },
    { q: 'Can I list my property on StayVerse?', a: 'Yes! Contact us through the form below or use the "List Your Property" link in your account menu.' },
  ];

  const handleContactSubmit = useCallback((e) => {
    e.preventDefault();
    if (email && contactMsg) {
      setContactSent(true);
      setEmail('');
      setContactMsg('');
      setTimeout(() => setContactSent(false), 4000);
    }
  }, [email, contactMsg]);

  // Cycle testimonials every 5s
  useEffect(() => {
    const timer = setInterval(() => {
      setTestimonialIndex(prev => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const nextTestimonial = useCallback(() => {
    setTestimonialIndex(prev => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  const prevTestimonial = useCallback(() => {
    setTestimonialIndex(prev => (prev - 1 + testimonials.length) % testimonials.length);
  }, [testimonials.length]);

  const toggleFaq = useCallback((idx) => {
    setActiveFaq(prev => prev === idx ? null : idx);
  }, []);

  const t = testimonials[testimonialIndex];

  return (
    <div className="about-screen page-screen">
      {/* ============== HERO ============== */}
      <section className="page-hero text-center">
        <div className="container py-2">
          <h1 className="display-4 fw-bold mb-3">About <span className="accent">STAYVERSE</span></h1>
          <p className="lead mb-4">
            We're on a mission to make premium accommodation accessible to everyone —
            one unforgettable stay at a time.
          </p>
          <div className="d-flex justify-content-center gap-3 flex-wrap mb-4">
            <span className="badge bg-warning text-dark px-4 py-2 rounded-pill">
              <i className="fa fa-check-circle me-1"></i> 5,000+ Properties
            </span>
            <span className="badge bg-info text-dark px-4 py-2 rounded-pill">
              <i className="fa fa-smile-o me-1"></i> 15 Countries
            </span>
            <span className="badge bg-success px-4 py-2 rounded-pill">
              <i className="fa fa-star me-1"></i> 4.8★ Avg Rating
            </span>
          </div>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <Link to="/home" className="btn btn-warning px-4">
              <i className="fa fa-search me-2"></i> Explore Rooms
            </Link>
            <Link to="/list-property" className="btn btn-outline-light px-4">
              <i className="fa fa-plus me-2"></i> List Your Property
            </Link>
          </div>
        </div>
      </section>

      {/* ============== STATS ============== */}
      <section className="py-5 bg-white" ref={featuresRef}>
        <div className="container">
          <div className="row text-center g-4">
            {[
              { icon: 'fa-building', color: 'primary', end: 5000, suffix: '+', label: 'Properties Listed' },
              { icon: 'fa-smile-o', color: 'success', end: 25000, suffix: '+', label: 'Happy Guests' },
              { icon: 'fa-globe', color: 'info', end: 15, suffix: '', label: 'Countries' },
              { icon: 'fa-star', color: 'warning', end: 48, suffix: '.★', label: 'Average Rating', noCounter: false },
            ].map((stat, idx) => (
              <div className="col-6 col-md-3 reveal-on-scroll" key={stat.label} ref={el => revealRefs.current[idx] = el}>
                <div className="stat-card interactive">
                  <div className={`stat-icon text-${stat.color}`}><i className={`fa ${stat.icon}`}></i></div>
                  <div className="stat-value">
                    {stat.label === 'Average Rating' ? <><AnimatedCounter end={48} />.★</> : <AnimatedCounter end={stat.end} suffix={stat.suffix} />}
                  </div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============== INTERACTIVE FEATURES ============== */}
      <section className="py-5 bg-light">
        <div className="container">
          <h2 className="text-center section-title">Why Choose StayVerse?</h2>
          <p className="text-center section-subtitle">Click to explore what makes us different</p>
          <div className="row g-4">
            <div className="col-md-5">
              {features.map((f, idx) => (
                <div
                  key={f.title}
                  className={`feature-tab mb-3 ${activeFeature === idx ? 'active' : ''}`}
                  onClick={() => setActiveFeature(idx)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setActiveFeature(idx)}
                >
                  <div className="d-flex align-items-center">
                    <i className={`fa ${f.icon} fa-2x me-3`}></i>
                    <div>
                      <h6 className="mb-0">{f.title}</h6>
                      <small className="text-muted">Learn more</small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="col-md-7">
              <div className="glass-card-static h-100 d-flex flex-column justify-content-center fade-in-up" key={activeFeature}>
                <i className={`fa ${features[activeFeature].icon} fa-3x mb-3 text-primary`}></i>
                <h4>{features[activeFeature].title}</h4>
                <p className="text-muted mb-4">{features[activeFeature].desc}</p>
                {activeFeature === 3 ? (
                  <Link to="/list-property" className="btn btn-dark align-self-start">
                    <i className="fa fa-plus me-2"></i> Start Listing
                  </Link>
                ) : (
                  <Link to="/home" className="btn btn-dark align-self-start">
                    <i className="fa fa-arrow-right me-2"></i> Get Started
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============== OUR STORY / TIMELINE ============== */}
      <section className="py-5 bg-light">
        <div className="container">
          <h2 className="text-center fw-bold mb-2">Our Journey</h2>
          <p className="text-muted text-center mb-5">From a simple idea to a global platform</p>
          <div className="position-relative">
            {/* Vertical line */}
            <div className="d-none d-md-block position-absolute start-50 top-0 bottom-0 
              translate-middle-x border-start border-2 border-primary opacity-25"></div>

            {milestones.map((m, idx) => (
              <div key={idx} className="row align-items-center mb-4 position-relative reveal-on-scroll" ref={el => revealRefs.current[4 + idx] = el}>
                <div className={`col-md-5 ${idx % 2 === 0 ? 'text-end pe-md-4' : 'order-md-2 ps-md-4'}`}>
                  <div className="bg-white rounded-3 shadow-sm p-4 d-inline-block text-start milestone-card" style={{ maxWidth: 380 }}>
                    <span className="badge bg-primary mb-2">{m.year}</span>
                    <h5 className="mb-1">{m.title}</h5>
                    <p className="text-muted small mb-0">{m.desc}</p>
                  </div>
                </div>
                <div className="d-none d-md-flex col-md-2 justify-content-center position-relative">
                  <div className="bg-primary rounded-circle border border-4 border-white shadow" style={{ width: 20, height: 20, zIndex: 2 }}></div>
                </div>
                <div className="col-md-5 d-none d-md-block"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============== TESTIMONIALS ============== */}
      <section className="py-5 bg-white">
        <div className="container">
          <h2 className="text-center fw-bold mb-2">What Our Guests Say</h2>
          <p className="text-muted text-center mb-5">Real reviews from real travelers</p>

          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="testimonial-card bg-light rounded-4 p-4 p-md-5 shadow-sm position-relative">
                <div className="d-flex align-items-center mb-3">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="rounded-circle me-3"
                    width={56}
                    height={56}
                    style={{ objectFit: 'cover' }}
                  />
                  <div>
                    <h5 className="mb-0">{t.name}</h5>
                    <small className="text-muted">{t.role}</small>
                  </div>
                </div>
                <div className="mb-2 text-warning">
                  {Array.from({ length: 5 }, (_, i) => (
                    <i key={i} className={`fa fa-star${i < t.rating ? '' : '-o'} me-1`}></i>
                  ))}
                </div>
                <p className="lead mb-3 fst-italic"><i className="fa fa-quote-left me-2 text-primary opacity-25"></i>{t.text}</p>
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex gap-2">
                    {testimonials.map((_, idx) => (
                      <button
                        key={idx}
                        className={`btn btn-sm rounded-circle p-0 ${idx === testimonialIndex ? 'bg-primary' : 'bg-secondary opacity-25'}`}
                        style={{ width: 10, height: 10 }}
                        onClick={() => setTestimonialIndex(idx)}
                      ></button>
                    ))}
                  </div>
                  <div className="d-flex gap-2">
                    <button className="btn btn-outline-secondary btn-sm rounded-circle" onClick={prevTestimonial} style={{ width: 36, height: 36 }}>
                      <i className="fa fa-chevron-left"></i>
                    </button>
                    <button className="btn btn-outline-secondary btn-sm rounded-circle" onClick={nextTestimonial} style={{ width: 36, height: 36 }}>
                      <i className="fa fa-chevron-right"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Grid of testimonials */}
          <div className="row mt-5 g-4">
            {testimonials.map((t, idx) => (
              <div className="col-md-6 col-lg-3" key={idx}>
                <TestimonialCard {...t} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============== MEET THE TEAM ============== */}
      <section className="py-5 bg-light">
        <div className="container">
          <h2 className="text-center fw-bold mb-2">Meet the Team</h2>
          <p className="text-muted text-center mb-5">The people behind StayVerse</p>
          <div className="row justify-content-center g-4">
            {team.map((member, idx) => (
              <div className="col-6 col-md-3" key={idx}>
                <div className="bg-white rounded-4 shadow-sm h-100">
                  <TeamCard {...member} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============== FAQ ============== */}
      <section className="py-5 bg-white">
        <div className="container" style={{ maxWidth: 720 }}>
          <h2 className="text-center fw-bold mb-2">Frequently Asked Questions</h2>
          <p className="text-muted text-center mb-4">Got questions? We've got answers.</p>
          {faqs.map((faq, idx) => (
            <FaqItem
              key={idx}
              question={faq.q}
              answer={faq.a}
              isOpen={activeFaq === idx}
              onToggle={() => toggleFaq(idx)}
            />
          ))}
        </div>
      </section>

      {/* ============== CONTACT ============== */}
      <section className="page-hero py-5">
        <div className="container" style={{ maxWidth: 600 }}>
          <h2 className="text-center fw-bold mb-2 text-white">Get in Touch</h2>
          <p className="text-center text-white-50 mb-4">We'd love to hear from you</p>
          {contactSent ? (
            <div className="alert alert-success text-center">
              <i className="fa fa-check-circle me-2"></i> Thanks for reaching out! We'll get back to you soon.
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="bg-white p-4 rounded-4 shadow">
              <div className="mb-3">
                <label className="form-label small fw-bold">Email</label>
                <input
                  type="email"
                  className="form-control form-control-lg"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-bold">Message</label>
                <textarea
                  className="form-control form-control-lg"
                  rows={4}
                  placeholder="Tell us what's on your mind..."
                  value={contactMsg}
                  onChange={(e) => setContactMsg(e.target.value)}
                  required
                ></textarea>
              </div>
              <button type="submit" className="btn btn-dark btn-lg w-100">
                <i className="fa fa-paper-plane me-2"></i> Send Message
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ============== FOOTER ============== */}
      <footer className="bg-black text-white-50 py-4 text-center small">
        <div className="container">
          <div className="d-flex justify-content-center gap-4 mb-2">
            <span className="text-white-50" style={{ cursor: 'pointer' }}>Privacy Policy</span>
            <span className="text-white-50" style={{ cursor: 'pointer' }}>Terms of Service</span>
            <span className="text-white-50" style={{ cursor: 'pointer' }}>Cookie Policy</span>
          </div>
          <p className="mb-0">&copy; {new Date().getFullYear()} STAYVERSE. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}