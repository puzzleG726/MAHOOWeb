import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";

const projects = [
  {
    id: "01",
    title: "空间交互设计",
    en: "Spatial Interaction",
    description: "LED / 投影 / 感应装置 / 实时互动",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "02",
    title: "沉浸式内容制作",
    en: "Immersive Content",
    description: "XR / AR / VR / 实时渲染（Unity / Unreal）",
    image:
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "03",
    title: "互动玩法设计",
    en: "Interactive Systems",
    description: "游戏化机制 / 多人互动 / 数据驱动体验",
    image:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "04",
    title: "数字展演整合",
    en: "Digital Show Integration",
    description: "发布会 / 展厅 / 快闪 / 商业活动",
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=80",
  },
];

const partnerLogos = [
  "LEGO",
  "Midea",
  "Microsoft",
  "HUAWEI",
  "TCL",
  "SWAROVSKI",
  "明日方舟",
  "HITACHI",
  "TESLA",
  "Unilever",
  "VOLVO",
  "ZTE中兴",
  "Smart",
];

function MaheleiLogo({ className = "h-5 w-5", inverted = false }) {
  const color = inverted ? "#000" : "#ff6a32";

  return (
    <svg
      viewBox="0 0 120 120"
      aria-hidden
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="60" cy="60" r="49" stroke={color} strokeWidth="5" />
      <path
        d="M42 39L52 50L42 61"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M78 39L68 50L78 61"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M48 73L60 85L72 73"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="60" cy="63" r="4.5" fill={color} />
    </svg>
  );
}

function useParallax(range = 120) {
  const { scrollY } = useScroll();
  return useTransform(scrollY, [0, 1000], [0, range]);
}

function Grain() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[1] opacity-[0.06] mix-blend-screen"
      style={{
        backgroundImage:
          "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.6) 0.5px, transparent 0.8px), radial-gradient(circle at 80% 30%, rgba(255,255,255,0.5) 0.5px, transparent 0.9px), radial-gradient(circle at 60% 80%, rgba(255,255,255,0.4) 0.5px, transparent 1px)",
        backgroundSize: "180px 180px, 220px 220px, 260px 260px",
      }}
    />
  );
}

function Nav({ language, setLanguage }) {
  const links = ["Home", "About", "Service", "Contact"];

  return (
    <div className="fixed left-0 right-0 top-0 z-50 px-5 py-5 sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between rounded-full border border-[#ff6a32]/20 bg-black/45 px-4 py-3 backdrop-blur-xl">
        <div className="flex items-center gap-3 text-[12px] uppercase tracking-[0.22em] text-[#ff6a32]">
          <span className="grid h-8 w-8 place-items-center rounded-full border border-[#ff6a32]/30 bg-black/60">
            <MaheleiLogo className="h-4 w-4" />
          </span>
          <span>MAHOO LAB 2026</span>
        </div>

        <div className="flex items-center gap-4 sm:gap-8">
          <div className="hidden gap-8 text-[12px] uppercase tracking-[0.2em] text-[#ff9b74] sm:flex">
            {links.map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className="transition hover:text-white"
              >
                {link}
              </a>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setLanguage(language === "en" ? "zh" : "en")}
            className="rounded-full border border-white/15 px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-white/80 transition hover:border-[#ff6a32]/40 hover:text-white"
          >
            {language === "en" ? "EN / 中" : "中 / EN"}
          </button>
        </div>
      </div>
    </div>
  );
}

function HeroTitle({ language }) {
  const letters = useMemo(() => "MAHOO\u00A0LAB".split(""), []);
  const subtitle =
    language === "en"
      ? "Immersive & Interactive Experience Design"
      : "沉浸式与互动体验设计";
  const tagline =
    language === "en"
      ? "Building experience with technology, and driving emotion and communication through experience"
      : "用技术构建体验，用体验驱动情绪与传播";

  return (
    <div className="relative z-10 max-w-[980px]">
      <div className="leading-[0.82] tracking-[-0.08em] text-[#ff6a32]">
        {letters.map((char, index) => (
          <motion.span
            key={`${char}-${index}`}
            initial={{ opacity: 0, y: 100, rotateX: -90 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.03 * index,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative inline-block text-[18vw] font-black sm:text-[12vw]"
            style={{
              textShadow:
                "0 0 12px rgba(255,106,50,0.25), 8px 8px 0 rgba(255,106,50,0.1), 16px 16px 0 rgba(255,106,50,0.06)",
              WebkitTextStroke: "1px rgba(255,106,50,0.65)",
            }}
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.7 }}
        className="mt-6 max-w-4xl text-[14px] uppercase tracking-[0.32em] text-[#ff8f67] sm:text-[22px]"
      >
        {subtitle}
      </motion.p>

      <motion.p
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.68, duration: 0.7 }}
        className="mt-8 max-w-3xl text-base leading-8 text-[#ffd9cc] sm:text-2xl"
      >
        {tagline}
      </motion.p>
    </div>
  );
}

function SectionLabel({ index, title }) {
  return (
    <div className="mb-6 flex items-center gap-4">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#ff6a32] text-3xl font-black text-black shadow-[0_0_36px_rgba(255,106,50,0.45)]">
        {index}
      </div>
      <div>
        <div className="text-[12px] uppercase tracking-[0.28em] text-[#ff936d]">
          Service Module
        </div>
        <div className="text-2xl font-bold text-white sm:text-4xl">{title}</div>
      </div>
    </div>
  );
}

function HoverPanel({ project, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, margin: "0px 0px -12% 0px" });

  const variants = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.article
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      transition={{
        duration: 0.8,
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover="hover"
      className="group relative overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.03]"
    >
      <div className="grid min-h-[520px] lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative overflow-hidden border-b border-white/10 p-7 lg:border-b-0 lg:border-r lg:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,106,50,0.18),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(145,0,255,0.16),transparent_22%)]" />

          <motion.div
            variants={{ hover: { x: 12, y: -10 } }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10"
          >
            <div className="mb-14 text-[11px] uppercase tracking-[0.3em] text-[#ff936d]">
              {project.en}
            </div>

            <div
              className="text-[18vw] font-black leading-[0.8] tracking-[-0.08em] text-[#ff6a32] sm:text-[11vw] lg:text-[7vw]"
              style={{
                textShadow:
                  "0 0 10px rgba(255,106,50,0.18), 8px 8px 0 rgba(255,106,50,0.1), 16px 16px 0 rgba(255,106,50,0.05)",
              }}
            >
              {project.id}
            </div>

            <h3 className="mt-8 max-w-xl text-3xl font-bold tracking-[-0.04em] text-white sm:text-5xl">
              {project.title}
            </h3>

            <p className="mt-5 max-w-xl text-base leading-8 text-white/75 sm:text-xl">
              {project.description}
            </p>
          </motion.div>
        </div>

        <div className="relative aspect-[4/5] overflow-hidden lg:aspect-auto">
          <motion.img
            src={project.image}
            alt={project.title}
            className="h-full w-full object-cover grayscale"
            variants={{
              hover: { scale: 1.08, filter: "grayscale(0%) contrast(1.05)" },
            }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          />

          <div className="absolute inset-0 bg-gradient-to-tr from-black via-black/30 to-transparent" />

          <motion.div
            variants={{ hover: { x: -10, y: 10 } }}
            transition={{ duration: 0.7 }}
            className="absolute right-6 top-6 rounded-2xl border border-[#ff6a32]/30 bg-[#ff6a32] px-5 py-4 text-sm font-black uppercase tracking-[0.22em] text-black shadow-[0_0_34px_rgba(255,106,50,0.35)]"
          >
            Link
          </motion.div>

          <motion.div
            variants={{ hover: { opacity: 1, y: 0 } }}
            initial={{ opacity: 0, y: 16 }}
            className="absolute bottom-6 left-6 rounded-full border border-white/15 bg-black/45 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-white/80 backdrop-blur-md"
          >
            Explore Module
          </motion.div>
        </div>
      </div>
    </motion.article>
  );
}

function StrategyStrip() {
  const items = [
    ["概念主题", "构建统一叙事概念（故事世界观）"],
    ["用户体验路径", "梳理视觉、情绪与行为的体验节奏"],
    ["核心交互设计", "将互动装置与实时内容整合为模块"],
    ["总结", "形成可传播、可执行、可落地的体验方案"],
  ];

  return (
    <section id="service" className="px-5 py-24 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1600px] rounded-[34px] border border-white/10 bg-[#0d0d0d] p-7 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] sm:p-10">
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-[12px] uppercase tracking-[0.28em] text-[#ff936d]">
              Project Strategy and Experience Design
            </div>
            <h2 className="mt-3 text-5xl font-black uppercase tracking-[-0.06em] text-white sm:text-7xl">
              Concept <span className="text-[#ff6a32]">→</span> Journey{" "}
              <span className="text-[#ff6a32]">→</span> Interaction{" "}
              <span className="text-[#ff6a32]">→</span> Conclusion
            </h2>
          </div>

          <p className="max-w-2xl text-base leading-8 text-white/70 sm:text-lg">
            从叙事概念、用户体验路径到核心交互模块，码赫镭把空间、内容与互动整合为统一的体验系统。
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {items.map(([title, desc], i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -15% 0px" }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="rounded-[28px] border border-white/10 bg-black/40 p-6"
            >
              <div className="text-[64px] font-black tracking-[-0.08em] text-[#ff6a32]">
                0{i + 1}
              </div>
              <div className="mt-4 text-2xl font-bold text-white">{title}</div>
              <p className="mt-3 text-base leading-7 text-white/70">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HeroMotionBackdrop() {
  const y = useParallax(90);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setActive((v) => (v + 1) % 3), 2200);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <motion.div style={{ y }} className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(255,106,50,0.18),transparent_22%),radial-gradient(circle_at_68%_24%,rgba(179,0,255,0.22),transparent_18%),radial-gradient(circle_at_80%_65%,rgba(255,255,255,0.08),transparent_14%)]" />

      <motion.div
        animate={{
          x: active === 0 ? "0%" : active === 1 ? "8%" : "-6%",
          y: active === 0 ? "0%" : active === 1 ? "-5%" : "4%",
          scale: active === 2 ? 1.05 : 1,
        }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        className="absolute left-[8%] top-[14%] h-[42vw] w-[54vw] max-h-[560px] rounded-[42px] border border-white/10 bg-[linear-gradient(135deg,#ff4f1f_0%,#ff4f1f_15%,#ff8f67_28%,#c000ff_72%,#050505_100%)] opacity-90 blur-[2px]"
      />

      <motion.div
        animate={{
          x: active === 1 ? "-5%" : "2%",
          y: active === 2 ? "8%" : "-2%",
          rotate: active === 0 ? 0 : active === 1 ? -2 : 2,
        }}
        transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
        className="absolute right-[5%] top-[18%] h-[32vw] w-[28vw] min-w-[220px] rounded-[36px] border border-white/10 bg-[linear-gradient(180deg,#111_0%,#151515_30%,#0b0b0b_100%)] shadow-[0_0_40px_rgba(0,0,0,0.35)]"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,rgba(192,0,255,0.45),transparent_30%),linear-gradient(135deg,transparent,rgba(255,106,50,0.15))]" />
        <div className="absolute bottom-10 left-8 text-white">
          <div className="text-sm uppercase tracking-[0.28em] text-white/65">
            Intelligent Experiences
          </div>
          <div className="mt-4 text-[10vw] font-black leading-none tracking-[-0.08em] text-white sm:text-[7vw]">
            IX
          </div>
        </div>
      </motion.div>

      <div className="absolute bottom-14 left-[10%] right-[10%] flex items-center gap-4 overflow-hidden">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        <div className="rounded-full border border-white/15 bg-black/40 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-white/70 backdrop-blur-md">
          Launch Work ↗
        </div>
      </div>
    </motion.div>
  );
}

function WorksPartnersMarquee() {
  const track = [...partnerLogos, ...partnerLogos];

  return (
    <section className="px-5 py-24 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1600px] overflow-hidden rounded-[34px] border border-white/10 bg-[#0b0b0b] py-10">
        <div className="mb-8 px-7 sm:px-10">
          <div className="text-[12px] uppercase tracking-[0.28em] text-[#ff936d]">
            Works & Partners
          </div>
          <h2 className="mt-3 text-4xl font-black uppercase tracking-[-0.05em] text-white sm:text-6xl">
            Collaborators / Brand Partners
          </h2>
        </div>

        <div className="relative overflow-hidden">
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 38, repeat: Infinity, ease: "linear" }}
            className="flex w-max gap-4 px-5"
          >
            {track.map((name, index) => (
              <motion.div
                key={`${name}-${index}`}
                whileHover={{
                  y: -4,
                  backgroundColor: "rgba(255,255,255,0.08)",
                  borderColor: "rgba(255,255,255,0.22)",
                }}
                transition={{ duration: 0.25 }}
                className="group flex h-28 w-[220px] shrink-0 items-center justify-center rounded-[24px] border border-white/10 bg-white/[0.02] px-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
              >
                <div className="flex w-full items-center justify-between gap-4 text-white/55 transition duration-300 group-hover:text-white">
                  <div className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-black/60">
                    <MaheleiLogo className="h-4 w-4 opacity-70 group-hover:opacity-100" />
                  </div>
                  <div className="text-right text-[15px] font-semibold uppercase tracking-[0.18em] text-white/72 group-hover:text-white">
                    {name}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#0b0b0b] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#0b0b0b] to-transparent" />
        </div>
      </div>
    </section>
  );
}

function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    let rafId = 0;
    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ring = { x: mouse.x, y: mouse.y };

    const onMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(calc(${mouse.x}px - 50%), calc(${mouse.y}px - 50%), 0)`;
      }
    };

    const loop = () => {
      ring.x += (mouse.x - ring.x) * 0.18;
      ring.y += (mouse.y - ring.y) * 0.18;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(calc(${ring.x}px - 50%), calc(${ring.y}px - 50%), 0)`;
      }
      rafId = window.requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMove);
    rafId = window.requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[9998] hidden h-6 w-6 rounded-full md:block"
        style={{
          border: "2px solid rgba(255,255,255,1)",
          mixBlendMode: "difference",
          transform: "translate3d(calc(0px - 50%), calc(0px - 50%), 0)",
        }}
      />
    </>
  );
}

export default function GalleryMotionTemplate() {
  const [language, setLanguage] = useState("en");

  return (
    <div className="min-h-screen overflow-x-hidden bg-black text-white [cursor:none] md:[cursor:none]">
      <CustomCursor />
      <Grain />
      <Nav language={language} setLanguage={setLanguage} />

      <div className="fixed inset-0 -z-20 bg-[linear-gradient(180deg,#000_0%,#050505_45%,#0a0a0a_100%)]" />
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(255,106,50,0.06),transparent_25%),radial-gradient(circle_at_70%_15%,rgba(192,0,255,0.1),transparent_18%)]" />

      <section
        id="home"
        className="relative flex min-h-screen items-end px-5 pb-16 pt-28 sm:px-8 lg:px-12 lg:pb-24"
      >
        <HeroMotionBackdrop />
        <div className="relative mx-auto w-full max-w-[1600px]">
          <HeroTitle language={language} />
        </div>
        <div className="absolute bottom-0 left-0 h-24 w-24 bg-[#ff6a32]" />
        <div className="absolute right-0 top-0 h-24 w-24 bg-[#ff6a32]" />
      </section>

      <section id="about" className="px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto grid max-w-[1600px] gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,106,50,0.08),rgba(255,106,50,0.03))] p-7 sm:p-10">
            <div className="text-[14vw] font-black leading-[0.86] tracking-[-0.08em] text-[#ff6a32] drop-shadow-[0_0_24px_rgba(255,106,50,0.18)] sm:text-[8vw]">
              WHO WE ARE
            </div>

            <p className="mt-8 max-w-3xl text-xl leading-10 text-[#ffe1d7] sm:text-3xl">
              MAHOO LAB 是一家专注于「数字交互 + 沉浸体验 +
              空间叙事」的创意技术团队。
            </p>

            <div className="mt-12 grid gap-4 sm:grid-cols-2">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="rounded-[26px] border border-[#ff6a32]/20 bg-black/35 p-6"
                >
                  <div className="text-[56px] font-black tracking-[-0.08em] text-[#ff6a32]">
                    {project.id}
                  </div>
                  <div className="mt-2 text-2xl font-bold text-white">
                    {project.title}
                  </div>
                  <div className="mt-3 text-base leading-7 text-white/70">
                    {project.description}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[#f1f1ed] text-black">
            <img
              src="https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1400&q=80"
              alt="brand visual"
              className="absolute inset-0 h-full w-full object-cover opacity-95"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent" />
            <div className="absolute left-6 top-6 grid h-20 w-20 place-items-center bg-[#ff6a32] text-black shadow-[0_0_30px_rgba(255,106,50,0.38)]">
              <MaheleiLogo className="h-9 w-9" inverted />
            </div>
          </div>
        </div>
      </section>

      <StrategyStrip />

      <section className="px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
        <div className="mx-auto max-w-[1600px] space-y-6">
          <SectionLabel index="04" title="核心服务 / Service Modules" />
          {projects.map((project, index) => (
            <HoverPanel key={project.id} project={project} index={index} />
          ))}
        </div>
      </section>

      <section className="px-5 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1600px] rounded-[36px] bg-[#ff6a32] px-7 py-14 text-black sm:px-10 lg:px-14">
          <div className="text-[12px] uppercase tracking-[0.3em] text-black/70">
            Brand Experience
          </div>

          <div className="mt-4 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <h2 className="text-5xl font-black uppercase tracking-[-0.06em] sm:text-7xl lg:text-[7vw]">
                Delivering a Memorable Brand Experience
              </h2>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-black/75 sm:text-2xl">
                我们把技术落地、互动机制、空间内容与品牌传播触点整合成一次完整体验。
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {[
                "The role of customer experience in branding",
                "Creating touchpoints that resonate with customers",
                "Examples of excellent brand experiences",
              ].map((item) => (
                <div
                  key={item}
                  className="border-t border-black/20 pt-4 text-lg font-bold uppercase leading-7"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <WorksPartnersMarquee />

      <footer
        id="contact"
        className="border-t border-white/10 px-5 py-12 sm:px-8 lg:px-12"
      >
        <div className="mx-auto flex max-w-[1600px] flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-[#ff936d]">
              <span className="grid h-8 w-8 place-items-center rounded-full border border-[#ff6a32]/30 bg-black/60">
                <MaheleiLogo className="h-4 w-4" />
              </span>
              <span>{language === "en" ? "Contact" : "联系"}</span>
            </div>

            <div className="mt-3 text-[16vw] font-black leading-[0.86] tracking-[-0.08em] text-[#ff6a32] sm:text-[10vw] lg:text-[7vw]">
              MAHOO
              <br />
              LAB
            </div>
          </div>

          <div className="max-w-2xl">
            <p className="text-2xl leading-10 text-white sm:text-3xl">
              {language === "en"
                ? "Building experience with technology, and driving emotion and communication through experience."
                : "用技术构建体验，用体验驱动情绪与传播。"}
            </p>

            <div className="mt-8 flex flex-wrap gap-3 text-[11px] uppercase tracking-[0.24em] text-white/75">
              <span className="rounded-full border border-white/15 px-4 py-2">
                {language === "en" ? "Immersive Experience" : "沉浸体验"}
              </span>
              <span className="rounded-full border border-white/15 px-4 py-2">
                {language === "en" ? "Interactive Systems" : "互动系统"}
              </span>
              <span className="rounded-full border border-white/15 px-4 py-2">
                {language === "en" ? "Spatial Narrative" : "空间叙事"}
              </span>
            </div>

            <p className="mt-8 text-lg text-white/60">mii@mahelei.com</p>

            <div className="mt-6 flex flex-wrap gap-3 text-sm text-white/80">
              <a
                href="#"
                className="rounded-full border border-white/15 px-4 py-2 transition hover:border-[#ff6a32]/40 hover:text-white"
              >
                {language === "en" ? "WeChat Official Account" : "微信公众号"}
              </a>
              <a
                href="#"
                className="rounded-full border border-white/15 px-4 py-2 transition hover:border-[#ff6a32]/40 hover:text-white"
              >
                {language === "en" ? "Xiaohongshu" : "小红书"}
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
