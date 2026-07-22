import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  BrainCircuit,
  CheckCircle2,
  ClipboardList,
  FileText,
  Gauge,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  Video,
} from "lucide-react";
import heroImage from "../assets/hero.png";

const STATS = [
  { label: "Input Types", value: "Video + Photos" },
  { label: "Evidence", value: "Frame-Level" },
  { label: "Turnaround", value: "Minutes" },
];

const FEATURES = [
  {
    icon: Video,
    title: "Automated Visual Analysis",
    description:
      "Every frame is scanned for hazards — trip risks, PPE gaps, blocked exits — tied to an exact video timestamp.",
  },
  {
    icon: ClipboardList,
    title: "Structured Compliance Questionnaire",
    description:
      "Access & egress, housekeeping, PPE, and equipment sections are answered automatically with confidence scores.",
  },
  {
    icon: Gauge,
    title: "Severity-Ranked Findings",
    description:
      "Issues are triaged Low to Critical with recommended corrective actions and remediation timescales.",
  },
  {
    icon: FileText,
    title: "Executive Narrative Reports",
    description:
      "A human-readable summary you can hand straight to leadership.",
  },
];

const STEPS = [
  {
    icon: UploadCloud,
    title: "Upload the Walkthrough",
    description:
      "Drop in a video (.mp4, .mov, .webm) or a batch of site photos — whichever your team captured.",
  },
  {
    icon: BrainCircuit,
    title: "AI analyzes the video",
    description:
      "AI vision extracts observations and cross-references your safety questionnaire.",
  },
  {
    icon: CheckCircle2,
    title: "Review & Act",
    description:
      "Jump straight to evidence in the timestamp-synced player and export findings for your team.",
  },
];

function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[36rem] w-[52rem] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-violet-600/15 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-[40rem] bg-grid" />
      </div>

      <div className="relative">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-white">
              SecureSite
            </span>
          </div>
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-white/20 hover:bg-white/10"
          >
            Launch Dashboard
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </nav>

        <header className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 px-6 pt-16 pb-28 lg:grid-cols-[1.1fr_0.9fr] lg:pt-20">
          <div className="animate-fade-in-up">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3.5 py-1.5 text-xs font-medium text-indigo-300">
              <Sparkles className="h-3.5 w-3.5" />
              AI-Powered Compliance, Not Guesswork
            </div>

            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Turn walkthrough footage into{" "}
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                actionable safety audits
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-400">
              Upload a hospital walkthrough video and let AI vision surface hazards, answer
              your compliance questionnaire, and generate an executive-ready report in minutes.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                to="/dashboard"
                className="group flex items-center gap-2 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Start Your Audit
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <span className="text-sm text-slate-500">
                No setup needed — start your first audit right away.
              </span>
            </div>

            <dl className="mt-16 grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4">
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <dt className="text-2xl font-semibold text-white">{stat.value}</dt>
                  <dd className="mt-1 text-xs tracking-wide text-slate-500 uppercase">
                    {stat.label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <div className="animate-float relative">
              <div className="absolute inset-0 -z-10 rounded-full bg-violet-500/20 blur-3xl" />
              <img
                src={heroImage}
                alt=""
                className="w-64 drop-shadow-2xl sm:w-80"
              />
            </div>

            <div className="absolute -bottom-4 -left-4 hidden w-56 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md shadow-2xl sm:block">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                <Gauge className="h-4 w-4 text-amber-400" />
                Critical Finding
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Trailing cable across corridor exit path — 00:12
              </p>
            </div>
          </div>
        </header>

        <section className="mx-auto max-w-6xl px-6 pb-28">
          <div className="mb-12 max-w-xl">
            <p className="text-slate-400">
              One upload produces a complete, evidence-backed audit trail — no manual review of
              raw footage required.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-indigo-400/30 hover:bg-white/[0.06]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 text-indigo-300 transition-colors group-hover:from-indigo-500/30 group-hover:to-violet-500/30">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold text-white">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-28">
          <div className="mb-12 max-w-xl">
            <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              From footage to findings in three steps
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {STEPS.map((step, index) => (
              <div key={step.title} className="relative">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-indigo-300">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium text-slate-600">
                    STEP {index + 1}
                  </span>
                </div>
                <h3 className="mt-4 font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-600/20 via-violet-600/10 to-transparent px-8 py-14 text-center sm:px-16">
            <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
            <h2 className="relative text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Ready to run your first audit?
            </h2>
            <p className="relative mx-auto mt-3 max-w-md text-slate-400">
              Head into the dashboard, upload a walkthrough video, and get a full compliance
              report back in minutes.
            </p>
            <Link
              to="/dashboard"
              className="relative mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Start Your Audit
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <footer className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-6 pb-12 text-center">
          <div className="flex items-center gap-2 text-slate-500">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-base font-medium">SecureSite</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default LandingPage;
