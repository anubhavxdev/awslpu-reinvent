"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowUpRight, Sparkles, Users } from "lucide-react"
import { LinkedinIcon } from "@/components/icons"
import type { Speaker } from "@/types/schedule"

export function FeaturedSpeakers() {
  const [speakers, setSpeakers] = useState<Speaker[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSpeakers() {
      try {
        const res = await fetch("/api/speakers")
        if (res.ok) {
          const data = await res.json()
          setSpeakers(Array.isArray(data) ? data : [])
        }
      } catch {
        setSpeakers([])
      } finally {
        setLoading(false)
      }
    }
    fetchSpeakers()
  }, [])

  return (
    <section className="relative isolate overflow-hidden bg-[#050505] px-6 py-24 text-white sm:px-10 lg:px-16 lg:py-32">
      {/* Top glowing separator beam */}
      <div className="pointer-events-none absolute -top-px left-1/2 -translate-x-1/2 h-px w-3/4 max-w-5xl bg-linear-to-r from-transparent via-[#FF00D4] to-transparent shadow-[0_0_25px_#FF00D4]" />

      {/* Atmospheric lighting effects */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[850px] rounded-full bg-[#FF00D4]/14 blur-[150px]" />
      <div className="pointer-events-none absolute bottom-0 right-10 h-[450px] w-[550px] rounded-full bg-[#6C00FF]/16 blur-[140px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:28px_28px] opacity-70" />

      <div className="relative mx-auto max-w-[1600px]">
        {/* Section header */}
        <div className="flex flex-col justify-between gap-8 border-b border-white/10 pb-12 sm:flex-row sm:items-end">
          <div>
            <div className="mb-4 inline-flex items-center gap-2.5 rounded-full border border-[#FF00D4]/40 bg-[#FF00D4]/10 px-3.5 py-1 backdrop-blur-md shadow-[0_0_20px_rgba(255,0,212,0.2)]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FF00D4] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#FF00D4]" />
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#FF80DF]">
                Official 2026 Lineup
              </span>
            </div>

            <h2 className="text-4xl font-light tracking-[-0.06em] sm:text-6xl lg:text-7xl">
              World-class minds{" "}
              <span className="bg-linear-to-r from-[#FF2D87] via-[#FF00D4] to-[#8B5CFF] bg-clip-text text-transparent font-normal">
                on stage.
              </span>
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/60 sm:text-base">
              Learn directly from cloud architects, AWS community leaders, and distributed systems engineers shaping the modern cloud frontier.
            </p>
          </div>

          <Link
            href="/speakers"
            className="group inline-flex items-center gap-3 self-start rounded-full border border-[#FF00D4]/50 bg-[#FF00D4]/10 px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white shadow-[0_0_25px_rgba(255,0,212,0.25)] backdrop-blur-md transition-all duration-300 hover:border-[#FF00D4] hover:bg-[#FF00D4] hover:shadow-[0_0_35px_rgba(255,0,212,0.5)] sm:self-end"
          >
            <span>Explore All Speakers</span>
            <ArrowUpRight className="h-4 w-4 text-[#FF80DF] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white" />
          </Link>
        </div>

        {/* Speaker cards */}
        {loading ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-96 animate-pulse rounded-xl border border-white/10 bg-white/[0.02]"
              />
            ))}
          </div>
        ) : speakers.length === 0 ? (
          <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-linear-to-b from-white/[0.03] to-transparent py-20 text-center shadow-[0_0_50px_rgba(255,0,212,0.08)]">
            <span className="text-xs uppercase tracking-widest text-[#FF00D4]">
              Speaker Lineup
            </span>
            <h3 className="mt-2 text-2xl font-light text-white">
              Announcements Coming Soon
            </h3>
            <p className="mt-2 max-w-md text-xs text-white/50">
              Leading engineers, cloud architects, researchers, and community heroes will take the stage. Full speaker roster will be revealed shortly.
            </p>
          </div>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {speakers.slice(0, 3).map((spk) => (
              <article
                key={spk.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-white/15 bg-linear-to-b from-white/[0.05] via-[#090614] to-[#04020a] p-6 shadow-xl backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:border-[#FF00D4] hover:shadow-[0_0_40px_rgba(255,0,212,0.35),0_0_80px_rgba(108,0,255,0.2)]"
              >
                {/* Top glowing hover beam */}
                <div className="pointer-events-none absolute top-0 inset-x-0 h-0.5 bg-linear-to-r from-transparent via-[#FF00D4]/40 to-transparent transition-all duration-300 group-hover:h-1 group-hover:via-[#FF00D4]" />
                <div className="pointer-events-none absolute -top-12 -right-12 h-28 w-28 rounded-full bg-[#FF00D4]/10 blur-2xl transition-all duration-500 group-hover:bg-[#FF00D4]/25" />

                <div>
                  {/* Photo container */}
                  <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-white/15 bg-white/[0.05] transition-all duration-500 group-hover:border-[#FF00D4]/60 group-hover:shadow-[0_0_25px_rgba(255,0,212,0.25)]">
                    {spk.profile_picture ? (
                      <img
                        src={spk.profile_picture}
                        alt={spk.full_name}
                        className="h-full w-full object-cover grayscale contrast-125 transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-white/5 text-3xl font-light text-white/40">
                        {spk.full_name.charAt(0)}
                      </div>
                    )}
                    <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/85 via-transparent to-transparent" />

                    {spk.company && (
                      <span className="absolute bottom-3 left-3 rounded border border-[#FF00D4]/50 bg-black/85 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#FF80DF] backdrop-blur-md shadow-lg">
                        {spk.company}
                      </span>
                    )}
                  </div>

                  <div className="mt-5">
                    <h3 className="text-xl font-semibold tracking-tight text-white transition-colors duration-200 group-hover:text-[#FF80DF]">
                      {spk.full_name}
                    </h3>
                    <p className="mt-1 text-xs text-white/60 font-medium">
                      {spk.designation}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                  <span className="text-[10px] uppercase tracking-wider text-white/40 line-clamp-1 font-mono">
                    {spk.topics?.[0] ? `#${spk.topics[0]}` : "#CloudArchitecture"}
                  </span>
                  {spk.socials?.linkedin ? (
                    <a
                      href={spk.socials.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${spk.full_name} LinkedIn`}
                      className="rounded p-1 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <LinkedinIcon className="h-4 w-4" />
                    </a>
                  ) : null}
                </div>
              </article>
            ))}

            {/* High-visibility View All Card */}
            <Link
              href="/speakers"
              className="group relative flex flex-col justify-between overflow-hidden rounded-xl border-2 border-[#FF00D4]/70 bg-linear-to-b from-[#FF00D4]/20 via-[#6C00FF]/15 to-[#080512] p-6 shadow-[0_0_40px_rgba(255,0,212,0.22)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-[#FF00D4] hover:shadow-[0_0_60px_rgba(255,0,212,0.45),0_0_100px_rgba(108,0,255,0.3)]"
            >
              {/* Radial glow pulse */}
              <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-[#FF00D4]/25 blur-3xl transition-all duration-700 group-hover:scale-150 group-hover:bg-[#FF00D4]/40" />

              <div>
                <div className="flex aspect-square w-full flex-col items-center justify-center rounded-lg border border-[#FF00D4]/40 bg-black/40 backdrop-blur-md transition-all duration-500 group-hover:border-[#FF00D4] group-hover:bg-[#FF00D4]/15">
                  {/* Concentric radar rings icon */}
                  <div className="relative flex h-20 w-20 items-center justify-center">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FF00D4]/20 duration-1000" />
                    <span className="absolute inline-flex h-16 w-16 rounded-full border border-[#FF00D4]/60 bg-[#FF00D4]/10 shadow-[0_0_25px_rgba(255,0,212,0.4)]" />
                    <ArrowUpRight className="relative h-8 w-8 text-white transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:scale-110" />
                  </div>

                  <span className="mt-4 text-[11px] font-bold uppercase tracking-[0.24em] text-[#FF80DF]">
                    Full Lineup
                  </span>
                  <span className="mt-1 text-xs text-white/70">
                    {speakers.length > 3
                      ? `+${speakers.length - 3} more speakers`
                      : "Explore all speakers"}
                  </span>
                </div>

                <div className="mt-5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#FF80DF]">
                    Re:Invent 2026
                  </span>
                  <h3 className="mt-1 text-xl font-semibold tracking-tight text-white transition-colors duration-200 group-hover:text-[#FF80DF]">
                    Meet All Speakers
                  </h3>
                  <p className="mt-1 text-xs text-white/60">
                    Browse the complete roster of keynote speakers, panelists, and workshop hosts.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-[#FF00D4]/30 pt-4 text-xs font-bold uppercase tracking-wider text-[#FF80DF] transition-colors group-hover:text-white">
                <span>View Complete Roster</span>
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
              </div>
            </Link>
          </div>
        )}
      </div>

      {/* Bottom subtle glow separator */}
      <div className="pointer-events-none absolute -bottom-px left-1/2 -translate-x-1/2 h-px w-2/3 max-w-4xl bg-linear-to-r from-transparent via-[#8B5CFF]/60 to-transparent shadow-[0_0_20px_#8B5CFF]" />
    </section>
  )
}
