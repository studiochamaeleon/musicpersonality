import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-[#050507] text-white">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-extrabold tracking-[-0.02em]">MUSIC PERSONALITY</p>
            <p className="mt-1 text-xs text-white/45">A lighthearted test inspired by the MUSIC model.</p>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="text-xs text-white/45 transition-colors hover:text-white">
              Privacy
            </Link>
            <Link href="/terms" className="text-xs text-white/45 transition-colors hover:text-white">
              Terms
            </Link>
          </div>
        </div>
        <p className="mt-6 border-t border-white/10 pt-5 text-[11px] text-white/30">
          © {new Date().getFullYear()} Music Personality Test
        </p>
      </div>
    </footer>
  );
}
