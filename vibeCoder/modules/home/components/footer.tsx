export default function Footer() {
  return (
    <footer className="w-full bg-[--vc-surface] border-t border-[--vc-border] py-6 px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-[--vc-text-muted]">
      <div className="flex items-center gap-2">
        <span className="bg-[--vc-gradient-primary] bg-clip-text text-transparent font-semibold">
          VibeCoder
        </span>
        <span>© {new Date().getFullYear()} All rights reserved.</span>
      </div>

      <div className="flex gap-4">
        <a
          href="#"
          className="text-[--vc-text-secondary] hover:text-[--vc-text-primary] transition-colors"
        >
          Privacy
        </a>
        <a
          href="#"
          className="text-[--vc-text-secondary] hover:text-[--vc-text-primary] transition-colors"
        >
          Terms
        </a>
        <a
          href="#"
          className="text-[--vc-text-secondary] hover:text-[--vc-text-primary] transition-colors"
        >
          Contact
        </a>
      </div>
    </footer>
  );
}
