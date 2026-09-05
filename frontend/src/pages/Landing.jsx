import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  AudioLines,
  BookOpenText,
  Check,
  ChevronRight,
  Image,
  LibraryBig,
  Mic2,
  Music2,
  Play,
  ScanLine,
  Sparkles,
  WandSparkles,
} from "lucide-react";

const reveal = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut" },
  },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const features = [
  {
    icon: WandSparkles,
    number: "01",
    title: "AI Visuals",
    description:
      "Turn a loose idea into story-ready scenes, characters, and worlds.",
    accent: "text-cyan-300",
  },
  {
    icon: BookOpenText,
    number: "02",
    title: "Dialogue Studio",
    description:
      "Split a script into clean, character-wise lines ready for voice.",
    accent: "text-orange-300",
  },
  {
    icon: AudioLines,
    number: "03",
    title: "Voice & Sound",
    description:
      "Give every scene a voice, then layer in music and sound effects.",
    accent: "text-lime-300",
  },
  {
    icon: ScanLine,
    number: "04",
    title: "Enhance",
    description: "Polish existing artwork with a sharper, more finished look.",
    accent: "text-fuchsia-300",
  },
];

const workflow = [
  { label: "Write", icon: BookOpenText },
  { label: "Separate", icon: AudioLines },
  { label: "Visualize", icon: Image },
  { label: "Voice", icon: Mic2 },
  { label: "Score", icon: Music2 },
];

const floatingTools = [
  {
    label: "Dialogue",
    icon: AudioLines,
    position: "left-0 top-10",
    color: "text-orange-300",
  },
  {
    label: "Enhance",
    icon: ScanLine,
    position: "right-0 top-32",
    color: "text-cyan-300",
  },
  {
    label: "Voice",
    icon: Mic2,
    position: "left-8 bottom-12",
    color: "text-lime-300",
  },
  {
    label: "SFX + BGM",
    icon: Music2,
    position: "right-4 bottom-6",
    color: "text-fuchsia-300",
  },
];

const Landing = () => {
  const navigate = useNavigate();
  const goToApp = () => navigate("/home");

  return (
    <div className="min-h-screen overflow-hidden bg-[#080b12] text-white selection:bg-orange-300 selection:text-[#080b12]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_80%_8%,rgba(31,211,229,0.13),transparent_27%),radial-gradient(circle_at_12%_40%,rgba(255,117,72,0.09),transparent_25%)]" />
      <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#080b12]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between px-5 sm:px-8">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="group flex items-center gap-2.5"
            aria-label="Toonza home"
          >
            <img
              src="/logo.png"
              alt="Toonza logo"
              className="h-10 w-10 object-contain transition group-hover:rotate-6"
              width="40"
              height="40"
            />
            <span className="font-serif text-xl font-bold tracking-[0.18em]">
              TOONZA
            </span>
          </button>
          <nav className="hidden items-center gap-8 text-sm text-slate-400 md:flex">
            <a href="#workflow" className="transition hover:text-white">
              Workflow
            </a>
            <a href="#features" className="transition hover:text-white">
              Tools
            </a>
            <a href="#assets" className="transition hover:text-white">
              Creator assets
            </a>
            <button
              onClick={() => navigate("/app/pricing")}
              className="transition hover:text-white"
            >
              Pricing
            </button>
          </nav>
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => navigate("/login")}
              className="hidden text-sm text-slate-300 transition hover:text-white sm:block"
            >
              Sign in
            </button>
            <button
              onClick={goToApp}
              className="group flex items-center gap-2 rounded-full bg-orange-300 px-4 py-2.5 text-sm font-semibold text-[#080b12] transition hover:bg-orange-200"
            >
              Get started{" "}
              <ArrowUpRight
                size={16}
                className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </button>
          </div>
        </div>
      </header>

      <main className="relative">
        <section className="mx-auto grid min-h-[calc(100vh-4.5rem)] max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8 lg:py-20">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="relative z-10 max-w-2xl"
          >
            <motion.div
              variants={reveal}
              className="mb-7 inline-flex items-center gap-2 rounded-full border border-orange-200/20 bg-orange-200/[0.07] px-3.5 py-2 text-xs font-medium uppercase tracking-[0.16em] text-orange-200"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-orange-300 shadow-[0_0_9px_#ff9966]" />{" "}
              Built for storytellers
            </motion.div>
            <motion.h1
              variants={reveal}
              className="font-serif text-[3.7rem] font-semibold leading-[0.98] tracking-tight text-slate-50 sm:text-7xl lg:text-[5.6rem]"
            >
              Your story has a{" "}
              <span className="italic text-orange-300">world</span> in it.
            </motion.h1>
            <motion.p
              variants={reveal}
              className="mt-7 max-w-xl text-base leading-7 text-slate-400 sm:text-lg"
            >
              Toonza is the creative workspace for turning scripts, characters,
              and rough ideas into scenes people can see, hear, and remember.
            </motion.p>
            <motion.div
              variants={reveal}
              className="mt-9 flex flex-col gap-3 sm:flex-row"
            >
              <button
                onClick={goToApp}
                className="group flex items-center justify-center gap-3 rounded-full bg-orange-300 px-6 py-3.5 font-semibold text-[#080b12] transition hover:bg-orange-200"
              >
                Start creating{" "}
                <ArrowRight
                  size={18}
                  className="transition group-hover:translate-x-1"
                />
              </button>
              <a
                href="#workflow"
                className="flex items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3.5 text-sm font-medium text-slate-200 transition hover:border-white/35 hover:bg-white/[0.04]"
              >
                <Play size={15} fill="currentColor" /> See the workflow
              </a>
            </motion.div>
            <motion.div
              variants={reveal}
              className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500"
            >
              {["Image generation", "Dialogue separation", "Browser voice"].map(
                (item) => (
                  <span key={item} className="flex items-center gap-2">
                    <Check size={14} className="text-lime-300" /> {item}
                  </span>
                ),
              )}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="relative mx-auto w-full max-w-[42rem] lg:ml-auto"
          >
            <div className="absolute -inset-10 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="relative overflow-visible rounded-[2rem] border border-white/15 bg-[#101621]/90 p-2 shadow-2xl shadow-black/40 sm:p-3">
              <div className="relative aspect-[0.92] overflow-hidden rounded-[1.4rem] bg-[#0c1119] sm:aspect-[1.08]">
                <img
                  src="/image3.png"
                  alt="Generated astronaut story scene"
                  className="h-full w-full object-cover object-center opacity-90"
                  width="1024"
                  height="1229"
                  fetchPriority="high"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080b12] via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4 sm:bottom-7 sm:left-7 sm:right-7">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-orange-200">
                      Scene 04 / The last signal
                    </p>
                    <p className="mt-1 font-serif text-xl italic sm:text-2xl">
                      A new world begins here.
                    </p>
                  </div>
                  <span className="hidden rounded-full border border-white/20 bg-black/30 px-3 py-1.5 text-xs text-slate-300 backdrop-blur sm:block">
                    Generated visual
                  </span>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 py-3 text-xs text-slate-400 sm:px-4">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-lime-300" />{" "}
                  Storyboard synced
                </span>
                <span>4 of 6 steps complete</span>
              </div>
            </div>
            {floatingTools.map(
              ({ label, icon: Icon, position, color }, index) => (
                <motion.div
                  key={label}
                  animate={{ y: [0, index % 2 ? -7 : 7, 0] }}
                  transition={{
                    duration: 4 + index * 0.4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className={`absolute ${position} hidden items-center gap-2 rounded-xl border border-white/15 bg-[#151c28]/95 px-3 py-2 text-xs font-medium text-slate-200 shadow-xl shadow-black/30 backdrop-blur sm:flex`}
                >
                  <Icon size={15} className={color} /> {label}
                </motion.div>
              ),
            )}
          </motion.div>
        </section>

        <section
          id="workflow"
          className="border-y border-white/[0.08] bg-white/[0.018]"
        >
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.25 }}
              variants={stagger}
            >
              <motion.p
                variants={reveal}
                className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-300"
              >
                The creator loop
              </motion.p>
              <motion.div
                variants={reveal}
                className="mt-4 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"
              >
                <h2 className="max-w-xl font-serif text-4xl leading-tight sm:text-5xl">
                  From a blank page to a{" "}
                  <span className="italic text-cyan-300">living</span> story.
                </h2>
                <p className="max-w-sm text-sm leading-6 text-slate-500">
                  A connected flow for the messy, magical middle between an idea
                  and a finished post.
                </p>
              </motion.div>
              <div className="mt-12 grid gap-3 md:grid-cols-5">
                {workflow.map(({ label, icon: Icon }, index) => (
                  <motion.div
                    variants={reveal}
                    key={label}
                    className="relative flex items-center gap-3 rounded-xl border border-white/10 bg-[#101621] p-4 md:block md:p-5"
                  >
                    <span className="text-xs text-slate-600">0{index + 1}</span>
                    <Icon className="h-5 w-5 text-orange-300 md:mt-10" />
                    <p className="text-sm font-medium text-slate-200 md:mt-4">
                      {label}
                    </p>
                    {index < workflow.length - 1 && (
                      <ChevronRight
                        size={16}
                        className="absolute right-3 text-slate-700 md:-right-5 md:top-1/2"
                      />
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <section
          id="features"
          className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28"
        >
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
          >
            <motion.div variants={reveal} className="max-w-2xl">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-orange-300">
                One workspace, many ways to make
              </p>
              <h2 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
                The tools behind your next{" "}
                <span className="italic text-orange-300">favorite</span> scene.
              </h2>
            </motion.div>
            <div className="mt-12 grid gap-4 sm:grid-cols-2">
              {features.map(
                ({ icon: Icon, number, title, description, accent }) => (
                  <motion.article
                    variants={reveal}
                    whileHover={{ y: -5 }}
                    key={title}
                    className="group rounded-2xl border border-white/10 bg-[#101621] p-6 transition-colors hover:border-white/20 sm:p-8"
                  >
                    <div className="flex items-start justify-between">
                      <Icon className={`h-7 w-7 ${accent}`} />
                      <span className="font-mono text-xs text-slate-600">
                        {number}
                      </span>
                    </div>
                    <h3 className="mt-14 font-serif text-2xl">{title}</h3>
                    <p className="mt-3 max-w-sm text-sm leading-6 text-slate-500">
                      {description}
                    </p>
                    <ArrowUpRight
                      className="mt-8 text-slate-600 transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-white"
                      size={19}
                    />
                  </motion.article>
                ),
              )}
            </div>
          </motion.div>
        </section>

        <section
          id="assets"
          className="mx-auto max-w-7xl px-5 pb-20 sm:px-8 sm:pb-28"
        >
          <div className="grid overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#121a24] lg:grid-cols-[1fr_0.9fr]">
            <div className="p-7 sm:p-12">
              <LibraryBig className="h-8 w-8 text-lime-300" />
              <h2 className="mt-10 max-w-md font-serif text-4xl leading-tight sm:text-5xl">
                The details make the world feel{" "}
                <span className="italic text-lime-300">real.</span>
              </h2>
              <p className="mt-5 max-w-md text-sm leading-6 text-slate-400">
                Keep your creative momentum with backgrounds, BGM, and SFX ready
                when the scene calls for them.
              </p>
              <button
                onClick={goToApp}
                className="mt-8 flex items-center gap-2 text-sm font-semibold text-lime-300 transition hover:text-lime-200"
              >
                Explore the creator library <ArrowRight size={16} />
              </button>
            </div>
            <div className="relative min-h-[19rem] overflow-hidden border-t border-white/10 lg:border-l lg:border-t-0">
              <img
                src="/sample.jpg"
                alt="Creator workspace atmosphere"
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover opacity-40 grayscale-[0.2]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#121a24] via-[#121a24]/30 to-transparent" />
              <div className="absolute bottom-6 left-6 grid grid-cols-2 gap-2 sm:left-10">
                <span className="flex items-center gap-2 rounded-lg border border-white/15 bg-[#101621]/90 px-3 py-2 text-xs text-slate-300">
                  <Music2 size={14} className="text-orange-300" /> Ambient BGM
                </span>
                <span className="flex items-center gap-2 rounded-lg border border-white/15 bg-[#101621]/90 px-3 py-2 text-xs text-slate-300">
                  <Sparkles size={14} className="text-cyan-300" /> Scene FX
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-white/[0.08] px-5 py-20 text-center sm:px-8 sm:py-28">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-300">
            Make the idea tangible
          </p>
          <h2 className="mx-auto mt-5 max-w-3xl font-serif text-5xl leading-[0.98] sm:text-7xl">
            The next story you tell starts with{" "}
            <span className="italic text-orange-300">you.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-sm leading-6 text-slate-500">
            Bring the rough draft. Toonza helps you shape the rest.
          </p>
          <button
            onClick={goToApp}
            className="group mt-9 inline-flex items-center gap-3 rounded-full bg-orange-300 px-6 py-3.5 font-semibold text-[#080b12] transition hover:bg-orange-200"
          >
            Enter the studio{" "}
            <ArrowRight
              size={18}
              className="transition group-hover:translate-x-1"
            />
          </button>
        </section>
      </main>

      <footer className="border-t border-white/[0.08] px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 text-xs text-slate-500 sm:flex-row sm:items-center">
          <span className="font-serif text-base tracking-[0.16em] text-slate-300">
            TOONZA
          </span>
          <div className="flex flex-wrap gap-5">
            <a href="#features" className="transition hover:text-white">
              Tools
            </a>
            <a href="#workflow" className="transition hover:text-white">
              Workflow
            </a>
            <button
              onClick={() => navigate("/app/pricing")}
              className="transition hover:text-white"
            >
              Pricing
            </button>
            <span>© {new Date().getFullYear()} Toonza</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
