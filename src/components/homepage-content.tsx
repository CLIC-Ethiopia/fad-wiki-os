import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  StickyNote,
  Brain,
  Sparkles,
  Zap,
  GraduationCap,
  UserCheck,
  Phone,
  Mail,
  Compass,
  ArrowUpRight,
  TrendingUp,
  FileText,
  User,
  CheckCircle2,
} from "lucide-react";

import { useWikiConfig } from "@/client/wiki-config";
import { type HomepageData, type PageSummary } from "@/lib/wiki-shared";
import { type HomepageSectionKey } from "@/lib/wiki-config";
import { usePersonImage } from "@/client/use-person-image";

function PersonCard({ person, index }: { person: PageSummary; index: number }) {
  const imageUrl = usePersonImage(person.title);
  const [imgLoaded, setImgLoaded] = useState(false);

  const cardAccents = [
    "hover:border-teal-500/50 hover:shadow-teal-500/10",
    "hover:border-purple-500/50 hover:shadow-purple-500/10",
    "hover:border-rose-500/50 hover:shadow-rose-500/10",
  ][index % 3];

  return (
    <Link
      to={`/wiki/${person.slug}`}
      className={`group relative flex items-center gap-3.5 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 p-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:bg-zinc-900 hover:shadow-lg ${cardAccents}`}
    >
      <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-purple-600/30 to-indigo-600/30 border border-purple-500/30 text-purple-200 font-display text-lg font-semibold shadow-inner">
        <span aria-hidden={imageUrl !== null && imgLoaded}>
          {person.title.charAt(0)}
        </span>
        {imageUrl && (
          <img
            src={imageUrl}
            alt=""
            loading="lazy"
            decoding="async"
            onLoad={() => setImgLoaded(true)}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
              imgLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-sm font-medium text-white group-hover:text-purple-300 transition-colors">
          {person.title}
        </p>
        <p className="text-[11px] text-zinc-500 flex items-center gap-1 mt-0.5">
          <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
          {person.backlinkCount} connections
        </p>
      </div>
      <ArrowUpRight className="h-4 w-4 text-zinc-600 opacity-0 group-hover:opacity-100 group-hover:text-purple-400 transition-all shrink-0" />
    </Link>
  );
}

function PageChip({ page, index }: { page: PageSummary; index: number }) {
  const chipStyles = [
    "bg-teal-500/10 border-teal-500/30 text-teal-300 hover:border-teal-400 hover:bg-teal-500/20",
    "bg-amber-500/10 border-amber-500/30 text-amber-300 hover:border-amber-400 hover:bg-amber-500/20",
    "bg-purple-500/10 border-purple-500/30 text-purple-300 hover:border-purple-400 hover:bg-purple-500/20",
  ][index % 3];

  return (
    <Link
      to={`/wiki/${page.slug}`}
      className={`group inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${chipStyles}`}
    >
      <span>{page.title}</span>
      <span className="rounded-full bg-black/40 px-1.5 py-0.5 text-[10px] font-bold tabular-nums">
        {page.backlinkCount}
      </span>
    </Link>
  );
}

export function HomepageContent({ homepage }: { homepage: HomepageData }) {
  const config = useWikiConfig();
  const labels = config.homepage.labels;
  const orderedSections = config.homepage.sectionOrder.filter(
    (section): section is HomepageSectionKey => {
      return section !== "people" || homepage.people.length > 0;
    }
  );

  const sectionViews: Record<HomepageSectionKey, ReactNode> = {
    featured:
      homepage.featured.length > 0 ? (
        <div>
          <div className="mb-4 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.6)] animate-pulse" />
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
              {labels.featured}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {homepage.featured.map((page, index) => {
              const borderAccent = [
                "hover:border-teal-500/50 before:bg-gradient-to-b before:from-teal-400 before:to-emerald-500",
                "hover:border-amber-500/50 before:bg-gradient-to-b before:from-amber-400 before:to-orange-500",
                "hover:border-purple-500/50 before:bg-gradient-to-b before:from-purple-400 before:to-rose-500",
              ][index % 3];

              return (
                <Link
                  key={page.file}
                  to={`/wiki/${page.slug}`}
                  className={`group relative overflow-hidden rounded-2xl bg-zinc-900/70 border border-zinc-800/80 p-4.5 text-left transition-all duration-300 hover:-translate-y-0.5 hover:bg-zinc-900 hover:shadow-xl before:absolute before:left-0 before:top-0 before:h-full before:w-1 ${borderAccent}`}
                >
                  <div className="flex items-start justify-between gap-2 pl-2">
                    <p className="truncate font-display text-base font-medium text-white group-hover:text-rose-300 transition-colors">
                      {page.title}
                    </p>
                    <ArrowUpRight className="h-4 w-4 text-zinc-600 group-hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all shrink-0 mt-0.5" />
                  </div>
                  {page.summary && (
                    <p className="mt-1.5 line-clamp-2 pl-2 text-xs leading-relaxed text-zinc-400">
                      {page.summary}
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-3 pl-2 text-[11px] font-medium text-zinc-500">
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {page.wordCount.toLocaleString()} words
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {page.backlinkCount} backlinks
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ) : null,

    topConnected: (
      <div>
        <div className="mb-4 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.6)]" />
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
            {labels.topConnected}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {homepage.topConnected.map((page, index) => (
            <PageChip key={page.file} page={page} index={index} />
          ))}
        </div>
      </div>
    ),

    people:
      homepage.people.length > 0 ? (
        <div>
          <div className="mb-4 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-purple-400 shadow-[0_0_10px_rgba(192,132,252,0.6)]" />
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
              {labels.people}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-2.5">
            {homepage.people.map((person, index) => (
              <PersonCard key={person.file} person={person} index={index} />
            ))}
          </div>
        </div>
      ) : null,

    recentPages: (
      <div>
        <div className="mb-4 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.6)]" />
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
            {labels.recentPages}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {homepage.recentPages.map((page, index) => {
            const borderAccent = [
              "hover:border-teal-500/50 before:bg-teal-400",
              "hover:border-amber-500/50 before:bg-amber-400",
              "hover:border-purple-500/50 before:bg-purple-400",
            ][index % 3];

            return (
              <Link
                key={page.file}
                to={`/wiki/${page.slug}`}
                className={`group relative overflow-hidden rounded-2xl bg-zinc-900/70 border border-zinc-800/80 p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:bg-zinc-900 hover:shadow-lg before:absolute before:left-0 before:top-0 before:h-full before:w-1 ${borderAccent}`}
              >
                <div className="flex items-center justify-between pl-2">
                  <p className="truncate font-display text-sm font-medium text-white group-hover:text-amber-300 transition-colors">
                    {page.title}
                  </p>
                  <ArrowUpRight className="h-3.5 w-3.5 text-zinc-600 group-hover:text-amber-400 opacity-0 group-hover:opacity-100 transition-all shrink-0" />
                </div>
                {page.summary && (
                  <p className="mt-1 line-clamp-1 pl-2 text-xs text-zinc-400">
                    {page.summary}
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    ),
  };

  return (
    <div
      className="w-full space-y-8 pt-4 sm:space-y-10 sm:pt-6 max-w-7xl mx-auto"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 4rem)" }}
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Column 1: Navigation & About */}
        <section className="space-y-6">
          {/* Table of Contents / Index Card */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.6)]" />
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                Table of Contents
              </p>
            </div>
            <Link
              to="/wiki/wiki/index"
              className="group relative overflow-hidden rounded-2xl bg-zinc-900/80 border border-zinc-800/80 p-4.5 text-left block transition-all duration-300 hover:-translate-y-0.5 hover:border-teal-500/50 hover:bg-zinc-900 hover:shadow-xl hover:shadow-teal-500/10 before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-gradient-to-b before:from-teal-400 before:to-cyan-500"
            >
              <div className="flex items-center justify-between pl-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-300 group-hover:scale-105 transition-transform">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-display text-base font-semibold text-white group-hover:text-teal-300 transition-colors">
                      Index
                    </p>
                    <p className="text-xs text-zinc-400">
                      Main table of contents
                    </p>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-zinc-500 group-hover:text-teal-400 transition-colors shrink-0" />
              </div>
            </Link>
          </div>

          {/* Personal Notes Card */}
          {homepage.latestNote && (
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                  Personal Notes
                </p>
              </div>
              <Link
                to={`/wiki/${homepage.latestNote.slug}`}
                className="group relative overflow-hidden rounded-2xl bg-zinc-900/80 border border-zinc-800/80 p-4.5 text-left block transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-500/50 hover:bg-zinc-900 hover:shadow-xl hover:shadow-amber-500/10 before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-gradient-to-b before:from-amber-400 before:to-orange-500"
              >
                <div className="flex items-center justify-between pl-2 mb-1">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300 group-hover:scale-105 transition-transform">
                      <StickyNote className="h-4 w-4" />
                    </div>
                    <p className="font-display text-base font-semibold text-white group-hover:text-amber-300 transition-colors truncate max-w-[170px]">
                      {homepage.latestNote.title}
                    </p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-zinc-500 group-hover:text-amber-400 transition-colors shrink-0" />
                </div>
                {homepage.latestNote.summary && (
                  <p className="mt-2 line-clamp-2 pl-2 text-xs text-zinc-400 leading-relaxed">
                    {homepage.latestNote.summary}
                  </p>
                )}
              </Link>
            </div>
          )}

          {/* About Fad.Wiki Card */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.6)]" />
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                About Fad.Wiki
              </p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-zinc-900/90 via-zinc-900/70 to-purple-950/20 border border-purple-500/20 p-4.5 text-xs text-zinc-300 leading-relaxed space-y-3 shadow-lg">
              <div className="flex items-center gap-2 text-purple-300 font-semibold text-sm border-b border-purple-500/20 pb-2">
                <Brain className="h-4 w-4 text-purple-400 shrink-0" />
                <span>Prof. Frehun A. Demissie (Fad)</span>
              </div>
              <p>
                Fad.Wiki is the result of{" "}
                <span className="text-purple-300 font-medium">
                  15 years of research
                </span>{" "}
                in Smart Education for Africa.
              </p>
              <p>
                The goal is to empower African future innovators and entrepreneurs by providing structured knowledge in{" "}
                <span className="text-teal-300 font-medium">STEAM-IE</span> (Science, Technology, Engineering, Arts, Mathematics for Innovation & Entrepreneurship).
              </p>
              <div className="rounded-xl bg-purple-500/10 border border-purple-500/20 p-3 text-[11px] text-purple-200">
                <span className="font-semibold block text-white mb-0.5">
                  12 Industry Sectors & 200+ Knowledge Bases
                </span>
                Organized by subsectors for Africans aiming to launch profitable ventures.
              </div>
            </div>
            <div className="mt-3 rounded-2xl bg-zinc-900/50 border border-zinc-800/60 p-3.5 text-xs text-zinc-400 leading-relaxed flex items-start gap-2.5">
              <Compass className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
              <span>
                Use the index to browse structured categories or return to your latest personal notes.
              </span>
            </div>
          </div>
        </section>

        {/* Column 2: Discover & Most Connected */}
        <section className="space-y-6">
          {sectionViews.featured}
          {sectionViews.topConnected}
          <div className="rounded-2xl bg-gradient-to-r from-teal-500/10 to-emerald-500/10 border border-teal-500/20 p-4 text-xs text-teal-200 font-medium leading-relaxed flex items-start gap-2.5">
            <Sparkles className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
            <span>
              These core articles highlight the foundational concepts powering Fad.Wiki across STEAM-IE disciplines.
            </span>
          </div>
        </section>

        {/* Column 3: Recent & People */}
        <section className="space-y-6">
          {sectionViews.recentPages}
          {sectionViews.people}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                About Updates
              </p>
            </div>
            <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800/80 p-4 text-xs text-zinc-300 leading-relaxed space-y-2.5">
              <div className="flex items-center gap-2 text-amber-300 font-semibold mb-1">
                <Zap className="h-4 w-4 text-amber-400 shrink-0" />
                <span>Continuous Additions</span>
              </div>
              <p className="text-zinc-400">
                Stay current with new knowledge additions, practical lessons, and training modules.
              </p>
              <ul className="space-y-1.5 text-zinc-400 pt-1 text-[11px]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-teal-400 shrink-0" />
                  <span>Regular practical lessons & project updates</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                  <span>STEAM-IE skills expansion via Fad.Tutor</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span>Personalized business opportunities</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Column 4: Fad Tutor & Contact */}
        <section className="space-y-6">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                Fad Tutor
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <Link
                to="/tutor/knowledge"
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900/30 to-zinc-900 border border-purple-500/30 p-4 text-left block transition-all duration-300 hover:-translate-y-0.5 hover:border-purple-500/60 hover:shadow-xl hover:shadow-purple-500/10 before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-gradient-to-b before:from-purple-400 before:to-rose-500"
              >
                <div className="flex items-center justify-between pl-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 group-hover:scale-105 transition-transform">
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-display text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">
                        Knowledge Base
                      </p>
                      <p className="text-[11px] text-zinc-400">
                        Explore curated topics
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-zinc-500 group-hover:text-purple-400 transition-colors shrink-0" />
                </div>
              </Link>

              <Link
                to="/tutor/research"
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900/30 to-zinc-900 border border-indigo-500/30 p-4 text-left block transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-500/60 hover:shadow-xl hover:shadow-indigo-500/10 before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-gradient-to-b before:from-indigo-400 before:to-purple-500"
              >
                <div className="flex items-center justify-between pl-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 group-hover:scale-105 transition-transform">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-display text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">
                        Research Assistant
                      </p>
                      <p className="text-[11px] text-zinc-400">
                        AI-powered deep insights
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-zinc-500 group-hover:text-indigo-400 transition-colors shrink-0" />
                </div>
              </Link>
            </div>
          </div>

          {/* About Fad.Tutor Card */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.6)]" />
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                About Fad.Tutor
              </p>
            </div>
            <div className="rounded-2xl bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 p-4 text-xs text-purple-200 leading-relaxed space-y-2">
              <div className="flex items-center gap-2 font-semibold text-white mb-1">
                <GraduationCap className="h-4 w-4 text-purple-400 shrink-0" />
                <span>AI Agent-Native Workspace</span>
              </div>
              <p className="text-zinc-300">
                Fad.Tutor unifies tutoring, problem solving, quiz generation, visualization, and research assistance into one extensible environment.
              </p>
            </div>
          </div>

          {/* Your Profile Card */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                Your Profile
              </p>
            </div>
            <div className="rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 p-4 text-xs text-amber-200 leading-relaxed space-y-2">
              <div className="flex items-center gap-2 font-semibold text-white mb-1">
                <UserCheck className="h-4 w-4 text-amber-400 shrink-0" />
                <span>Personalize Your Tutor</span>
              </div>
              <p className="text-zinc-300">
                Configure your business sector, interests, difficulty level, and career goals inside Fad.Tutor Settings for a tailored experience.
              </p>
            </div>
          </div>

          {/* Contact Prof. Frehun A. Demissie */}
          <div className="rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-indigo-950/40 border border-indigo-500/30 p-4.5 shadow-xl space-y-3">
            <p className="font-display text-sm font-semibold text-white flex items-center gap-2 border-b border-indigo-500/20 pb-2">
              <User className="h-4 w-4 text-indigo-400 shrink-0" />
              <span>Contact Prof. Frehun A. Demissie</span>
            </p>
            <div className="space-y-2 text-xs">
              <a
                href="https://wa.me/251911692277"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 rounded-xl bg-green-500/10 border border-green-500/25 px-3 py-2 text-green-300 hover:bg-green-500/20 hover:border-green-500/40 transition-all font-medium"
              >
                <Phone className="h-3.5 w-3.5 shrink-0" />
                <span>WhatsApp: +251-911 69 2277</span>
              </a>
              <a
                href="mailto:frehun.demissie@gmail.com"
                className="flex items-center gap-2.5 rounded-xl bg-purple-500/10 border border-purple-500/25 px-3 py-2 text-purple-300 hover:bg-purple-500/20 hover:border-purple-500/40 transition-all font-medium"
              >
                <Mail className="h-3.5 w-3.5 shrink-0" />
                <span>frehun.demissie@gmail.com</span>
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
