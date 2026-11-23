"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import {
  Search,
  User,
  X,
  ExternalLink,
  Calendar,
  Clock,
  ArrowRight,
  Sparkles,
  Globe
} from "lucide-react"
import { LinkedinIcon, GithubIcon } from "@/components/icons"
import type { Speaker, PopulatedSession } from "@/types/schedule"

export default function SpeakersPage() {
  const [speakers, setSpeakers] = useState<Speaker[]>([])
  const [sessions, setSessions] = useState<PopulatedSession[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTopic, setSelectedTopic] = useState<string>("all")
  const [selectedSpeaker, setSelectedSpeaker] = useState<Speaker | null>(null)

  useEffect(() => {
    async function loadSpeakersAndSessions() {
      try {
        setLoading(true)
        const [speakersRes, scheduleRes] = await Promise.all([
          fetch("/api/speakers"),
          fetch("/api/schedule")
        ])

        if (speakersRes.ok) {
          const spkData = await speakersRes.json()
          setSpeakers(Array.isArray(spkData) ? spkData : [])
        }

        if (scheduleRes.ok) {
          const schedData = await scheduleRes.json()
          setSessions(Array.isArray(schedData.sessions) ? schedData.sessions : [])
        }
      } catch {
        setSpeakers([])
        setSessions([])
      } finally {
        setLoading(false)
      }
    }

    loadSpeakersAndSessions()
  }, [])

  // Extract all unique topics across speakers
  const allTopics = useMemo(() => {
    const topicsSet = new Set<string>()
    for (const spk of speakers) {
      if (Array.isArray(spk.topics)) {
        for (const t of spk.topics) {
          if (t?.trim()) topicsSet.add(t.trim())
        }
      }
    }
    return Array.from(topicsSet).sort()
  }, [speakers])

  // Filter speakers based on search query and topic filter
  const filteredSpeakers = useMemo(() => {
    const query = searchQuery.toLowerCase().trim()

    return speakers.filter((spk) => {
      const matchesTopic =
        selectedTopic === "all" ||
        (Array.isArray(spk.topics) &&
          spk.topics.some((t) => t.toLowerCase() === selectedTopic.toLowerCase()))

      const matchesSearch =
        !query ||
        spk.full_name?.toLowerCase().includes(query) ||
        spk.company?.toLowerCase().includes(query) ||
        spk.designation?.toLowerCase().includes(query) ||
        spk.bio?.toLowerCase().includes(query) ||
        (Array.isArray(spk.topics) &&
          spk.topics.some((t) => t.toLowerCase().includes(query)))

      return matchesTopic && matchesSearch
    })
  }, [speakers, searchQuery, selectedTopic])

  // Get sessions presented by the selected speaker
  const speakerSessions = useMemo(() => {
    if (!selectedSpeaker) return []
    return sessions.filter((session) => {
      if (Array.isArray(session.speakers)) {
        return session.speakers.some((s) => s.id === selectedSpeaker.id)
      }
      return false
    })
  }, [selectedSpeaker, sessions])

  function formatTime(isoString?: string) {
    if (!isoString) return ""
    try {
      const d = new Date(isoString)
      return d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      })
    } catch {
      return isoString
    }
  }

  function formatDate(isoString?: string) {
    if (!isoString) return ""
    try {
      const d = new Date(isoString)
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric"
      })
    } catch {
      return isoString
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] text-white">
      {/* Background glowing gradients */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(108,0,255,0.15),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_85%_35%,rgba(255,0,212,0.08),transparent_50%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1600px] px-5 pb-24 pt-32 sm:px-10 sm:pt-40 lg:px-16">
        {/* Header section */}
        <div className="flex flex-col justify-between gap-6 border-b border-white/10 pb-12 md:flex-row md:items-end">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-8 bg-[#FF00D4]" />
              <span className="text-xs uppercase tracking-[0.22em] text-[#FF2D87]">
                Visionaries & Cloud Leaders
              </span>
            </div>

            <h1 className="text-[clamp(2.8rem,7vw,6.5rem)] font-light leading-[0.88] tracking-[-0.075em]">
              Meet our{" "}
              <span className="bg-linear-to-r from-[#FF2D87] via-[#FF00D4] to-[#8B5CFF] bg-clip-text text-transparent">
                speakers.
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-white/60 sm:text-base">
              Learn from the cloud architects, engineering leaders, core builders, and community visionaries shaping the next frontier of scalable cloud computing and AI.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/schedule"
              className="flex h-11 items-center gap-2 border border-white/20 px-6 text-xs uppercase tracking-wider text-white transition-all hover:border-[#FF00D4] hover:bg-white/5"
            >
              <span>View Full Schedule</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/tickets"
              className="flex h-11 items-center gap-2 bg-linear-to-r from-[#FF00D4] to-[#702cff] px-6 text-xs font-semibold uppercase tracking-wider text-white shadow-[0_0_24px_rgba(255,0,212,0.3)] transition-all hover:opacity-95"
            >
              <Sparkles className="h-4 w-4" />
              <span>Get Festival Pass</span>
            </Link>
          </div>
        </div>

        {/* Search and filters bar */}
        <div className="mt-8 flex flex-col gap-5 border-b border-white/10 pb-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Search by name, company, or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 w-full border border-white/15 bg-white/5 pl-11 pr-4 text-xs text-white placeholder-white/30 focus:border-[#FF00D4] focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white"
                title="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Topic pill filters */}
          {allTopics.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1 text-xs">
              <button
                type="button"
                onClick={() => setSelectedTopic("all")}
                className={`h-8 px-3.5 text-[11px] uppercase tracking-wider transition-all duration-200 ${
                  selectedTopic === "all"
                    ? "border border-[#FF00D4] bg-[#FF00D4]/20 text-white font-medium"
                    : "border border-white/10 bg-white/2 text-white/60 hover:border-white/30 hover:text-white"
                }`}
              >
                All Topics ({speakers.length})
              </button>
              {allTopics.map((topic) => {
                const count = speakers.filter(
                  (s) => Array.isArray(s.topics) && s.topics.includes(topic)
                ).length
                const isSelected = selectedTopic.toLowerCase() === topic.toLowerCase()

                return (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => setSelectedTopic(topic)}
                    className={`h-8 px-3.5 text-[11px] uppercase tracking-wider transition-all duration-200 ${
                      isSelected
                        ? "border border-[#FF00D4] bg-[#FF00D4]/20 text-white font-medium"
                        : "border border-white/10 bg-white/2 text-white/60 hover:border-white/30 hover:text-white"
                    }`}
                  >
                    {topic} ({count})
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Speaker cards grid */}
        {loading ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-96 animate-pulse border border-white/5 bg-white/[0.02]"
              />
            ))}
          </div>
        ) : filteredSpeakers.length === 0 ? (
          <div className="mt-16 flex flex-col items-center justify-center border border-white/10 bg-white/[0.01] py-20 text-center">
            <User className="h-12 w-12 text-white/20 mb-3" />
            <h3 className="text-xl font-light text-white">No Speakers Found</h3>
            <p className="mt-2 max-w-md text-xs text-white/50">
              {searchQuery
                ? `No speakers match "${searchQuery}". Try searching for another name, company, or reset topic filters.`
                : "Speaker announcements for AWS Re:Invent Fest 2026 will be revealed soon."}
            </p>
            {(searchQuery || selectedTopic !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("")
                  setSelectedTopic("all")
                }}
                className="mt-6 border border-white/20 px-5 py-2 text-xs uppercase tracking-wider hover:border-[#FF00D4] text-white transition-colors"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredSpeakers.map((spk) => (
              <article
                key={spk.id}
                onClick={() => setSelectedSpeaker(spk)}
                className="group relative flex cursor-pointer flex-col justify-between overflow-hidden border border-white/10 bg-white/[0.02] p-6 transition-all duration-300 hover:border-[#FF00D4]/70 hover:shadow-[0_0_35px_rgba(255,0,212,0.18)]"
              >
                <div>
                  {/* Photo container */}
                  <div className="relative aspect-square w-full overflow-hidden rounded-md border border-white/10 bg-white/[0.05]">
                    {spk.profile_picture ? (
                      <img
                        src={spk.profile_picture}
                        alt={spk.full_name}
                        className="h-full w-full object-cover grayscale contrast-125 transition-all duration-500 group-hover:scale-105 group-hover:grayscale-0"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-white/30">
                        <User className="h-16 w-16" />
                      </div>
                    )}
                    <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent" />

                    {spk.company && (
                      <span className="absolute bottom-3 left-3 border border-white/20 bg-black/60 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#FF2D87] backdrop-blur-md">
                        {spk.company}
                      </span>
                    )}
                  </div>

                  <div className="mt-6">
                    <h3 className="text-xl font-medium tracking-tight text-white transition-colors group-hover:text-[#FF2D87]">
                      {spk.full_name}
                    </h3>
                    <p className="mt-1 text-xs text-white/60">{spk.designation}</p>

                    <p className="mt-3 text-xs leading-relaxed text-white/50 line-clamp-3">
                      {spk.bio}
                    </p>
                  </div>
                </div>

                <div className="mt-6 border-t border-white/10 pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {spk.topics &&
                        spk.topics.slice(0, 2).map((t) => (
                          <span
                            key={t}
                            className="border border-white/10 bg-white/2 px-2 py-0.5 text-[9px] uppercase tracking-wider text-white/50"
                          >
                            {t}
                          </span>
                        ))}
                    </div>

                    <div
                      className="flex items-center gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {spk.socials?.linkedin && (
                        <a
                          href={spk.socials.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${spk.full_name} on LinkedIn`}
                          className="p-1 text-white/40 transition-colors hover:text-white"
                        >
                          <LinkedinIcon className="h-4 w-4" />
                        </a>
                      )}
                      {spk.socials?.github && (
                        <a
                          href={spk.socials.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${spk.full_name} on GitHub`}
                          className="p-1 text-white/40 transition-colors hover:text-white"
                        >
                          <GithubIcon className="h-4 w-4" />
                        </a>
                      )}
                      {spk.socials?.website && (
                        <a
                          href={spk.socials.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${spk.full_name} Website`}
                          className="p-1 text-white/40 transition-colors hover:text-white"
                        >
                          <Globe className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Speaker detail modal */}
        {selectedSpeaker && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
            onClick={() => setSelectedSpeaker(null)}
          >
            <div
              className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-[#FF00D4] bg-[#0c0816] p-6 shadow-[0_0_60px_rgba(255,0,212,0.3)] sm:p-10"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setSelectedSpeaker(null)}
                className="absolute right-5 top-5 p-2 text-white/40 hover:text-white transition-colors"
                title="Close modal"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-lg border border-white/15 bg-white/5 sm:h-36 sm:w-36">
                  {selectedSpeaker.profile_picture ? (
                    <img
                      src={selectedSpeaker.profile_picture}
                      alt={selectedSpeaker.full_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-white/30">
                      <User className="h-12 w-12" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  {selectedSpeaker.company && (
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-[#FF00D4]">
                      {selectedSpeaker.company}
                    </span>
                  )}
                  <h2 className="mt-1 text-2xl font-light tracking-tight text-white sm:text-3xl">
                    {selectedSpeaker.full_name}
                  </h2>
                  <p className="mt-1 text-xs text-white/60">
                    {selectedSpeaker.designation}
                  </p>

                  <div className="mt-4 flex items-center gap-3">
                    {selectedSpeaker.socials?.linkedin && (
                      <a
                        href={selectedSpeaker.socials.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 border border-white/15 px-3 py-1 text-xs text-white/70 hover:border-white hover:text-white transition-colors"
                      >
                        <LinkedinIcon className="h-3.5 w-3.5 text-[#0A66C2]" />
                        <span>LinkedIn</span>
                      </a>
                    )}
                    {selectedSpeaker.socials?.github && (
                      <a
                        href={selectedSpeaker.socials.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 border border-white/15 px-3 py-1 text-xs text-white/70 hover:border-white hover:text-white transition-colors"
                      >
                        <GithubIcon className="h-3.5 w-3.5" />
                        <span>GitHub</span>
                      </a>
                    )}
                    {selectedSpeaker.socials?.website && (
                      <a
                        href={selectedSpeaker.socials.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 border border-white/15 px-3 py-1 text-xs text-white/70 hover:border-white hover:text-white transition-colors"
                      >
                        <Globe className="h-3.5 w-3.5" />
                        <span>Website</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Bio section */}
              <div className="mt-8 border-t border-white/10 pt-6">
                <h4 className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
                  About the Speaker
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-white/75">
                  {selectedSpeaker.bio}
                </p>
              </div>

              {/* Topics section */}
              {selectedSpeaker.topics && selectedSpeaker.topics.length > 0 && (
                <div className="mt-6 border-t border-white/10 pt-6">
                  <h4 className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
                    Focus Areas & Topics
                  </h4>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedSpeaker.topics.map((t) => (
                      <span
                        key={t}
                        className="border border-[#8B5CFF]/30 bg-[#8B5CFF]/10 px-3 py-1 text-[11px] uppercase tracking-wider text-[#B69AFF]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Sessions presented by this speaker */}
              {speakerSessions.length > 0 && (
                <div className="mt-8 border-t border-white/10 pt-6">
                  <h4 className="text-[10px] font-semibold uppercase tracking-widest text-[#FF2D87]">
                    Sessions by {selectedSpeaker.full_name}
                  </h4>
                  <div className="mt-4 space-y-3">
                    {speakerSessions.map((session) => (
                      <div
                        key={session.id}
                        className="border border-white/10 bg-white/[0.02] p-4 transition-colors hover:border-[#FF00D4]/40"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="border border-white/15 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white/60">
                            {session.session_type}
                          </span>
                          {session.start_at && (
                            <span className="flex items-center gap-1.5 text-xs text-white/50">
                              <Calendar className="h-3.5 w-3.5 text-[#FF00D4]" />
                              {formatDate(session.start_at)} ·{" "}
                              <Clock className="h-3.5 w-3.5 text-[#8B5CFF]" />
                              {formatTime(session.start_at)}
                            </span>
                          )}
                        </div>

                        <h5 className="mt-2 text-base font-medium text-white">
                          {session.title}
                        </h5>

                        <p className="mt-1 text-xs text-white/60 line-clamp-2">
                          {session.description}
                        </p>

                        <div className="mt-3 flex justify-end">
                          <Link
                            href="/schedule"
                            className="inline-flex items-center gap-1.5 text-xs text-[#FF2D87] hover:underline"
                          >
                            <span>View on Schedule</span>
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-8 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedSpeaker(null)}
                  className="border border-white/20 px-6 py-2.5 text-xs uppercase tracking-wider text-white hover:border-white transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
