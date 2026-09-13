import { useEffect, useState } from 'react'
import { useTypewriter } from '../hooks/useTypewriter'

const TYPED_TEXT = 'I started my career in front-end development in 2018. Today, I work across the full stack, building websites, mobile apps, and CRM systems.'

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 fill-current" aria-hidden="true">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V8.98h3.41v1.57h.05c.47-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.29ZM5.32 7.41a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13ZM7.1 20.45H3.54V8.98H7.1v11.47Z" />
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 fill-current" aria-hidden="true">
      <path d="M12 .7A11.3 11.3 0 0 0 8.43 22.73c.57.1.77-.25.77-.55v-2.17c-3.15.68-3.81-1.34-3.81-1.34-.52-1.31-1.26-1.66-1.26-1.66-1.03-.7.08-.69.08-.69 1.14.08 1.74 1.17 1.74 1.17 1.01 1.73 2.65 1.23 3.3.94.1-.73.4-1.23.72-1.51-2.51-.29-5.15-1.26-5.15-5.59 0-1.23.44-2.24 1.17-3.03-.12-.29-.51-1.44.11-2.99 0 0 .95-.31 3.11 1.16a10.72 10.72 0 0 1 5.67 0c2.16-1.47 3.11-1.16 3.11-1.16.62 1.55.23 2.7.11 2.99.73.79 1.17 1.8 1.17 3.03 0 4.34-2.65 5.3-5.17 5.58.41.35.77 1.04.77 2.1v3.11c0 .31.2.66.78.55A11.3 11.3 0 0 0 12 .7Z" />
    </svg>
  )
}
export default function Hero() {
  const { displayed, done } = useTypewriter(TYPED_TEXT)
  const [showActions, setShowActions] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setShowActions(true), 400)
    return () => clearTimeout(t)
  }, [])

  return (
    <main className="profile-hero relative z-[1] flex flex-col px-5 sm:px-8 md:h-screen md:justify-center md:px-10">
      <div className="relative z-10 max-w-xl">
        <h1
          className="profile-intro pointer-events-none mb-5 select-none sm:mb-6"
          style={{
            fontSize: 'clamp(18px, 4vw, 26px)',
            lineHeight: 1.3,
            fontWeight: 400,
            color: '#fff',
          }}
        >
          Hi, I’m Mohammad Porteghali.
          <br />
          Full-stack developer based in Turkey.
        </h1>

        <p
          className="profile-description mb-5 text-white sm:mb-6"
          style={{
            fontSize: 'clamp(18px, 4vw, 26px)',
            lineHeight: 1.35,
            fontWeight: 400,
            minHeight: 54,
          }}
        >
          <span className="md:hidden">{TYPED_TEXT}</span>
          <span className="hidden md:inline">{displayed}</span>
          {!done && (
            <span
              className="ml-[2px] hidden h-[1.1em] w-[2px] bg-white align-middle md:inline-block"
              style={{ animation: 'blink 1s step-end infinite' }}
            />
          )}
        </p>

        <div
          className="flex flex-wrap gap-y-1"
          style={{
            opacity: showActions ? 1 : 0,
            transform: showActions ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 0.4s ease, transform 0.4s ease',
          }}
        >
          <a
            href="/files/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full border border-white bg-white px-6 py-3 text-[15px] text-black transition-colors duration-200 hover:bg-transparent hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            View my CV
            <span className="sr-only"> (PDF, opens in a new tab)</span>
          </a>
        </div>
      </div>

      <nav
        aria-label="Contact links"
        className="profile-contact z-10 flex items-center gap-2 text-white md:fixed md:bottom-6 md:left-8"
      >
        <a
          href="mailto:mohammadporteghali@gmail.com"
          aria-label="Email Mohammad"
          title="Email"
          className="grid size-10 place-items-center rounded-full transition-colors hover:bg-white hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <MailIcon />
        </a>
        <a
          href="https://linkedin.com/in/mohammad-porteghali-b66926176"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Mohammad on LinkedIn"
          title="LinkedIn"
          className="grid size-10 place-items-center rounded-full transition-colors hover:bg-white hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <LinkedInIcon />
        </a>
        <a
          href="https://github.com/MohammadPorteghali"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Mohammad on GitHub"
          title="GitHub"
          className="grid size-10 place-items-center rounded-full transition-colors hover:bg-white hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <GitHubIcon />
        </a>
      </nav>
    </main>
  )
}
