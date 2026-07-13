import { Link, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Menu, X } from "lucide-react";
import Container from "../common/Container";
import Button from "../ui/Button";
import LogoutModal from "../common/LogoutModal";

function Navbar() {
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

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

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "FAQ", href: "#faq" },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 bg-slate-950/85 backdrop-blur-md border-b border-border transition-all duration-200">
        <Container>
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2" onClick={() => setIsOpen(false)}>
              <span className="text-xl font-black bg-gradient-to-r from-violet-500 to-cyan-500 bg-clip-text text-transparent font-outfit">
                ExamPilot
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-sm font-medium text-muted hover:text-text transition-colors"
                >
                  {link.name}
                </a>
              ))}
              {token && (
                <Link
                  to="/student/workspace"
                  className="text-sm font-medium text-muted hover:text-text transition-colors"
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
                    <Button variant="ghost" size="sm" className="py-2 text-muted hover:text-text">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="primary" size="sm" className="py-2">
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
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-base font-medium text-muted hover:text-text px-4 py-2 rounded-xl hover:bg-slate-800/40 transition-colors"
                >
                  {link.name}
                </a>
              ))}
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