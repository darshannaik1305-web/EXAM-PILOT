import Container from "../common/Container";
import SectionHeader from "../common/SectionHeader";
import { CheckCircle2, AlertTriangle, Zap, Percent, ShieldCheck, Award } from "lucide-react";

function AnalyticsPreviewSection() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <Container>
        <SectionHeader
          badge="Diagnostics Preview"
          title="Metrics That Direct Your Practice"
          description="See exactly where you stand. Our dashboard monitors accuracy, solving speeds, and mastery trends."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Card 1: Accuracy & Score */}
          <div className="p-6 sm:p-8 rounded-2xl border border-slate-100 bg-slate-50/50 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Percent size={20} />
              </div>
              <h4 className="font-bold text-slate-800">Accuracy & Score Index</h4>
            </div>

            <div className="flex items-end justify-between mb-4">
              <span className="text-4xl font-extrabold text-slate-900 font-outfit">78%</span>
              <span className="text-sm font-semibold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">+4.2% this week</span>
            </div>

            {/* Simulated progress circle */}
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full rounded-full" style={{ width: "78%" }}></div>
            </div>
            <p className="mt-4 text-xs text-slate-500">Cumulative average accuracy score across 14 practice mock tests.</p>
          </div>

          {/* Card 2: Solve Velocity (Speed) */}
          <div className="p-6 sm:p-8 rounded-2xl border border-slate-100 bg-slate-50/50 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-violet-50 text-violet-600 rounded-xl">
                <Zap size={20} />
              </div>
              <h4 className="font-bold text-slate-800">Solving Velocity</h4>
            </div>

            <div className="flex items-end justify-between mb-4">
              <span className="text-4xl font-extrabold text-slate-900 font-outfit">1.2m</span>
              <span className="text-sm font-semibold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">-12s target gap</span>
            </div>

            {/* Pacing bar visual */}
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-violet-500 to-cyan-500 h-full rounded-full" style={{ width: "85%" }}></div>
            </div>
            <p className="mt-4 text-xs text-slate-500">Average time spent per question. Target velocity is 1.0 minutes.</p>
          </div>

          {/* Card 3: AI Predicted Score */}
          <div className="p-6 sm:p-8 rounded-2xl border border-slate-100 bg-slate-50/50 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-cyan-50 text-cyan-600 rounded-xl">
                <Award size={20} />
              </div>
              <h4 className="font-bold text-slate-800">Estimated AI Score</h4>
            </div>

            <div className="flex items-end justify-between mb-4">
              <span className="text-4xl font-extrabold text-slate-900 font-outfit">242<span className="text-lg font-medium text-slate-500">/300</span></span>
              <span className="text-sm font-semibold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">Top 4% bracket</span>
            </div>

            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-full rounded-full" style={{ width: "80%" }}></div>
            </div>
            <p className="mt-4 text-xs text-slate-500">Projected competitive score range based on active mock performance tags.</p>
          </div>

          {/* Card 4: Strong Topics Mastery */}
          <div className="p-6 sm:p-8 rounded-2xl border border-slate-100 bg-slate-50/50 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <CheckCircle2 size={20} />
              </div>
              <h4 className="font-bold text-slate-800">Strong Topics (Mastered)</h4>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-700 font-medium">Physics ➔ Kinematics</span>
                <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-lg text-xs">88% Accuracy</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-700 font-medium">Chemistry ➔ Thermodynamics</span>
                <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-lg text-xs">82% Accuracy</span>
              </div>
            </div>
            <p className="mt-6 text-xs text-slate-500">Topics displaying high accuracy ratings across successive test simulations.</p>
          </div>

          {/* Card 5: Weak Topics Alerts */}
          <div className="p-6 sm:p-8 rounded-2xl border border-slate-100 bg-slate-50/50 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                <AlertTriangle size={20} />
              </div>
              <h4 className="font-bold text-slate-800">Weak Topics (Flagged)</h4>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-700 font-medium">Math ➔ Integration Bounds</span>
                <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-lg text-xs">48% Accuracy</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-700 font-medium">Physics ➔ Coulomb's Law</span>
                <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-lg text-xs">42% Accuracy</span>
              </div>
            </div>
            <p className="mt-6 text-xs text-slate-500">Areas prioritized for revision. Suggested mini-quizzes will target these tags.</p>
          </div>

          {/* Card 6: Study Progress Tracker */}
          <div className="p-6 sm:p-8 rounded-2xl border border-slate-100 bg-slate-50/50 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-slate-100 text-slate-600 rounded-xl">
                <ShieldCheck size={20} />
              </div>
              <h4 className="font-bold text-slate-800">Study Progress</h4>
            </div>

            <div className="flex items-end justify-between mb-4">
              <span className="text-4xl font-extrabold text-slate-900 font-outfit">18</span>
              <span className="text-sm font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">Papers Completed</span>
            </div>

            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-slate-600 h-full rounded-full" style={{ width: "60%" }}></div>
            </div>
            <p className="mt-4 text-xs text-slate-500">Overall syllabus completion rating across active practice target milestones.</p>
          </div>
        </div>
      </Container>
    </section>
  );
}

export default AnalyticsPreviewSection;
