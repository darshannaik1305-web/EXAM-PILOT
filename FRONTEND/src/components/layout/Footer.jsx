import Container from "../common/Container";

function Footer() {
  const currentYear = new Date().getFullYear();

  const footerGroups = [
    {
      title: "Product",
      links: [
        { name: "Features", href: "#features" },
        { name: "How It Works", href: "#how-it-works" },
        { name: "FAQ", href: "#faq" },
      ],
    },
    {
      title: "Legal",
      links: [
        { name: "Privacy Policy", href: "#" },
        { name: "Terms of Service", href: "#" },
        { name: "Refund Rules", href: "#" },
      ],
    },
    {
      title: "Contact",
      links: [
        { name: "Support Ticket", href: "#" },
        { name: "Status Tracker", href: "#" },
        { name: "Community Forum", href: "#" },
      ],
    },
  ];

  return (
    <footer className="bg-slate-950 border-t border-border py-12 md:py-16 text-muted">
      <Container>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div className="col-span-2 space-y-4">
            <span className="text-xl font-black bg-gradient-to-r from-violet-500 to-cyan-500 bg-clip-text text-transparent font-outfit">
              ExamPilot
            </span>
            <p className="text-xs sm:text-sm text-muted max-w-sm leading-relaxed">
              Ingest exam PDFs, auto-extract diagrams and equations using Gemini, and simulate timed mock tests with dynamic pacing analytics.
            </p>
          </div>

          {/* Links columns */}
          {footerGroups.map((group) => (
            <div key={group.title} className="space-y-4">
              <h4 className="text-xs font-bold text-text uppercase tracking-wider">
                {group.title}
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm">
                {group.links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="hover:text-text transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="pt-8 border-t border-border/40 text-center text-xs flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {currentYear} ExamPilot. All rights reserved.</p>
          <div className="flex space-x-6 text-muted">
            <a href="#" className="hover:text-text transition-colors">Privacy</a>
            <a href="#" className="hover:text-text transition-colors">Terms</a>
          </div>
        </div>
      </Container>
    </footer>
  );
}

export default Footer;
