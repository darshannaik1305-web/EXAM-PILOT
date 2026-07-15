import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { Upload, FileText, X, ShieldAlert, CheckCircle2, ChevronRight, ChevronLeft, Settings, HelpCircle, FileSpreadsheet } from "lucide-react";
import Button from "../ui/Button";
import Card from "../ui/Card";
import Spinner from "../ui/Spinner";
import { uploadPractice, uploadAnswerKey } from "../../services/practiceService";
import { formatBytes } from "../../utils/formatters";

function UploadZone({ onUploadSuccess }) {
  // Wizard steps: 0 (Upload Q Paper), 1 (Configurations), 2 (Upload separate Answer Key if separate chosen)
  const [wizardStep, setWizardStep] = useState(0);

  // Form states
  const [title, setTitle] = useState("");
  const [examName, setExamName] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(90);
  const [positiveMarks, setPositiveMarks] = useState(4.0);
  const [negativeMarks, setNegativeMarks] = useState(1.0);
  const [uploadType, setUploadType] = useState("PDF_MOCK"); // PDF_MOCK or QUESTION_AND_SEPARATE_ANSWER_KEY
  const [subject, setSubject] = useState("");
  const [customSubject, setCustomSubject] = useState("");

  // Files
  const [file, setFile] = useState(null);
  const [answerKeyFile, setAnswerKeyFile] = useState(null);

  // UI state
  const [isDragOver, setIsDragOver] = useState(false);
  const [isAkDragOver, setIsAkDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStepText, setLoadingStepText] = useState("");
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [error, setError] = useState("");
  const [createdSessionId, setCreatedSessionId] = useState(null);

  const fileInputRef = useRef(null);
  const akInputRef = useRef(null);

  const steps = [
    "Uploading PDF to server...",
    "Reading document pages...",
    "Extracting exam questions via Gemini...",
    "Compiling solution explanations...",
    "Structuring interactive test layout...",
    "Completed successfully!"
  ];

  const akSteps = [
    "Uploading answer key PDF...",
    "Parsing answer choices via regex...",
    "Refining accuracy with AI fallback...",
    "Merging answer key into exam questions...",
    "Completed successfully!"
  ];

  // Animate loading steps
  useEffect(() => {
    let interval;
    if (loading) {
      setCurrentStepIdx(0);
      const activeSteps = createdSessionId ? akSteps : steps;
      interval = setInterval(() => {
        setCurrentStepIdx((prev) => {
          if (prev < activeSteps.length - 2) {
            return prev + 1;
          }
          return prev;
        });
      }, 3000);
    } else {
      setCurrentStepIdx(0);
    }
    return () => clearInterval(interval);
  }, [loading, createdSessionId]);

  function handleDragOver(e, isAk = false) {
    e.preventDefault();
    if (isAk) setIsAkDragOver(true);
    else setIsDragOver(true);
  }

  function handleDragLeave(isAk = false) {
    if (isAk) setIsAkDragOver(false);
    else setIsDragOver(false);
  }

  function handleDrop(e, isAk = false) {
    e.preventDefault();
    setIsDragOver(false);
    setIsAkDragOver(false);
    setError("");

    if (loading) return;

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      if (isAk) validateAndSetAnswerKey(droppedFiles[0]);
      else validateAndSetFile(droppedFiles[0]);
    }
  }

  function handleFileSelect(e, isAk = false) {
    setError("");
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      if (isAk) validateAndSetAnswerKey(selectedFiles[0]);
      else validateAndSetFile(selectedFiles[0]);
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

  function validateAndSetAnswerKey(selectedFile) {
    if (selectedFile.type !== "application/pdf" && !selectedFile.name.endsWith(".pdf")) {
      setError("Only PDF files are supported");
      toast.error("Invalid file format. Please upload a PDF.");
      return;
    }
    setAnswerKeyFile(selectedFile);
  }

  function clearFile(isAk = false) {
    if (isAk) {
      setAnswerKeyFile(null);
      if (akInputRef.current) akInputRef.current.value = "";
    } else {
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleStartProcessing(e) {
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
      const durationSeconds = durationMinutes * 60;
      const resolvedSubject = subject === "CUSTOM" ? customSubject.trim() : subject;
      const config = {
        examDurationSeconds: durationSeconds,
        positiveMarks: positiveMarks,
        negativeMarks: negativeMarks,
        examName: examName.trim() || null,
        examStructure: "Standard MCQ",
        subject: resolvedSubject || null
      };

      const data = await uploadPractice(title.trim(), uploadType, file, config);

      if (uploadType === "QUESTION_AND_SEPARATE_ANSWER_KEY") {
        setCreatedSessionId(data.sessionId);
        setWizardStep(2);
        toast.success("Question paper processed! Please upload separate Answer Key PDF.");
      } else {
        toast.success("PDF parsed successfully! Mock test created.");
        resetForm();
        if (onUploadSuccess) onUploadSuccess(data);
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

  async function handleMergeAnswerKey(e) {
    e.preventDefault();
    setError("");

    if (!answerKeyFile) {
      setError("Please select or drop the separate Answer Key PDF");
      return;
    }

    setLoading(true);
    try {
      await uploadAnswerKey(createdSessionId, answerKeyFile);
      toast.success("Answer key merged successfully! Session ready.");
      resetForm();
      if (onUploadSuccess) onUploadSuccess();
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || "Failed to merge answer key. Please try again.";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setTitle("");
    setExamName("");
    setDurationMinutes(90);
    setPositiveMarks(4.0);
    setNegativeMarks(1.0);
    setUploadType("PDF_MOCK");
    setSubject("");
    setCustomSubject("");
    setFile(null);
    setAnswerKeyFile(null);
    setCreatedSessionId(null);
    setWizardStep(0);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (akInputRef.current) akInputRef.current.value = "";
  }

  return (
    <Card className="h-full flex flex-col justify-between hover:border-slate-600 transition-colors duration-300 relative group overflow-hidden min-h-[460px]">
      {/* Glow highlight */}
      <div className="absolute -inset-px bg-gradient-to-tr from-primary/5 to-cyan-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="relative z-10 flex-grow">
        <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-4">
          <h3 className="text-lg font-bold text-text font-outfit flex items-center gap-2">
            <Upload size={18} className="text-primary" />
            <span>Smart Upload Workflow</span>
          </h3>
          <div className="flex items-center space-x-1">
            <span className={`w-2 h-2 rounded-full ${wizardStep >= 0 ? "bg-primary" : "bg-border"}`} />
            <span className={`w-2 h-2 rounded-full ${wizardStep >= 1 ? "bg-primary" : "bg-border"}`} />
            <span className={`w-2 h-2 rounded-full ${wizardStep >= 2 ? "bg-primary" : "bg-border"}`} />
          </div>
        </div>

        {loading ? (
          /* Stepper visual animation display */
          <div className="py-6 space-y-6">
            <div className="flex items-center space-x-3.5 bg-slate-900/60 border border-border p-4 rounded-xl">
              <Spinner size="md" color="primary" />
              <div>
                <p className="text-sm font-bold text-text animate-pulse">
                  {createdSessionId ? "Answer Key Merger Running" : "AI Ingestion Engine Active"}
                </p>
                <p className="text-xs text-muted">Analyzing document layout and logic</p>
              </div>
            </div>

            {/* Steps checklists */}
            <div className="space-y-3 pl-2">
              {(createdSessionId ? akSteps : steps).map((step, idx) => {
                const isPassed = idx < currentStepIdx;
                const isCurrent = idx === currentStepIdx;

                return (
                  <div
                    key={step}
                    className={`flex items-center space-x-3 text-xs transition-colors duration-250 ${
                      isPassed ? "text-emerald-400 font-semibold" : isCurrent ? "text-text font-bold text-primary animate-pulse" : "text-muted"
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {isPassed ? (
                        <CheckCircle2 size={14} className="text-emerald-400" />
                      ) : (
                        <div
                          className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[9px] font-bold ${
                            isCurrent
                              ? "border-primary text-primary bg-primary/10"
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
          <div className="space-y-4">
            {/* Step 0: Upload Paper & Choose Key Type */}
            {wizardStep === 0 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div
                  onDragOver={(e) => handleDragOver(e)}
                  onDragLeave={() => handleDragLeave()}
                  onDrop={(e) => handleDrop(e)}
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
                    onChange={(e) => handleFileSelect(e)}
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
                    <div className="py-4 space-y-3">
                      <div className="mx-auto w-12 h-12 rounded-full bg-slate-900 border border-border flex items-center justify-center text-muted group-hover:text-primary transition-colors">
                        <Upload size={22} className="group-hover:scale-105 transition-transform" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-text">
                          Drag and drop Question Paper PDF here, or{" "}
                          <span className="text-primary hover:opacity-90">browse</span>
                        </p>
                        <p className="text-xs text-muted mt-1 font-medium">
                          PDF format files only (Max. 50MB)
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Key selection choice */}
                <div className="space-y-2 bg-slate-950 p-4 rounded-xl border border-border/30">
                  <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-2">Question Paper Configuration</p>
                  
                  <label className="flex items-start space-x-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="keyOption"
                      checked={uploadType === "PDF_MOCK"}
                      onChange={() => setUploadType("PDF_MOCK")}
                      className="mt-1 accent-primary"
                    />
                    <div className="text-left">
                      <p className="text-xs font-semibold text-text group-hover:text-primary transition-colors">
                        This PDF already contains the answer key
                      </p>
                      <p className="text-[10px] text-muted">
                        AI will attempt to parse questions and answers from a single document.
                      </p>
                    </div>
                  </label>

                  <div className="border-t border-border/30 my-2 pt-2" />

                  <label className="flex items-start space-x-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="keyOption"
                      checked={uploadType === "QUESTION_AND_SEPARATE_ANSWER_KEY"}
                      onChange={() => setUploadType("QUESTION_AND_SEPARATE_ANSWER_KEY")}
                      className="mt-1 accent-primary"
                    />
                    <div className="text-left">
                      <p className="text-xs font-semibold text-text group-hover:text-primary transition-colors">
                        I have a separate Answer Key PDF
                      </p>
                      <p className="text-[10px] text-muted">
                        Upload paper now. A screen to parse and merge the answer key will follow.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Step 1: Configurations */}
            {wizardStep === 1 && (
              <div className="space-y-4 animate-in slide-in-from-right-2 duration-200">
                {/* Title */}
                <div>
                  <label className="block mb-1 text-[10px] font-bold text-muted uppercase tracking-wider" htmlFor="conf-title">
                    Session Title
                  </label>
                  <input
                    id="conf-title"
                    type="text"
                    placeholder="e.g. Midterm Examination Paper"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border border-border bg-slate-900 rounded-xl p-3 text-xs transition-all focus:outline-none focus:border-primary text-text placeholder-muted"
                  />
                </div>

                {/* Exam Name */}
                <div>
                  <label className="block mb-1 text-[10px] font-bold text-muted uppercase tracking-wider" htmlFor="conf-name">
                    Exam Name / Board
                  </label>
                  <input
                    id="conf-name"
                    type="text"
                    placeholder="e.g. SAT, NEET, AP Chemistry"
                    value={examName}
                    onChange={(e) => setExamName(e.target.value)}
                    className="w-full border border-border bg-slate-900 rounded-xl p-3 text-xs transition-all focus:outline-none focus:border-primary text-text placeholder-muted"
                  />
                </div>

                {/* Subject Selection */}
                <div>
                  <label className="block mb-1 text-[10px] font-bold text-muted uppercase tracking-wider">
                    Subject Configuration
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full border border-border bg-slate-900 rounded-xl p-3 text-xs transition-all focus:outline-none focus:border-primary text-text cursor-pointer"
                  >
                    <option value="">Extract dynamically from PDF</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Biology">Biology</option>
                    <option value="History">History</option>
                    <option value="Geography">Geography</option>
                    <option value="Civics">Civics</option>
                    <option value="English">English</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="CUSTOM">Custom Subject (Define below)</option>
                  </select>
                </div>

                {/* Custom Subject Text Field (Conditional) */}
                {subject === "CUSTOM" && (
                  <div className="animate-in slide-in-from-top-1 duration-200">
                    <label className="block mb-1 text-[10px] font-bold text-muted uppercase tracking-wider" htmlFor="custom-subject">
                      Custom Subject Name
                    </label>
                    <input
                      id="custom-subject"
                      type="text"
                      placeholder="e.g. Organic Chemistry, French, Economics"
                      value={customSubject}
                      onChange={(e) => setCustomSubject(e.target.value)}
                      className="w-full border border-border bg-slate-900 rounded-xl p-3 text-xs transition-all focus:outline-none focus:border-primary text-text placeholder-muted"
                    />
                  </div>
                )}

                {/* Grid Inputs */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block mb-1 text-[9px] font-bold text-muted uppercase tracking-wider">
                      Timer (Mins)
                    </label>
                    <input
                      type="number"
                      value={durationMinutes}
                      min={10}
                      max={600}
                      onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 90)}
                      className="w-full border border-border bg-slate-900 rounded-xl p-3 text-xs text-center focus:outline-none focus:border-primary text-text"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-[9px] font-bold text-muted uppercase tracking-wider">
                      Correct (+)
                    </label>
                    <input
                      type="number"
                      step={0.5}
                      value={positiveMarks}
                      onChange={(e) => setPositiveMarks(parseFloat(e.target.value) || 4.0)}
                      className="w-full border border-border bg-slate-900 rounded-xl p-3 text-xs text-center focus:outline-none focus:border-primary text-text"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-[9px] font-bold text-muted uppercase tracking-wider">
                      Wrong (-)
                    </label>
                    <input
                      type="number"
                      step={0.5}
                      value={negativeMarks}
                      onChange={(e) => setNegativeMarks(parseFloat(e.target.value) || 0.0)}
                      className="w-full border border-border bg-slate-900 rounded-xl p-3 text-xs text-center focus:outline-none focus:border-primary text-text"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Upload Separate Answer Key */}
            {wizardStep === 2 && (
              <div className="space-y-4 animate-in slide-in-from-right-2 duration-200">
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-xs text-emerald-400 font-semibold flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>Question Paper extracted successfully.</span>
                </div>

                <div
                  onDragOver={(e) => handleDragOver(e, true)}
                  onDragLeave={() => handleDragLeave(true)}
                  onDrop={(e) => handleDrop(e, true)}
                  onClick={() => akInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
                    isAkDragOver
                      ? "border-primary bg-primary/5 scale-[0.99] opacity-90"
                      : answerKeyFile
                      ? "border-emerald-500/40 bg-emerald-500/5"
                      : "border-border hover:border-primary/50 hover:bg-slate-900/40"
                  }`}
                >
                  <input
                    type="file"
                    ref={akInputRef}
                    onChange={(e) => handleFileSelect(e, true)}
                    accept=".pdf"
                    className="hidden"
                  />

                  {answerKeyFile ? (
                    <div className="flex items-center justify-between p-3 bg-slate-900 border border-border rounded-xl">
                      <div className="flex items-center space-x-2.5 text-left truncate">
                        <FileSpreadsheet className="text-emerald-400 flex-shrink-0" size={24} />
                        <div className="truncate">
                          <p className="text-sm font-bold text-text truncate">
                            {answerKeyFile.name}
                          </p>
                          <p className="text-xs text-muted font-medium">
                            {formatBytes(answerKeyFile.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearFile(true);
                        }}
                        className="p-1.5 hover:bg-slate-800 rounded-lg text-muted hover:text-text transition-colors cursor-pointer"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="py-4 space-y-3">
                      <div className="mx-auto w-12 h-12 rounded-full bg-slate-900 border border-border flex items-center justify-center text-muted group-hover:text-primary transition-colors">
                        <Upload size={22} className="group-hover:scale-105 transition-transform" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-text">
                          Upload Answer Key PDF here, or{" "}
                          <span className="text-primary hover:opacity-90">browse</span>
                        </p>
                        <p className="text-xs text-muted mt-1 font-medium">
                          PDF format files containing options sheet only
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex items-start space-x-2 text-danger p-3 bg-danger/10 rounded-xl border border-danger/20 text-xs font-semibold animate-in slide-in-from-top-1 duration-200">
                <ShieldAlert size={14} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {!loading && (
        <div className="mt-6 flex items-center gap-3">
          {wizardStep === 0 && (
            <Button
              onClick={() => setWizardStep(1)}
              disabled={!file}
              className="w-full py-3.5 flex items-center justify-center gap-2"
            >
              <span>Configure Exam Details</span>
              <ChevronRight size={14} />
            </Button>
          )}

          {wizardStep === 1 && (
            <>
              <Button
                variant="outline"
                onClick={() => setWizardStep(0)}
                className="w-1/3 py-3.5 flex items-center justify-center gap-1.5 border-border hover:bg-slate-850"
              >
                <ChevronLeft size={14} />
                <span>Back</span>
              </Button>
              <Button
                onClick={handleStartProcessing}
                disabled={!title.trim()}
                className="w-2/3 py-3.5 flex items-center justify-center gap-2"
              >
                <span>Start AI Ingestion</span>
              </Button>
            </>
          )}

          {wizardStep === 2 && (
            <Button
              onClick={handleMergeAnswerKey}
              disabled={!answerKeyFile}
              className="w-full py-3.5 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500"
            >
              <span>Merge & Complete Session</span>
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}

export default UploadZone;
