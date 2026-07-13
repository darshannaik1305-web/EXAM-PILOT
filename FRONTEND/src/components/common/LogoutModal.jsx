import Button from "./Button";

function LogoutModal({ isOpen, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      {/* Modal Dialog */}
      <div 
        className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-sm w-full p-6 relative animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-title"
        aria-describedby="logout-desc"
      >
        <h3 id="logout-title" className="text-xl font-bold text-slate-900 mb-2">
          Confirm Logout
        </h3>
        <p id="logout-desc" className="text-sm text-slate-500 mb-6 leading-relaxed">
          Are you sure you want to log out of your ExamPilot workspace? You will need to sign in again to access your practice mock tests.
        </p>

        <div className="flex justify-end space-x-3">
          <Button variant="ghost" size="sm" onClick={onCancel} className="cursor-pointer">
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={onConfirm} className="cursor-pointer">
            Log Out
          </Button>
        </div>
      </div>
    </div>
  );
}

export default LogoutModal;
