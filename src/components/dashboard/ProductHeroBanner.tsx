import React from 'react';
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Cpu,
  Leaf,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface ProductHeroBannerProps {
  onOpenWorkloadDemo: () => void;
  onOpenArchitecture: () => void;
}

const flow = [
  { label: 'Renewable surplus', detail: 'Energy and grid signals', icon: Zap },
  { label: 'REGEN-X', detail: 'Forecast and workload placement', icon: ArrowRight },
  { label: 'Flexible AI jobs', detail: 'Compute at eligible partner sites', icon: Cpu },
  { label: 'Measured outcomes', detail: 'Cost and carbon records', icon: ShieldCheck },
];

const steps = [
  {
    number: '01',
    title: 'Forecast availability',
    description: 'Identify when and where renewable generation may exceed grid demand.',
    icon: Leaf,
  },
  {
    number: '02',
    title: 'Match eligible workloads',
    description: 'Compare energy, compute capacity, latency, and workload constraints before placement.',
    icon: Cpu,
  },
  {
    number: '03',
    title: 'Record the outcome',
    description: 'Capture placement and impact data for review; real-world verification depends on trusted source data.',
    icon: ShieldCheck,
  },
];

const operatingModel = [
  {
    title: 'Energy access',
    description: 'Renewable generators or market operators provide availability and curtailment signals. REGEN-X does not own or deliver electricity.',
  },
  {
    title: 'Compute supply',
    description: 'Independent compute providers host capacity near renewable-rich regions. Workloads must be flexible enough to run there.',
  },
  {
    title: 'Commercial value',
    description: 'AI customers pay for compute and orchestration. A software fee or savings-share model is a hypothesis to validate with customers and partners.',
  },
];

export const ProductHeroBanner: React.FC<ProductHeroBannerProps> = ({
  onOpenWorkloadDemo,
  onOpenArchitecture,
}) => (
  <div className="space-y-10">
    <section className="relative isolate overflow-hidden rounded-[28px] border border-slate-800 bg-[#0a101b] px-6 py-8 shadow-2xl sm:px-10 sm:py-12">
      <div className="pointer-events-none absolute -right-20 -top-24 -z-10 h-80 w-80 rounded-full bg-emerald-500/[0.08] blur-3xl" />
      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Renewable-aware compute orchestration
          </div>
          <h1 className="max-w-3xl text-4xl font-semibold leading-[1.08] tracking-[-0.045em] text-white sm:text-5xl lg:text-[3.5rem]">
            Turn renewable energy surplus into useful AI compute.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            REGEN-X explores how flexible AI workloads could be matched with compute capacity near periods of renewable surplus—helping customers evaluate cost, location, and carbon impact together.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <button
              onClick={onOpenWorkloadDemo}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300"
            >
              Explore workload routing
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={onOpenArchitecture}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
            >
              See how it could work
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-4 text-xs leading-5 text-slate-500">
            Concept-stage prototype. The routing workspace uses illustrative data; no live utility feed or signed commercial partnership is represented.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/75 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-white">From surplus signal to workload placement</div>
              <div className="mt-1 text-xs text-slate-500">Illustrative operating flow</div>
            </div>
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-2 text-emerald-300">
              <Zap className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-6 space-y-2">
            {flow.map(({ label, detail, icon: Icon }, index) => (
              <React.Fragment key={label}>
                <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${index === 1 ? 'bg-emerald-500/15 text-emerald-300' : 'bg-slate-800 text-slate-300'}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{label}</div>
                    <div className="mt-0.5 text-xs text-slate-400">{detail}</div>
                  </div>
                </div>
                {index < flow.length - 1 && (
                  <div className="ml-7 h-3 border-l border-slate-700" aria-hidden="true">
                    <ArrowDown className="relative -left-[7px] top-1 h-3.5 w-3.5 text-slate-600" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>

    <section aria-labelledby="how-it-works-heading">
      <div className="mb-5 max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">The product idea</p>
        <h2 id="how-it-works-heading" className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          One orchestration layer. Three decisions.
        </h2>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {steps.map(({ number, title, description, icon: Icon }) => (
          <article key={number} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-500">{number}</span>
              <Icon className="h-4 w-4 text-emerald-300" />
            </div>
            <h3 className="mt-5 text-base font-semibold text-white">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
          </article>
        ))}
      </div>
    </section>

    <section className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 sm:p-7" aria-labelledby="operating-model-heading">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">The operating model</p>
        <h2 id="operating-model-heading" className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Built around partners—not owned power plants.
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          The concept depends on coordinating three parties. Its commercial case is not proven until access, service levels, and unit economics are validated with them.
        </p>
      </div>
      <div className="mt-6 grid gap-3 lg:grid-cols-3">
        {operatingModel.map((item) => (
          <article key={item.title} className="border-t border-slate-700 pt-4">
            <h3 className="text-sm font-semibold text-white">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">{item.description}</p>
          </article>
        ))}
      </div>
      <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] p-4">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
        <p className="text-xs leading-5 text-slate-300">
          <span className="font-semibold text-amber-200">What remains to prove:</span> contracted renewable and compute access, dependable grid and energy data, workload portability, regional compliance, and positive customer economics after infrastructure and transfer costs.
        </p>
      </div>
    </section>
  </div>
);
