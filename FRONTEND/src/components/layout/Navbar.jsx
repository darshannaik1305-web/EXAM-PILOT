import { Link, useNavigate, useLocation } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Menu, X } from "lucide-react";
import Container from "../common/Container";
import Button from "../ui/Button";
import LogoutModal from "../common/LogoutModal";

function Navbar() {
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    if (location.pathname !== "/") {
      setActiveSection("");
      return;
    }

    const handleScroll = () => {
      const sections = ["features", "how-it-works", "faq"];
      const scrollPosition = window.scrollY + 180; // Offset for sticky navbar + spacing

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection("#" + sectionId);
            return;
          }
        }
      }

      if (window.scrollY < 100) {
        setActiveSection("");
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  function handleLogoutClick() {
    setIsLogoutOpen(true);
    setIsOpen(false);
  }

  function handleConfirmLogout() {
    logout();
    setIsLogoutOpen(false);
    navigate("/login");
  }

  function handleCancelLogout() {
    setIsLogoutOpen(false);
  }

  const handleNavLinkClick = (e, href) => {
    e.preventDefault();
    setIsOpen(false);

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
  };

  const handleLogoClick = (e) => {
    setIsOpen(false);
    if (location.pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "FAQ", href: "#faq" },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 bg-slate-950/70 backdrop-blur-lg border-b border-slate-900 shadow-lg shadow-violet-950/10 transition-all duration-200">
        <Container>
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2.5 group" onClick={handleLogoClick}>
              <div className="relative flex items-center justify-center w-8.5 h-8.5 rounded-xl bg-gradient-to-tr from-violet-600/10 to-cyan-500/10 border border-violet-500/20 group-hover:border-cyan-400/40 transition-all duration-300 shadow-inner">
                <svg className="w-5 h-5 transition-transform duration-500 group-hover:rotate-90" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="logo-nav-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#a78bfa" />
                      <stop offset="100%" stopColor="#22d3ee" />
                    </linearGradient>
                  </defs>
                  {/* Four-pointed star / pilot compass */}
                  <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" stroke="url(#logo-nav-grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  {/* Graduation cap peak overlay line */}
                  <path d="M8.5 12L12 10L15.5 12" stroke="url(#logo-nav-grad)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  {/* Internal core */}
                  <circle cx="12" cy="12" r="1.5" fill="url(#logo-nav-grad)" />
                </svg>
              </div>
              <span className="text-xl font-black bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent font-outfit tracking-tight group-hover:brightness-110 transition-all duration-200">
                ExamPilot
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              {navLinks.map((link) => {
                const isActive = activeSection === link.href;
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => handleNavLinkClick(e, link.href)}
                    className={`text-sm font-semibold transition-all duration-200 cursor-pointer relative py-2 px-1 block group ${
                      isActive ? "text-cyan-400" : "text-muted hover:text-text"
                    }`}
                  >
                    <span>{link.name}</span>
                    <span
                      className={`absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-violet-500 to-cyan-400 transition-all duration-300 transform ${
                        isActive
                          ? "scale-x-100 opacity-100"
                          : "scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100"
                      } origin-left`}
                    />
                  </a>
                );
              })}
              {token && (
                <Link
                  to="/student/workspace"
                  className="text-sm font-semibold text-muted hover:text-text transition-all duration-200 transform hover:-translate-y-0.5 py-1.5 px-1"
                >
                  Workspace
                </Link>
              )}
            </div>

            {/* Desktop CTAs */}
            <div className="hidden lg:flex items-center space-x-4">
              {token ? (
                <Button variant="outline" size="sm" onClick={handleLogoutClick} className="py-2">
                  Logout
                </Button>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" size="sm" className="py-2 text-muted hover:text-text font-semibold hover:bg-slate-800/20 rounded-xl">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="primary" size="sm" className="py-2 bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 border-none shadow-md shadow-violet-950/20 active:scale-95 transition-all rounded-xl font-bold">
                      Register
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 rounded-xl text-muted hover:bg-slate-800/40 hover:text-text focus:outline-none cursor-pointer"
              aria-expanded={isOpen}
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </Container>

        {/* Mobile Menu Drawer Overlay */}
        {isOpen && (
          <div className="lg:hidden absolute top-16 left-0 right-0 bg-card border-b border-border shadow-lg px-4 py-6 space-y-4 animate-in slide-in-from-top duration-200">
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => {
                const isActive = activeSection === link.href;
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => handleNavLinkClick(e, link.href)}
                    className={`text-base font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-between ${
                      isActive
                        ? "bg-slate-900/60 text-cyan-400 border-l-2 border-cyan-400"
                        : "text-muted hover:text-text hover:bg-slate-800/40"
                    }`}
                  >
                    <span>{link.name}</span>
                    {isActive && <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />}
                  </a>
                );
              })}
              {token && (
                <Link
                  to="/student/workspace"
                  onClick={() => setIsOpen(false)}
                  className="text-base font-medium text-muted hover:text-text px-4 py-2 rounded-xl hover:bg-slate-800/40 transition-colors"
                >
                  Workspace
                </Link>
              )}

              <hr className="border-border" />

              <div className="flex flex-col space-y-2 px-4">
                {token ? (
                  <Button variant="outline" size="md" className="w-full" onClick={handleLogoutClick}>
                    Logout
                  </Button>
                ) : (
                  <>
                    <Link to="/login" className="w-full" onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" size="md" className="w-full text-muted hover:text-text">
                        Login
                      </Button>
                    </Link>
                    <Link to="/register" className="w-full" onClick={() => setIsOpen(false)}>
                      <Button variant="primary" size="md" className="w-full">
                        Register
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Reusable Logout Confirmation Modal */}
      <LogoutModal
        isOpen={isLogoutOpen}
        onConfirm={handleConfirmLogout}
        onCancel={handleCancelLogout}
      />
    </>
  );
}

export default Navbar;