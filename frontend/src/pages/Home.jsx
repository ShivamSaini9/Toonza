import {
  ArrowRight,
  AudioLines,
  Image as ImageIcon,
  Library,
  Mic2,
  ScanLine,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Community from "../components/Community";
import { useAuth } from "../auth/AuthContext";

const tools = [
  {
    title: "Generate a scene",
    description: "Turn a visual idea into a story-ready image.",
    route: "/app/image-generation",
    icon: ImageIcon,
    accent: "from-violet-500/20 to-cyan-500/5",
    iconColor: "text-cyan-300",
    label: "Visuals",
  },
  {
    title: "Separate dialogue",
    description: "Break a script into clean character lines.",
    route: "/app/dialogue-separator",
    icon: AudioLines,
    accent: "from-orange-500/20 to-rose-500/5",
    iconColor: "text-orange-300",
    label: "Script",
  },
  {
    title: "Create a voice",
    description: "Give your words a voice in multiple languages.",
    route: "/app/voice-generation",
    icon: Mic2,
    accent: "from-lime-500/15 to-emerald-500/5",
    iconColor: "text-lime-300",
    label: "Audio",
  },
  {
    title: "Enhance an image",
    description: "Polish your artwork before it goes live.",
    route: "/app/image-enhancer",
    icon: ScanLine,
    accent: "from-fuchsia-500/15 to-violet-500/5",
    iconColor: "text-fuchsia-300",
    label: "Polish",
  },
];

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const firstName = user?.fullName?.split(" ")[0] || "Creator";

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#080b12] text-white">
      <div className="pointer-events-none absolute right-0 top-0 h-[32rem] w-[32rem] rounded-full bg-cyan-500/[0.07] blur-3xl" />
      <div className="pointer-events-none absolute left-1/3 top-[38rem] h-[24rem] w-[24rem] rounded-full bg-violet-500/[0.05] blur-3xl" />

      <main className="relative mx-auto max-w-7xl space-y-10 px-1 pb-12 sm:space-y-14">
        <section className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#101621] px-6 py-8 shadow-2xl shadow-black/20 sm:px-10 sm:py-11">
          <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-cyan-400/[0.10] to-transparent" />
          <div className="absolute -right-12 -top-20 h-64 w-64 rounded-full border border-cyan-300/10" />
          <div className="relative z-10 max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/[0.06] px-3 py-1.5 text-xs uppercase tracking-[0.16em] text-cyan-200">
              <Sparkles size={14} /> Your studio is ready
            </div>
            <h1 className="font-serif text-4xl leading-[1.02] sm:text-6xl">
              Good to see you,{" "}
              <span className="italic text-cyan-300">{firstName}.</span>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
              What are you making today? Start with a rough thought and shape it
              into something people can see, hear, and share.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button
                onClick={() => navigate("/app/image-generation")}
                className="group flex items-center gap-2 rounded-xl bg-cyan-300 px-4 py-3 text-sm font-semibold text-[#080b12] transition hover:bg-cyan-200"
              >
                Start a new creation{" "}
                <ArrowRight
                  size={17}
                  className="transition group-hover:translate-x-1"
                />
              </button>
              <button
                onClick={() => navigate("/app/asset-library")}
                className="flex items-center gap-2 rounded-xl border border-white/15 px-4 py-3 text-sm text-slate-200 transition hover:border-white/30 hover:bg-white/[0.04]"
              >
                <Library size={16} /> Browse assets
              </button>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-orange-300">
                Choose your next move
              </p>
              <h2 className="mt-2 font-serif text-3xl sm:text-4xl">
                Make something tangible.
              </h2>
            </div>
            <span className="hidden text-xs text-slate-500 sm:block">
              Your creative toolkit
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {tools.map((tool) => {
              const ToolIcon = tool.icon;
              return (
                <button
                  key={tool.route}
                  onClick={() => navigate(tool.route)}
                  className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${tool.accent} bg-[#101621] p-5 text-left transition hover:-translate-y-1 hover:border-white/25`}
                >
                  <div className="flex items-start justify-between">
                    <span
                      className={`grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-black/20 ${tool.iconColor}`}
                    >
                      <ToolIcon size={20} />
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                      {tool.label}
                    </span>
                  </div>
                  <h3 className="mt-9 text-base font-semibold text-slate-100">
                    {tool.title}
                  </h3>
                  <p className="mt-2 min-h-10 text-xs leading-5 text-slate-500">
                    {tool.description}
                  </p>
                  <ArrowRight
                    size={17}
                    className="mt-5 text-slate-600 transition group-hover:translate-x-1 group-hover:text-white"
                  />
                </button>
              );
            })}
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#101621] p-6 sm:p-8">
            <div className="relative z-10 max-w-md">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-violet-300">
                <AudioLines size={15} /> A smoother workflow
              </div>
              <h2 className="mt-5 font-serif text-3xl leading-tight sm:text-4xl">
                Your idea does not need to arrive finished.
              </h2>
              <p className="mt-4 text-sm leading-6 text-slate-500">
                Write the line. Find the image. Add the voice. Toonza keeps the
                small steps close so you can stay inside the story.
              </p>
              <button
                onClick={() => navigate("/app/dialogue-separator")}
                className="mt-7 flex items-center gap-2 text-sm font-semibold text-violet-300 transition hover:text-white"
              >
                Open dialogue tools <ArrowRight size={16} />
              </button>
            </div>
            <div className="pointer-events-none absolute bottom-0 right-0 h-40 w-40 rounded-full bg-violet-400/[0.08] blur-3xl" />
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#101621] p-6 sm:p-8">
            <Library size={25} className="text-lime-300" />
            <h3 className="mt-8 font-serif text-2xl">
              Need a little atmosphere?
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Browse backgrounds, music, and sound effects for the scene in your
              head.
            </p>
            <button
              onClick={() => navigate("/app/asset-library")}
              className="mt-6 flex items-center gap-2 text-sm font-semibold text-lime-300 transition hover:text-white"
            >
              Explore library <ArrowRight size={16} />
            </button>
          </div>
        </section>

        <section>
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">
                From the community
              </p>
              <h2 className="mt-2 font-serif text-3xl sm:text-4xl">
                See what other creators are making.
              </h2>
            </div>
            <span className="hidden text-xs text-slate-500 sm:block">
              Fresh visual ideas
            </span>
          </div>
          <Community />
        </section>
      </main>
    </div>
  );
};

export default Home;
