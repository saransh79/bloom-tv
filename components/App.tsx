"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { videos } from "@/data/videos";
import YouTubePlayer from "@/components/YouTubePlayer";
import LocalVideoPlayer from "@/components/LocalVideoPlayer";
import { copy } from "@/lib/i18n";
import type { Language, Topic, Video } from "@/types/video";

const duration = (s: number) => `${Math.ceil(s / 60)}`;
const icon = (name: string) =>
  name === "play" ? (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5.5v13l10-6.5z" />
    </svg>
  ) : name === "arrow" ? (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="m5 12 14 0m-6-6 6 6-6 6" />
    </svg>
  ) : (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M6 12h12m-6-6-6 6 6 6" />
    </svg>
  );
export default function App({ page }: { page: "home" | "videos" }) {
  const [language, setLanguage] = useState<Language>("en");
  const [topic, setTopic] = useState<Topic | "all">("all");
  const [selected, setSelected] = useState<Video | null>(null);
  const [playing, setPlaying] = useState(false);
  const [embedError, setEmbedError] = useState(false);
  const [entitled, setEntitled] = useState(false);
  const t = copy[language];
  const featured = videos.find((v) => v.featured) ?? videos[0];
  const shown = videos.filter(
    (v) => v.published && (topic === "all" || v.topic === topic),
  );
  useEffect(() => {
    const saved = localStorage.getItem("bloom-language");
    if (saved === "hi") setLanguage("hi");
    fetch("/api/razorpay/status")
      .then((r) => r.json())
      .then((data) => {
        const active = data.active === true;
        setEntitled(active);
        const requestedVideo = new URLSearchParams(window.location.search).get(
          "play",
        );
        const video = videos.find((item) => item.id === requestedVideo);
        if (active && video) {
          setSelected(video);
          setPlaying(true);
          window.setTimeout(
            () =>
              document
                .getElementById(`video-${video.id}`)
                ?.scrollIntoView({ behavior: "smooth", block: "start" }),
            0,
          );
        }
      })
      .catch(() => setEntitled(false));
    const requested = new URLSearchParams(window.location.search).get("topic");
    if (
      requested === "wellness" ||
      requested === "learning" ||
      requested === "family"
    )
      setTopic(requested);
  }, []);
  useEffect(() => {
    document.documentElement.lang = language;
    localStorage.setItem("bloom-language", language);
  }, [language]);
  function changeLanguage(next: Language) {
    setLanguage(next);
  }
  function choose(v: Video) {
    setSelected(v);
    setPlaying(true);
    setEmbedError(false);
    window.setTimeout(
      () =>
        document
          .getElementById(`video-${v.id}`)
          ?.scrollIntoView({ behavior: "smooth", block: "start" }),
      0,
    );
  }
  const card = (v: Video) => (
    <article className="video-card" id={`video-${v.id}`} key={v.id}>
      <div className="poster">
        {selected?.id === v.id && playing && v.videoUrl ? (
          <LocalVideoPlayer
            src={v.videoUrl}
            title={v.title[language]}
            preview={!entitled}
            onUnlock={() =>
              window.location.assign(`/trial?video=${encodeURIComponent(v.id)}`)
            }
            endedTitle={t.previewEnded}
            endedBody={t.previewEndedBody}
            unlockLabel={t.unlock}
          />
        ) : selected?.id === v.id && playing && !embedError ? (
          <YouTubePlayer
            videoId={(entitled ? v.youtubeId : v.previewYoutubeId)!}
            title={v.title[language]}
            preview={!entitled}
            onError={() => setEmbedError(true)}
            onUnlock={() =>
              window.location.assign(`/trial?video=${encodeURIComponent(v.id)}`)
            }
            endedTitle={t.previewEnded}
            endedBody={t.previewEndedBody}
            unlockLabel={t.unlock}
          />
        ) : selected?.id === v.id && embedError ? (
          <div className="player-fallback">
            <h3>{t.playerUnavailable}</h3>
            <p>{t.playerHelp}</p>
          </div>
        ) : (
          <>
            <Image
              src={v.thumbnailUrl}
              alt=""
              fill
              sizes="(max-width: 650px) 100vw, (max-width: 1020px) 50vw, 33vw"
              unoptimized
              loading="lazy"
            />
            <button
              className="poster-preview-button"
              onClick={() => choose(v)}
              aria-label={`${entitled ? t.full : t.preview}: ${v.title[language]}`}
            >
              {icon("play")}
              <span>{entitled ? t.full : t.preview}</span>
            </button>
            {v.durationSeconds > 0 && (
              <span className="duration">
                {duration(v.durationSeconds)} {t.duration}
              </span>
            )}
          </>
        )}
      </div>
      <div className="video-copy">
        <div className="card-meta">
          <span>{t[v.topic]}</span>
          <span className="dot">·</span>
          <span>{v.spokenLanguage === "en" ? t.english : t.hindi}</span>
        </div>
        <h3>{v.title[language]}</h3>
        <p>{v.summary[language]}</p>
      </div>
    </article>
  );
  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <Link className="brand" href="/" aria-label="Bloom home">
            <span className="brand-symbol">✿</span> bloom
            <span className="brand-dot">.tv</span>
          </Link>
          <nav className="top-nav" aria-label="Primary">
            <Link className={page === "home" ? "active" : ""} href="/">
              {t.home}
            </Link>
            <Link className={page === "videos" ? "active" : ""} href="/videos">
              {t.videos}
            </Link>
          </nav>
          <div className="language-switch" aria-label={t.language}>
            <button
              aria-pressed={language === "en"}
              onClick={() => changeLanguage("en")}
            >
              EN
            </button>
            <button
              aria-pressed={language === "hi"}
              onClick={() => changeLanguage("hi")}
            >
              हिं
            </button>
          </div>
        </div>
      </header>
      <main>
        {page === "home" ? (
          <>
            <section className="hero wrap">
              <div className="hero-copy">
                <div className="eyebrow">
                  <span className="eyebrow-icon">✦</span>
                  {t.eyebrow}
                </div>
                <h1>{t.hero}</h1>
                <p>{t.heroBody}</p>
                <Link className="primary-button" href="/videos">
                  {t.browse}
                  {icon("arrow")}
                </Link>
                <div className="hero-proof">
                  <span className="proof-avatars">
                    ✳︎ <b>✿</b> ◕
                  </span>
                  <span>{t.demo}</span>
                </div>
              </div>
              <div className="hero-visual">
                <div className="hero-orbit orbit-one" />
                <div className="hero-orbit orbit-two" />
                <div className="hero-feature">
                  <div className="hero-image">
                    <Image
                      src={featured.thumbnailUrl}
                      alt=""
                      fill
                      sizes="(max-width: 720px) 90vw, 520px"
                      unoptimized
                      priority
                    />
                    <button
                      aria-label={`${t.preview}: ${featured.title[language]}`}
                      className="hero-play"
                      onClick={() => choose(featured)}
                    >
                      {icon("play")}
                    </button>
                  </div>
                  <div className="hero-feature-info">
                    <span>{t.featured}</span>
                    <strong>{featured.title[language]}</strong>
                  </div>
                </div>
                <span className="float-flower flower-one">✿</span>
                <span className="float-flower flower-two">✦</span>
              </div>
            </section>
            <section className="topics-section wrap">
              <div className="section-heading">
                <div>
                  <span className="section-kicker">{t.explore}</span>
                  <h2>{t.topics}</h2>
                </div>
                <Link href="/videos" className="inline-link">
                  {t.seeAll}
                  {icon("arrow")}
                </Link>
              </div>
              <div className="topic-grid">
                <Link
                  href="/videos?topic=wellness"
                  className="topic-card wellness"
                >
                  <span className="topic-emoji">☀</span>
                  <strong>{t.wellness}</strong>
                  <span>{icon("arrow")}</span>
                </Link>
                <Link
                  href="/videos?topic=learning"
                  className="topic-card learning"
                >
                  <span className="topic-emoji">✦</span>
                  <strong>{t.learning}</strong>
                  <span>{icon("arrow")}</span>
                </Link>
                <Link href="/videos?topic=family" className="topic-card family">
                  <span className="topic-emoji">♡</span>
                  <strong>{t.family}</strong>
                  <span>{icon("arrow")}</span>
                </Link>
              </div>
            </section>
            <section className="featured-section">
              <div className="wrap">
                <div className="section-heading">
                  <div>
                    <span className="section-kicker">{t.explore}</span>
                    <h2>{t.featured}</h2>
                  </div>
                  <Link href="/videos" className="inline-link">
                    {t.seeAll}
                    {icon("arrow")}
                  </Link>
                </div>
                <div className="video-grid">{videos.slice(0, 3).map(card)}</div>
              </div>
            </section>
            <section className="how-section wrap">
              <div className="section-heading">
                <div>
                  <span className="section-kicker">bloom</span>
                  <h2>{t.how}</h2>
                </div>
              </div>
              <div className="steps">
                <div>
                  <span>01</span>
                  <h3>{t.step1}</h3>
                  <p>{t.step1Body}</p>
                </div>
                <div>
                  <span>02</span>
                  <h3>{t.step2}</h3>
                  <p>{t.step2Body}</p>
                </div>
                <div>
                  <span>03</span>
                  <h3>{t.step3}</h3>
                  <p>{t.step3Body}</p>
                </div>
              </div>
            </section>
          </>
        ) : (
          <>
            <section className="catalog-hero wrap">
              <div className="eyebrow">
                <span className="eyebrow-icon">✦</span>
                {t.explore}
              </div>
              <h1>{t.catalog}</h1>
              <p>{t.catalogBody}</p>
            </section>
            <section className="catalog wrap">
              <div className="filter-row" aria-label={t.topics}>
                {(["all", "wellness", "learning", "family"] as const).map(
                  (k) => (
                    <button
                      key={k}
                      className={topic === k ? "selected" : ""}
                      aria-pressed={topic === k}
                      onClick={() => setTopic(k)}
                    >
                      {t[k]}
                    </button>
                  ),
                )}
              </div>
              <p className="count">
                {shown.length} {t.result}
              </p>
              {shown.length ? (
                <div className="video-grid">{shown.map(card)}</div>
              ) : (
                <div className="empty">
                  <h2>{t.empty}</h2>
                  <p>{t.emptyHelp}</p>
                </div>
              )}
            </section>
          </>
        )}
      </main>
      <footer className="footer">
        <div className="wrap footer-inner">
          <div>
            <div className="brand">
              <span className="brand-symbol">✿</span> bloom
              <span className="brand-dot">.tv</span>
            </div>
            <p>{t.footer}</p>
          </div>
          <div className="footer-note">
            <strong>{t.demo}</strong>
            <p>{t.demoLimit}</p>
          </div>
        </div>
      </footer>
      <nav className="bottom-nav" aria-label="Primary">
        <Link className={page === "home" ? "active" : ""} href="/">
          <span>⌂</span>
          {t.home}
        </Link>
        <Link className={page === "videos" ? "active" : ""} href="/videos">
          <span>▣</span>
          {t.videos}
        </Link>
      </nav>
    </>
  );
}
