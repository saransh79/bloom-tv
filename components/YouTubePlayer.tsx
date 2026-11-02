"use client";
import { useEffect, useRef, useState } from "react";

type Player = {
  getCurrentTime: () => number;
  pauseVideo: () => void;
  playVideo: () => void;
  destroy: () => void;
};
type YouTubeApi = {
  Player: new (
    element: HTMLElement,
    options: {
      events: {
        onReady?: (event: { target: Player }) => void;
        onStateChange?: (event: { data: number; target: Player }) => void;
        onError?: () => void;
      };
    },
  ) => Player;
};
declare global {
  interface Window {
    YT?: YouTubeApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}
let apiPromise: Promise<YouTubeApi> | null = null;
function loadApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (apiPromise) return apiPromise;
  apiPromise = new Promise<YouTubeApi>((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      if (window.YT?.Player) resolve(window.YT);
      else reject(new Error("YouTube player unavailable"));
    };
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.onerror = () => reject(new Error("YouTube player unavailable"));
    document.head.appendChild(script);
  });
  return apiPromise;
}
export default function YouTubePlayer({
  videoId,
  title,
  preview,
  onError,
  onUnlock,
  endedTitle,
  endedBody,
  unlockLabel,
}: {
  videoId: string;
  title: string;
  preview: boolean;
  onError: () => void;
  onUnlock: () => void;
  endedTitle: string;
  endedBody: string;
  unlockLabel: string;
}) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const errorRef = useRef(onError);
  errorRef.current = onError;
  const [ended, setEnded] = useState(false);
  useEffect(() => {
    setEnded(false);
    let cancelled = false;
    let player: Player | undefined;
    let timer: ReturnType<typeof setInterval> | undefined;
    function finish() {
      if (cancelled || !preview) return;
      player?.pauseVideo();
      setEnded(true);
    }
    loadApi()
      .then((YT) => {
        if (cancelled || !frameRef.current) return;
        player = new YT.Player(frameRef.current, {
          events: {
            onStateChange: (event) => {
              if (preview && event.data === 0) finish();
            },
            onError: () => errorRef.current(),
          },
        });
        timer = setInterval(() => {
          if (!preview || !player || cancelled) return;
          try {
            if (player.getCurrentTime() >= 29.8) finish();
          } catch {}
        }, 250);
      })
      .catch(() => {
        if (!cancelled) errorRef.current();
      });
    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
      try {
        player?.destroy();
      } catch {}
    };
  }, [videoId, preview]);
  const origin =
    typeof window === "undefined"
      ? ""
      : `&origin=${encodeURIComponent(window.location.origin)}`;
  return (
    <>
      <iframe
        key={`${videoId}-${preview}`}
        ref={frameRef}
        title={title}
        src={`https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1&rel=0&playsinline=1${preview ? "&end=30" : "&start=30"}${origin}`}
        allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
        onError={() => errorRef.current()}
      />
      {ended && (
        <div className="preview-curtain" role="status">
          <h3>{endedTitle}</h3>
          <p>{endedBody}</p>
          <button className="primary-button" onClick={onUnlock}>
            {unlockLabel}
          </button>
        </div>
      )}
    </>
  );
}
