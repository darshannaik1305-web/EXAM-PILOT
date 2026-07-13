import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { Upload, FileText, X, ShieldAlert, CheckCircle2 } from "lucide-react";
import Button from "../ui/Button";
import Card from "../ui/Card";
import Spinner from "../ui/Spinner";
import { uploadPractice } from "../../services/practiceService";
import { formatBytes } from "../../utils/formatters";

function UploadZone({ onUploadSuccess }) {
  const [title, setTitle] = useState("");
  const [uploadType, setUploadType] = useState("PDF_MOCK");
  const [file, setFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(0);

  const fileInputRef = useRef(null);

  const steps = [
    "Uploading PDF to server...",
    "Reading document pages...",
    "Extracting exam questions via Gemini...",
    "Compiling solution explanations...",
    "Structuring interactive test layout...",
    "Completed successfully!"
  ];

  const supportedExams = ["JEE", "NEET", "KCET", "BITSAT", "GATE", "UPSC"];

  // Animate processing steps while upload is running
  useEffect(() => {
    let interval;
    if (loading) {
      setCurrentStep(0);
      interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev < steps.length - 2) {
            return prev + 1;
          }
          return prev;
        });
      }, 3500); // Transition every 3.5 seconds
    } else {
      setCurrentStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  function handleDragOver(e) {
    e.preventDefault();
    setIsDragOver(true);
  }

  // Handle Drag Leave
  function handleDragLeave() {
    setIsDragOver(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragOver(false);
    setError("");

    if (loading) return;

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      validateAndSetFile(droppedFiles[0]);
    }
  }

  function handleFileSelect(e) {
    setError("");
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      validateAndSetFile(selectedFiles[0]);
    }
  }

  function validateAndSetFile(selectedFile) {
    if (selectedFile.type !== "application/pdf" && !selectedFile.name.endsWith(".pdf")) {
      setError("Only PDF files are supported");
      toast.error("Invalid file format. Please upload a PDF.");
      return;
    }

    const maxSize = 50 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setError("File exceeds maximum 50MB size threshold");
      toast.error("File is too large. Maximum size is 50MB.");
      return;
    }

    setFile(selectedFile);
    if (!title) {
      const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, "");
      setTitle(nameWithoutExt);
    }
  }

  function clearFile() {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!file) {
      setError("Please select or drop a practice paper PDF");
      return;
    }
    if (!title || !title.trim()) {
      setError("Please provide a title for this practice session");
      return;
    }

    setLoading(true);
    try {
      const data = await uploadPractice(title.trim(), uploadType, file);
      
      // Complete step
      setCurrentStep(steps.length - 1);
      toast.success("PDF parsed successfully! Mock test created.");

      // Clear forms
      setTitle("");
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      if (onUploadSuccess) {
        onUploadSuccess(data);
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || "Failed to process PDF. Check structure or try again.";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="h-full flex flex-col justify-between hover:border-slate-600 transition-colors duration-300 relative group overflow-hidden">
      {/* Glow highlight */}
      <div className="absolute -inset-px bg-gradient-to-tr from-primary/5 to-cyan-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="relative z-10">
        <h3 className="text-lg font-bold text-text mb-4 font-outfit">
          Upload Practice Paper
        </h3>

        {loading ? (
          /* Stepper visual animation display */
          <div className="py-6 space-y-6">
            <div className="flex items-center space-x-3.5 bg-slate-900/60 border border-border p-4 rounded-xl">
              <Spinner size="md" color="primary" />
              <div>
                <p className="text-sm font-bold text-text animate-pulse">AI Parser Working</p>
                <p className="text-xs text-muted">Running pipeline on backend server</p>
              </div>
            </div>

            {/* Steps checklists */}
            <div className="space-y-3 pl-2">
              {steps.map((step, idx) => {
                const isPassed = idx < currentStep;
                const isCurrent = idx === currentStep;

                return (
                  <div
                    key={step}
                    className={`flex items-center space-x-3 text-xs transition-colors duration-250 ${
                      isPassed ? "text-emerald-400 font-semibold" : isCurrent ? "text-text font-bold text-primary" : "text-muted"
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {isPassed ? (
                        <CheckCircle2 size={14} className="text-emerald-400" />
                      ) : (
                        <div
                          className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[9px] font-bold ${
                            isCurrent
                              ? "border-primary text-primary bg-primary/10 animate-pulse"
                              : "border-border text-muted"
                          }`}
                        >
                          {idx + 1}
                        </div>
                      )}
                    </div>
                    <span>{step}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* File Drag Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
                isDragOver
                  ? "border-primary bg-primary/5 scale-[0.99] opacity-90"
                  : file
                  ? "border-emerald-500/40 bg-emerald-500/5"
                  : "border-border hover:border-primary/50 hover:bg-slate-900/40"
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".pdf"
                className="hidden"
              />

              {file ? (
                <div className="flex items-center justify-between p-3 bg-slate-900 border border-border rounded-xl">
                  <div className="flex items-center space-x-2.5 text-left truncate">
                    <FileText className="text-emerald-400 flex-shrink-0" size={24} />
                    <div className="truncate">
                      <p className="text-sm font-bold text-text truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-muted font-medium">
                        {formatBytes(file.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearFile();
                    }}
                    className="p-1.5 hover:bg-slate-800 rounded-lg text-muted hover:text-text transition-colors cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="py-2.5 space-y-3.5">
                  <div className="mx-auto w-12 h-12 rounded-full bg-slate-900 border border-border flex items-center justify-center text-muted group-hover:text-primary transition-colors">
                    <Upload size={22} className="group-hover:scale-105 transition-transform" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text">
                      Drag and drop your PDF here, or{" "}
                      <span className="text-primary hover:opacity-90">browse</span>
                    </p>
                    <p className="text-xs text-muted mt-1 font-medium">
                      PDF format files only (Max. 50MB)
                    </p>
                  </div>

                  {/* Supported Exam Chips */}
                  <div className="pt-2 border-t border-border/40">
                    <p className="text-[9px] font-bold text-muted uppercase tracking-widest mb-2">Supported Exams</p>
                    <div className="flex flex-wrap justify-center gap-1.5">
                      {supportedExams.map((exam) => (
                        <span
                          key={exam}
                          className="px-2 py-0.5 text-[9px] font-extrabold bg-slate-900 border border-border text-muted rounded-md tracking-wider select-none hover:text-text hover:border-slate-600 transition-colors"
                        >
                          {exam}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block mb-1.5 text-[10px] font-bold text-muted uppercase tracking-wider" htmlFor="upload-title">
                Test Session Title
              </label>
              <input
                id="upload-title"
                type="text"
                placeholder="e.g. JEE Mains Physics 2024"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-border bg-slate-900 rounded-xl p-3 text-sm transition-all focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-text placeholder-muted"
              />
            </div>

            {/* Upload Configuration Type */}
            <div>
              <label className="block mb-1.5 text-[10px] font-bold text-muted uppercase tracking-wider" htmlFor="upload-type">
                Practice Configuration
              </label>
              <select
                id="upload-type"
                value={uploadType}
                onChange={(e) => setUploadType(e.target.value)}
                className="w-full border border-border bg-slate-900 rounded-xl p-3 text-sm transition-all focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-text bg-slate-900 cursor-pointer"
              >
                <option value="PDF_MOCK" className="bg-slate-900 text-text">Structure as Timed Mock Test</option>
                <option value="PRACTICE_PAPER" className="bg-slate-900 text-text">Structure as Practice Q&A Bank</option>
              </select>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start space-x-2 text-danger p-3 bg-danger/10 rounded-xl border border-danger/20 text-xs font-semibold animate-in slide-in-from-top-1 duration-200">
                <ShieldAlert size={14} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </form>
        )}
      </div>

      <div className="mt-6 relative z-10">
        <Button
          onClick={handleSubmit}
          disabled={loading || !file || !title.trim()}
          className="w-full py-3.5"
        >
          Start AI Processing
        </Button>
      </div>
    </Card>
  );
}

export default UploadZone;
