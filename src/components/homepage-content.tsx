import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";

import { useWikiConfig } from "@/client/wiki-config";
import { type HomepageData, type PageSummary } from "@/lib/wiki-shared";
import { type HomepageSectionKey } from "@/lib/wiki-config";
import { usePersonImage } from "@/client/use-person-image";

const categoryAccents = [
  "chip-teal",
  "chip-peach",
  "chip-lavender",
];

const personAvatarAccents = [
  "bg-[var(--teal-soft)] text-[#3e6978]",
  "bg-[var(--peach-soft)] text-[#9a5a2f]",
  "bg-[var(--lavender-soft)] text-[#5b4a7a]",
];

function PersonCard({ person, index }: { person: PageSummary; index: number }) {
  const imageUrl = usePersonImage(person.title);
  const accentBg = personAvatarAccents[index % personAvatarAccents.length];
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <Link
      to={`/wiki/${person.slug}`}
      className="surface hover-lift flex flex-col items-center gap-3 rounded-2xl px-4 py-4 text-center"
    >
      <span
        className={`relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full ${accentBg} font-display text-2xl font-medium`}
      >
        {/* Fallback initial is always painted; image overlays once it loads */}
        <span aria-hidden={imageUrl !== null && imgLoaded}>{person.title.charAt(0)}</span>
        {imageUrl && (
          <img
            src={imageUrl}
            alt=""
            loading="lazy"
            decoding="async"
            onLoad={() => setImgLoaded(true)}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${imgLoaded ? "opacity-100" : "opacity-0"
              }`}
          />
        )}
      </span>
      <div className="min-w-0">
        <p className="truncate font-display text-[0.95rem] text-[var(--foreground)]">
          {person.title}
        </p>
        <p className="text-[0.7rem] font-medium text-[var(--muted-foreground)]">
          {person.backlinkCount} connections
        </p>
      </div>
    </Link>
  );
}

function PageChip({ page, index }: { page: PageSummary; index: number }) {
  const accent = categoryAccents[index % categoryAccents.length];
  return (
    <Link
      to={`/wiki/${page.slug}`}
      className={`${accent} group inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm transition-[transform,box-shadow] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_-10px_rgba(21,19,26,0.2)] active:scale-[0.97]`}
    >
      <span className="font-display text-[0.95rem]">{page.title}</span>
      <span className="rounded-full bg-white/60 px-1.5 py-0.5 text-[0.65rem] font-semibold tabular-nums">
        {page.backlinkCount}
      </span>
    </Link>
  );
}

export function HomepageContent({
  homepage,
}: {
  homepage: HomepageData;
}) {
  const config = useWikiConfig();
  const labels = config.homepage.labels;
  const orderedSections = config.homepage.sectionOrder.filter((section): section is HomepageSectionKey => {
    return section !== "people" || homepage.people.length > 0;
  });
  const midpoint = Math.ceil(orderedSections.length / 2);
  const columns = [orderedSections.slice(0, midpoint), orderedSections.slice(midpoint)];

  const sectionViews: Record<HomepageSectionKey, ReactNode> = {
    featured: homepage.featured.length > 0 ? (
      <div>
        <div className="mb-4 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[var(--peach)] shadow-[0_0_12px_var(--peach)]" />
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
            {labels.featured}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-2.5">
          {homepage.featured.map((page, index) => {
            const accentRail = [
              "before:bg-[var(--teal)]",
              "before:bg-[var(--peach)]",
              "before:bg-[var(--lavender)]",
            ][index % 3];
            return (
              <Link
                key={page.file}
                to={`/wiki/${page.slug}`}
                className={`surface hover-lift relative overflow-hidden rounded-2xl px-4 py-3.5 text-left before:absolute before:left-0 before:top-0 before:h-full before:w-1 ${accentRail}`}
              >
                <p className="truncate pl-1 font-display text-[0.95rem] text-[var(--foreground)]">
                  {page.title}
                </p>
                <p className="mt-1 line-clamp-2 pl-1 text-[0.78rem] leading-relaxed text-[var(--muted-foreground)]">
                  {page.summary}
                </p>
                <div className="mt-2 flex items-center gap-2 pl-1 text-[0.65rem] font-medium text-[var(--muted-foreground)]">
                  <span>{page.wordCount.toLocaleString()} words</span>
                  <span>·</span>
                  <span>{page.backlinkCount} backlinks</span>
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
          <span className="h-2 w-2 rounded-full bg-[var(--teal)] shadow-[0_0_12px_var(--teal)]" />
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
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
    people: homepage.people.length > 0 ? (
      <div>
        <div className="mb-4 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[var(--lavender)] shadow-[0_0_12px_var(--lavender)]" />
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
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
          <span className="h-2 w-2 rounded-full bg-[var(--peach)] shadow-[0_0_12px_var(--peach)]" />
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
            {labels.recentPages}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {homepage.recentPages.map((page, index) => {
            const accentRail = [
              "before:bg-[var(--teal)]",
              "before:bg-[var(--peach)]",
              "before:bg-[var(--lavender)]",
            ][index % 3];
            return (
              <Link
                key={page.file}
                to={`/wiki/${page.slug}`}
                className={`animate-in hover-lift surface relative overflow-hidden rounded-2xl px-5 py-4 text-left before:absolute before:left-0 before:top-0 before:h-full before:w-1 ${accentRail} stagger-${Math.min(index + 1, 8)}`}
              >
                <p className="truncate pl-1 font-display text-[1.05rem] text-[var(--foreground)]">
                  {page.title}
                </p>
                <p className="mt-1 line-clamp-1 pl-1 text-[0.78rem] text-[var(--muted-foreground)]">
                  {page.summary}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    ),
  };

  return (
    <div
      className="w-full space-y-10 pt-4 sm:space-y-12 sm:pt-6"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 4rem)" }}
    >
      <div className="grid grid-cols-1 gap-8 sm:gap-10 lg:grid-cols-4">
        {/* Column 1: Navigation */}
        <section className="space-y-8 sm:space-y-10">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[var(--teal)] shadow-[0_0_12px_var(--teal)]" />
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                Table of Contents
              </p>
            </div>
            <Link
              to="/wiki/wiki/index"
              className="surface hover-lift relative overflow-hidden rounded-2xl px-5 py-4 text-left block before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-[var(--teal)]"
            >
              <p className="truncate pl-1 font-display text-[1.05rem] text-[var(--foreground)]">
                Index
              </p>
              <p className="mt-1 line-clamp-1 pl-1 text-[0.78rem] text-[var(--muted-foreground)]">
                Main table of contents
              </p>
            </Link>
          </div>

          {homepage.latestNote && (
            <div>
              <div className="mb-4 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[var(--peach)] shadow-[0_0_12px_var(--peach)]" />
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                  Personal Notes
                </p>
              </div>
              <Link
                to={`/wiki/${homepage.latestNote.slug}`}
                className="surface hover-lift relative overflow-hidden rounded-2xl px-5 py-4 text-left block before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-[var(--peach)]"
              >
                <p className="truncate pl-1 font-display text-[1.05rem] text-[var(--foreground)]">
                  {homepage.latestNote.title}
                </p>
                <p className="mt-1 line-clamp-1 pl-1 text-[0.78rem] text-[var(--muted-foreground)]">
                  {homepage.latestNote.summary}
                </p>
              </Link>
            </div>
          )}

          <div>
            <div className="mb-4 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[var(--teal)] shadow-[0_0_12px_var(--teal)]" />
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                About Fad.Wiki
              </p>
            </div>
            <div className="surface rounded-2xl px-4 py-3.5 text-[0.85rem] text-[var(--muted-foreground)] leading-relaxed">
              Fad.Wiki is a personal project of Prof. Frehun A. Demissie (Fad) and it is the result of 15 years of reseach in
              Smart Education for Africa.
              <br />
              <br />
              The goal of the project is to help African future innovators and entrepreneurs by providing relevant
              knowledge and training in the field of STEAM-IE
              (Science, Technology, Engineering, Arts and Mathematics for Innovation and Entrepreneurship).

              <br />
              <br />
              The knowledge base and the trainings in Fad.Wiki are organized by industry in to 12 sectors
              and then by subsectors per industry. There are 200+ (and growing) business oriented
              knowledge bases and trainings for Africans who want to stat a profitable business.
            </div>
            <br />
            <div className="surface font-semibold rounded-2xl px-4 py-3.5 text-[0.80rem] text-[var(--muted-foreground)] leading-relaxed">

              Use the index to browse all structured categories,
              or jump straight back into your most recently edited personal note to continue your work.

            </div>
          </div>
        </section>

        {/* Column 2: Discover & Most Connected */}
        <section className="space-y-8 sm:space-y-10">
          {sectionViews.featured}
          {sectionViews.topConnected}
          <div className="surface font-bold rounded-2xl px-4 py-3.5 text-[0.70rem] text-[var(--muted-foreground)] leading-relaxed">

            These are the ideas behind Fad.Wiki.

            Read these articles to learn more about
            core concepts of STEAM-IE.

          </div>
        </section>

        {/* Column 3: Recent & People */}
        <section className="space-y-8 sm:space-y-10">
          {sectionViews.recentPages}
          {sectionViews.people}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[var(--lavender)] shadow-[0_0_12px_var(--lavender)]" />
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                About Updates
              </p>
            </div>
            <div className="surface rounded-2xl px-4 py-3.5 text-[0.85rem] text-[var(--muted-foreground)] leading-relaxed">
              Stay up to date with the latest additions to the knowledge base
              and discover new ideas within the network.
              <br />
              <br />
              New projects for practical lessons are added regularly.
              <br />
              <br />
              Explore new skills and trainings in STEAM-IE through Fad.Tutor.
              <br />
              <br />
              New business opportunities and ideas matching your pofile are added regularly.
            </div>
          </div>
        </section>

        {/* Column 4: Fad Tutor */}
        <section className="space-y-8 sm:space-y-10">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[var(--peach)] shadow-[0_0_12px_var(--peach)]" />
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                Fad Tutor
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <Link
                to="/tutor/knowledge"
                className="surface hover-lift relative overflow-hidden rounded-2xl px-5 py-4 text-left block before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-[var(--peach)]"
              >
                <p className="truncate pl-1 font-display text-[1.05rem] text-[var(--foreground)]">
                  Knowledge Base
                </p>
                <p className="mt-1 line-clamp-1 pl-1 text-[0.78rem] text-[var(--muted-foreground)]">
                  Explore curated topics
                </p>
              </Link>
              <Link
                to="/tutor/research"
                className="surface hover-lift relative overflow-hidden rounded-2xl px-5 py-4 text-left block before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-[var(--lavender)]"
              >
                <p className="truncate pl-1 font-display text-[1.05rem] text-[var(--foreground)]">
                  Research Assistant
                </p>
                <p className="mt-1 line-clamp-1 pl-1 text-[0.78rem] text-[var(--muted-foreground)]">
                  AI-powered deep insights
                </p>
              </Link>
            </div>
          </div>

          <div>
            <div className="mb-4 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[var(--teal)] shadow-[0_0_12px_var(--teal)]" />
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                About Fad.Tutor
              </p>
            </div>
            <div className="surface rounded-2xl px-4 py-3.5 text-[0.85rem] text-[var(--muted-foreground)] leading-relaxed">
              Fad.TUtor is an AI agent-native learning workspace that connects tutoring, problem solving, quiz generation,
              research, visualization, and mastery practice in one extensible system.
              <br />
              <br />
              Fad Tutor also provides AI-driven assistance to help you explore the
              knowledge base and conduct in-depth research efficiently.
            </div>
          </div>
          <div>
            <div className="mb-4 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[var(--teal)] shadow-[0_0_12px_var(--teal)]" />
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                Your Profile
              </p>
            </div>
            <div className="surface rounded-2xl px-4 py-3.5 text-[0.85rem] text-[var(--muted-foreground)] leading-relaxed">
              Inside the settings of Fad.TUtor page, you can personalize your own tutor by
              selecting the type of business sector, your interest and your  future career and
              business plans.
              <br />
              <br />
              Make sure setting your profile is the first thing you do while exploring Fad.Wiki.
            </div>
            <br />

            <div className="surface font-semibold rounded-2xl px-4 py-3.5 text-[0.85rem] text-[var(--muted-foreground)] leading-relaxed">

              Contact Prof. Frehun A. Demissie
              <br />
              <br />
              WhatsApp : +251-911 69 2277.
              <br />
              E-mail : frehun.demissie@gmail.com

            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
