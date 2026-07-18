import { useNavigate, useLocation } from "react-router-dom";
import Container from "../common/Container";

function Footer() {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavLinkClick = (e, href) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      if (location.pathname === "/") {
        const element = document.getElementById(href.substring(1));
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        navigate("/");
        setTimeout(() => {
          const element = document.getElementById(href.substring(1));
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
          }
        }, 150);
      }
    }
  };

  const handleLogoClick = (e) => {
    if (location.pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/");
    }
  };

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
    <footer className="bg-slate-950/90 backdrop-blur-md border-t border-slate-900 py-12 md:py-16 text-muted shadow-inner">
      <Container>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center space-x-2.5 group cursor-pointer select-none inline-flex" onClick={handleLogoClick}>
              <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600/10 to-cyan-500/10 border border-violet-500/20 group-hover:border-cyan-400/40 transition-all duration-300 shadow-inner">
                <svg className="w-4.5 h-4.5 transition-transform duration-500 group-hover:rotate-90" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="logo-footer-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#a78bfa" />
                      <stop offset="100%" stopColor="#22d3ee" />
                    </linearGradient>
                  </defs>
                  <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" stroke="url(#logo-footer-grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8.5 12L12 10L15.5 12" stroke="url(#logo-footer-grad)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="12" r="1.5" fill="url(#logo-footer-grad)" />
                </svg>
              </div>
              <span className="text-xl font-black bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent font-outfit tracking-tight group-hover:brightness-110 transition-all duration-200">
                ExamPilot
              </span>
            </div>
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
                      onClick={(e) => handleNavLinkClick(e, link.href)}
                      className="hover:text-cyan-400 hover:translate-x-1 transform transition-all duration-200 inline-block cursor-pointer"
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
        <div className="pt-8 border-t border-slate-900 text-center text-xs flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {currentYear} ExamPilot. All rights reserved.</p>
          <div className="flex space-x-6 text-muted animate-fade-in">
            <a href="#" className="hover:text-cyan-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Terms</a>
          </div>
        </div>
      </Container>
    </footer>
  );
}

export default Footer;
