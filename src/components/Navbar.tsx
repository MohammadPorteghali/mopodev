export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 z-10 flex w-full items-center justify-between px-5 py-4 sm:px-8 sm:py-5" aria-label="Main navigation">
      <a href="#" className="flex items-center gap-3 text-white">
        <span
          className="text-[21px] tracking-tight sm:text-[26px]"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Mohammad Porteghali
        </span>
      </a>
    </nav>
  )
}
