import { academy } from '../data/mockData'

type SocialId = (typeof academy.socials)[number]['id']

interface SocialGlyphProps {
  readonly name: SocialId
  readonly className?: string
}

function SocialGlyph({ name, className = 'size-5' }: SocialGlyphProps) {
  if (name === 'instagram') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="17.4" cy="6.6" r="1" fill="currentColor" />
      </svg>
    )
  }
  if (name === 'facebook') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
        <path d="M14.5 8.5V6.8c0-.7.5-1.1 1.2-1.1h1.3V3h-2.3C12.2 3 11 4.4 11 6.6v1.9H9v2.7h2V21h3.5v-9.8h2.3l.4-2.7h-2.7Z" />
      </svg>
    )
  }
  if (name === 'youtube') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
        <path d="M21.6 7.8a3 3 0 0 0-2.1-2.1C17.7 5.3 12 5.3 12 5.3s-5.7 0-7.5.4A3 3 0 0 0 2.4 7.8 31 31 0 0 0 2 12a31 31 0 0 0 .4 4.2 3 3 0 0 0 2.1 2.1c1.8.4 7.5.4 7.5.4s5.7 0 7.5-.4a3 3 0 0 0 2.1-2.1A31 31 0 0 0 22 12a31 31 0 0 0-.4-4.2ZM10 15.2V8.8L15.2 12 10 15.2Z" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M14.7 3h2.8l-6.1 7 7.2 11h-5.6l-4.4-6.7L4 21H1.2l6.6-7.5L1 3h5.7l4 6.1L14.7 3Zm-1 16.6h1.5L6.4 4.3H4.7l9 15.3Z" />
    </svg>
  )
}

interface MapsPinProps {
  readonly className?: string
}

function MapsPin({ className = 'size-11' }: MapsPinProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path
        d="M24 4c-7.7 0-14 6.2-14 14 0 10.5 14 26 14 26s14-15.5 14-26c0-7.8-6.3-14-14-14Z"
        fill="#ea4335"
      />
      <path d="M24 4c-.7 0-1.4.1-2 .2 6.6.8 11.7 6.4 11.7 13.8 0 8.4-9.2 21.2-11.7 24.7 2.2-2.9 16-16.1 16-24.7C38 10.2 31.7 4 24 4Z" fill="#fbbc04" />
      <path d="M10 18c0-6.6 4.4-12.1 10.3-13.6C14.6 5.8 10 11.3 10 18c0 8.6 10.3 21.2 14 25.2-3.7-4.4-14-16.4-14-25.2Z" fill="#34a853" />
      <circle cx="24" cy="18" r="7" fill="#4285f4" />
      <circle cx="24" cy="18" r="3.2" fill="#1a73e8" />
    </svg>
  )
}

interface SiteFooterProps {
  readonly className?: string
}

export function SiteFooter({ className = '' }: SiteFooterProps) {
  const { location, socials, tagline } = academy

  return (
    <footer className={`glass-card mt-auto ${className}`}>
      <div className="gradient-divider" />
      <div className="flex w-full flex-col gap-10 px-6 py-10 sm:px-10 lg:flex-row lg:items-center lg:justify-between lg:px-16 xl:px-20">
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-4">
            <img
              src="/logo.png"
              alt="Mudra Dance Academy"
              className="h-16 sm:h-20 w-auto rounded-2xl object-contain bg-white p-2 shadow-xl"
            />
            <div>
              <p className="font-expanded text-xl font-bold text-white">{academy.name}</p>
              <p className="text-xs text-white/60">{tagline}</p>
            </div>
          </div>
          <div>
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#fed5b0]">
              Follow us
            </p>
            <ul className="flex items-center gap-3">
              {socials.map((social) => (
                <li key={social.id}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={social.label}
                    className="glass grid size-11 place-items-center rounded-full text-on-surface-light no-underline transition-transform duration-200 hover:-translate-y-0.5 hover:bg-primary hover:text-on-primary"
                  >
                    <SocialGlyph name={social.id} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <a
          href={location.mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="glass flex items-center gap-4 rounded-xl px-5 py-4 no-underline transition-transform duration-200 hover:-translate-y-0.5 hover:bg-white/5 lg:ml-auto"
        >
          <MapsPin />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-terracotta-muted">
              Location
            </p>
            <p className="mt-1 font-semibold text-on-surface-light">{location.label}</p>
            <p className="text-sm text-on-variant-light">{location.address}</p>
            <p className="text-sm text-on-variant-light">{location.city}</p>
            <p className="mt-2 text-xs font-bold uppercase tracking-wider text-primary">
              Open in Google Maps
            </p>
          </div>
        </a>
      </div>
    </footer>
  )
}
