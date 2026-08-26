import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAcademy } from '../hooks/useAcademy'
import { EventCard } from '../components/EventCard'
import { TrendingRail } from '../components/TrendingRail'
import { Icon } from '../components/Icon'
import { PageSection } from '../components/Navigation'

const DANCE_CATEGORIES = [
  {
    id: 'hiphop',
    name: 'Break & Urban',
    level: 'All Levels',
    count: '8 Batches',
    image: 'https://images.unsplash.com/photo-1547153760-18fcfa26afdc?auto=format&fit=crop&w=800&q=80',
    tag: 'Trending',
  },
  {
    id: 'kathak',
    name: 'Classical Kathak',
    level: 'Beginner - Advanced',
    count: '6 Batches',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
    tag: 'Gharana Lineage',
  },
  {
    id: 'contemporary',
    name: 'Contemporary Flow',
    level: 'Intermediate',
    count: '5 Batches',
    image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80',
    tag: 'Release & Floor',
  },
  {
    id: 'bharatanatyam',
    name: 'Bharatanatyam',
    level: 'Beginner - Master',
    count: '7 Batches',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
    tag: 'Live Nattuvangam',
  },
]

const STUDENT_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
]

interface HomePageProps {
  readonly className?: string
}

export function HomePage({ className = '' }: HomePageProps) {
  const { openBooking, bookedEventIds, classes, events, instructors } = useAcademy()
  const [videoModalOpen, setVideoModalOpen] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [trialEmail, setTrialEmail] = useState('')
  const [trialSubmitted, setTrialSubmitted] = useState(false)

  const featuredEvent = events.find((e) => e.isFeatured) ?? events[0]

  function toggleMute() {
    setIsMuted((prev) => !prev)
  }

  function handleTrialSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (trialEmail.trim()) {
      setTrialSubmitted(true)
      setTimeout(() => {
        setTrialSubmitted(false)
        setTrialEmail('')
      }, 4000)
    }
  }

  return (
    <div className={`min-h-screen bg-[#080b0e] text-white selection:bg-[#25d7da] selection:text-black ${className}`}>
      {/* ─────────────────── EXACT DAZLLE HERO SECTION ─────────────────── */}
      <section className="relative w-full pt-10 pb-20 sm:pt-14 sm:pb-28 lg:pt-16 lg:pb-32 overflow-hidden">
        {/* Subtle atmospheric ambient glow */}
        <div className="pointer-events-none absolute left-1/2 -top-24 -translate-x-1/2 size-[650px] rounded-full bg-[#25d7da]/10 blur-[160px]" />

        <PageSection>
          {/* 1. Headline */}
          <div className="text-center mx-auto max-w-5xl">
            <h1 className="font-expanded text-4xl font-semibold uppercase tracking-wide sm:text-6xl md:text-7xl lg:text-[4.5rem] leading-[1.1] text-white">
              <div>Unlock Your Dance</div>
              <div className="mt-1.5 sm:mt-2.5">
                Potential With Mudra
              </div>
            </h1>
          </div>

          {/* 2. Centerpiece Gradient Box with Embedded Intro Video */}
          <div className="relative mt-12 sm:mt-16 lg:mt-20 mx-auto max-w-5xl">
            {/* The Rounded Gradient Box Canvas with Increased Height for Complete Video */}
            <div className="relative mx-auto h-[340px] sm:h-[480px] md:h-[540px] lg:h-[580px] w-full rounded-[28px] sm:rounded-[36px] bg-gradient-to-r from-[#fed5b0] via-[#d5e8b4] to-[#25d7da] shadow-[0_20px_60px_-15px_rgba(37,215,218,0.3)] overflow-hidden flex items-center justify-center">
              
              {/* Intro Video Element */}
              <video
                src="/intro_video.mp4"
                autoPlay
                loop
                muted={isMuted}
                playsInline
                className="size-full object-cover mix-blend-multiply opacity-90 transition-opacity duration-300"
              />

              {/* Subtle Gradient Overlays for rich pastel blend */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#fed5b0]/30 via-transparent to-[#25d7da]/30 mix-blend-overlay" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />

              {/* Speaker Audio Toggle Icon Button */}
              <button
                type="button"
                onClick={toggleMute}
                className="group absolute bottom-4 right-4 z-20 flex items-center gap-2 rounded-full border border-white/30 bg-black/75 px-4 py-2 text-xs font-black uppercase tracking-wider text-white backdrop-blur-xl shadow-2xl transition-all hover:bg-white hover:text-black hover:scale-105 active:scale-95"
                aria-label={isMuted ? 'Unmute video audio' : 'Mute video audio'}
              >
                <Icon
                  name={isMuted ? 'volume_off' : 'volume_up'}
                  size={18}
                  className={isMuted ? 'text-white/70 group-hover:text-black' : 'text-[#25d7da] group-hover:text-black'}
                />
                <span>{isMuted ? 'Unmute' : 'Mute'}</span>
              </button>

              {/* Pinned Sticker: "JOIN WITH US" */}
              <button
                type="button"
                onClick={() => openBooking({ kind: 'class', id: classes[0]?.id ?? 'kathak-foundations' })}
                className="group absolute right-3 top-3 sm:right-5 sm:top-5 z-20 flex size-16 sm:size-20 lg:size-24 flex-col items-center justify-center rounded-full border-2 border-black bg-[#fcd3bd] text-center text-black font-black uppercase shadow-[4px_4px_0px_#000] rotate-12 transition-all duration-300 hover:rotate-0 hover:scale-110 active:translate-x-1 active:translate-y-1 active:shadow-none"
              >
                <span className="text-[9px] sm:text-[11px] lg:text-xs leading-none font-extrabold">JOIN</span>
                <span className="text-[9px] sm:text-[11px] lg:text-xs leading-none font-extrabold mt-0.5">WITH US</span>
              </button>
            </div>
          </div>

          {/* 3. Hero Bottom Controls Bar */}
          <div className="mt-12 sm:mt-16 flex flex-col sm:flex-row items-center justify-between gap-6 max-w-5xl mx-auto px-2">
            {/* Left: Watch Intro Button */}
            <button
              type="button"
              onClick={() => setVideoModalOpen(true)}
              className="flex items-center gap-3.5 group cursor-pointer text-left"
            >
              <span className="grid size-12 place-items-center rounded-full bg-white text-black shadow-lg transition-transform duration-200 group-hover:scale-110 group-hover:bg-[#25d7da]">
                <Icon name="play_arrow" size={24} filled />
              </span>
              <span className="font-expanded text-xs sm:text-sm font-extrabold uppercase tracking-wider text-white group-hover:text-[#25d7da] transition-colors">
                Watch Intro
              </span>
            </button>

            {/* Right: Social Proof Student Avatars */}
            <div className="flex items-center gap-3">
              <div className="flex -space-x-3">
                {STUDENT_AVATARS.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt="Student"
                    className="size-9 rounded-full object-cover ring-2 ring-[#080b0e]"
                  />
                ))}
              </div>
              <span className="text-xs sm:text-sm font-bold text-white/90">
                5K+ Success Students
              </span>
            </div>
          </div>
        </PageSection>
      </section>

      {/* ─────────────────── 2. FEATURED MASTERCLASS (2ND SECTION) ─────────────────── */}
      <section className="py-16 sm:py-20 lg:py-24 border-t border-white/10 bg-[#0a0e12]/80">
        <PageSection>
          <div className="mb-8 sm:mb-10 flex items-end justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-[#25d7da]">
                Spotlight Workshop
              </p>
              <h2 className="mt-1 font-expanded text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
                Featured Masterclass
              </h2>
            </div>
            <Link
              to="/events"
              className="text-xs font-bold uppercase tracking-wider text-[#25d7da] hover:underline"
            >
              All Events →
            </Link>
          </div>

          {featuredEvent ? (
            <EventCard
              event={featuredEvent}
              featured
              booked={bookedEventIds.has(featuredEvent.id)}
              onBook={(id) => openBooking({ kind: 'event', id })}
            />
          ) : (
            <div className="min-h-[300px] rounded-[28px] glass-card flex items-center justify-center p-8 text-center text-white/50 animate-pulse">
              Loading featured masterclass...
            </div>
          )}
        </PageSection>
      </section>

      {/* ─────────────────── 3. STYLES / CLASSES CAROUSEL ─────────────────── */}
      <section className="py-20 lg:py-28 border-t border-white/10 bg-[#0a0e12]/40">
        <PageSection>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-[#25d7da]">
                Explore Disciplines
              </p>
              <h2 className="mt-2 font-expanded text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
                Dance Styles We Teach
              </h2>
            </div>
            <Link
              to="/classes"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-white hover:text-black no-underline self-start md:self-auto"
            >
              View All Batches
              <Icon name="arrow_forward" size={16} />
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {DANCE_CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-[#0d1216] transition-all duration-300 hover:-translate-y-2 hover:border-[#25d7da]/50 hover:shadow-[0_20px_40px_-15px_rgba(37,215,218,0.2)]"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="size-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d1216] via-transparent to-transparent" />
                  <span className="absolute left-4 top-4 rounded-full bg-black/75 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#25d7da]">
                    {cat.tag}
                  </span>
                </div>

                <div className="p-6">
                  <h3 className="font-expanded text-xl font-bold uppercase">{cat.name}</h3>
                  <div className="mt-2 flex items-center justify-between text-xs text-white/60">
                    <span>{cat.level}</span>
                    <span className="font-semibold text-[#fed5b0]">{cat.count}</span>
                  </div>

                  <Link
                    to="/classes"
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-white/5 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white transition-colors group-hover:bg-[#25d7da] group-hover:text-black no-underline"
                  >
                    Explore Class
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </PageSection>
      </section>

      {/* ─────────────────── 4. WHY DAZLLE BENTO GRID ─────────────────── */}
      <section className="py-20 lg:py-28 border-t border-white/10 relative">
        <PageSection>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-[#25d7da]">
              World-Class Studio
            </p>
            <h2 className="mt-2 font-expanded text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
              Why Learn With Us
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Card 1 */}
            <div className="rounded-3xl border border-white/10 bg-[#0d1216] p-8 transition-all hover:border-[#25d7da]/40">
              <span className="font-expanded text-4xl font-black text-[#25d7da]">01</span>
              <h3 className="mt-4 font-expanded text-2xl font-bold uppercase">Live Percussion</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/70">
                Every session is accompanied by resident tabla and percussion artists to foster genuine rhythmic mastery and improvisation.
              </p>
            </div>

            {/* Card 2 */}
            <div className="rounded-3xl border border-white/10 bg-[#0d1216] p-8 transition-all hover:border-[#25d7da]/40">
              <span className="font-expanded text-4xl font-black text-[#fed5b0]">02</span>
              <h3 className="mt-4 font-expanded text-2xl font-bold uppercase">Master Gurus</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/70">
                Train under veteran mentors with direct lineage from celebrated gharanas and national performance accolades.
              </p>
            </div>

            {/* Card 3 */}
            <div className="rounded-3xl border border-white/10 bg-[#0d1216] p-8 transition-all hover:border-[#25d7da]/40">
              <span className="font-expanded text-4xl font-black text-[#d5e8b4]">03</span>
              <h3 className="mt-4 font-expanded text-2xl font-bold uppercase">Pro Stagecraft</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/70">
                Annual full-stage recitals at Mumbai's top proscenium theatres with custom costuming and lighting design.
              </p>
            </div>
          </div>
        </PageSection>
      </section>

      {/* ─────────────────── INSTRUCTORS ROSTER ─────────────────── */}
      <section className="py-20 lg:py-28">
        <PageSection>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-[#25d7da]">
              World-Class Faculty
            </p>
            <h2 className="mt-2 font-expanded text-3xl sm:text-5xl font-black uppercase tracking-tight">
              Meet Our Gurus
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {instructors.map((guru) => (
              <div
                key={guru.id}
                className="group flex flex-col items-center rounded-3xl border border-white/10 bg-[#0d1216] p-6 text-center transition-all hover:-translate-y-2 hover:border-[#25d7da]/50"
              >
                <img
                  src={guru.avatarUrl || (guru as any).avatar}
                  alt={guru.name}
                  className="size-24 rounded-full object-cover ring-2 ring-white/20 transition-transform duration-300 group-hover:scale-105 group-hover:ring-[#25d7da]"
                />
                <h3 className="mt-4 font-expanded text-lg font-bold uppercase">{guru.name}</h3>
                <p className="text-xs font-semibold text-[#25d7da] mt-0.5">{guru.title}</p>
              </div>
            ))}
          </div>
        </PageSection>
      </section>

      {/* ─────────────────── TRENDING CLASSES ─────────────────── */}
      <PageSection className="py-16 border-t border-white/10">
        <TrendingRail onBook={(id) => openBooking({ kind: 'class', id })} />
      </PageSection>

      {/* ─────────────────── COMMUNITY CTA ─────────────────── */}
      <section className="py-20 lg:py-28">
        <PageSection>
          <div className="relative overflow-hidden rounded-[36px] bg-gradient-to-r from-[#fed5b0] via-[#d5e8b4] to-[#25d7da] p-10 sm:p-16 text-black text-center shadow-2xl">
            <div className="relative z-10 max-w-2xl mx-auto">
              <span className="rounded-full bg-black/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-black">
                Join Mudra Academy
              </span>
              <h2 className="mt-4 font-expanded text-4xl sm:text-6xl font-black uppercase tracking-tight">
                Start Dancing Today
              </h2>
              <p className="mt-3 text-sm sm:text-base font-medium text-black/80">
                Join our supportive community in Gomti Nagar, Lucknow. Start your journey in classical and contemporary dance.
              </p>

              {trialSubmitted ? (
                <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-bold text-white shadow-xl">
                  <Icon name="check_circle" size={20} filled className="text-[#25d7da]" />
                  Welcome to Mudra! Check your inbox for orientation details.
                </div>
              ) : (
                <form onSubmit={handleTrialSubmit} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <input
                    type="email"
                    value={trialEmail}
                    onChange={(e) => setTrialEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full rounded-full border border-black/20 bg-white/90 px-5 py-3.5 text-sm font-medium text-black placeholder:text-black/50 outline-none focus:bg-white focus:ring-2 focus:ring-black"
                  />
                  <button
                    type="submit"
                    className="rounded-full bg-black px-7 py-3.5 text-xs font-black uppercase tracking-wider text-white transition-transform hover:scale-105 active:scale-95 shadow-xl"
                  >
                    Get Started
                  </button>
                </form>
              )}
            </div>
          </div>
        </PageSection>
      </section>

      {/* ─────────────────── INTRO VIDEO MODAL ─────────────────── */}
      {videoModalOpen ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/90 p-4 backdrop-blur-xl"
          role="presentation"
          onClick={() => setVideoModalOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-white/20 bg-[#0d1216] p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 px-2">
              <h3 className="font-expanded text-lg font-bold uppercase tracking-wider text-white">Mudra Dance Academy Showreel</h3>
              <button
                type="button"
                onClick={() => setVideoModalOpen(false)}
                className="grid size-9 place-items-center rounded-full text-white/60 hover:bg-white/10 hover:text-white"
              >
                <Icon name="close" size={22} />
              </button>
            </div>
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black">
              <video
                src="/intro_video.mp4"
                controls
                autoPlay
                className="size-full object-contain"
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
