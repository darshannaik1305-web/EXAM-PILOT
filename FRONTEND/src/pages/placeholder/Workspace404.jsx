import { Link } from "react-router-dom";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { AlertCircle } from "lucide-react";

function Workspace404() {
  return (
    <div className="max-w-md mx-auto py-12 text-center animate-in fade-in duration-200">
      <Card className="p-8 border-border bg-card shadow-xl space-y-6">
        <div className="mx-auto w-14 h-14 bg-slate-900 border border-border rounded-2xl flex items-center justify-center text-primary">
          <AlertCircle size={28} />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl font-extrabold text-text font-outfit">
            Workspace Module Not Found
          </h2>
          <p className="text-xs sm:text-sm text-muted leading-relaxed">
            The workspace route or sub-page you requested does not exist or you do not have permissions to access it.
          </p>
        </div>

        <div className="pt-2">
          <Link to="/student/workspace">
            <Button variant="primary" className="w-full py-3 cursor-pointer">
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default Workspace404;
