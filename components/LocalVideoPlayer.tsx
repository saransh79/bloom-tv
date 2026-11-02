"use client";

import { useEffect, useRef, useState } from "react";

export default function LocalVideoPlayer({
  src,
  title,
  preview,
  onUnlock,
  endedTitle,
  endedBody,
  unlockLabel,
}: {
  src: string;
  title: string;
  preview: boolean;
  onUnlock: () => void;
  endedTitle: string;
  endedBody: string;
  unlockLabel: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ended, setEnded] = useState(false);

  useEffect(() => {
    setEnded(false);
    const video = videoRef.current;
    if (!video) return;
    if (!preview) video.currentTime = 30;
    void video.play().catch(() => {
      // Native controls remain available when autoplay is blocked.
    });
  }, [src, preview]);

  function stopPreview() {
    const video = videoRef.current;
    if (!video || !preview || video.currentTime < 30) return;
    video.pause();
    video.currentTime = 30;
    setEnded(true);
  }

  return (
    <>
      <video
        ref={videoRef}
        src={src}
        title={title}
        controls={!ended}
        playsInline
        preload="metadata"
        onLoadedMetadata={(event) => {
          if (!preview) event.currentTarget.currentTime = 30;
        }}
        onTimeUpdate={stopPreview}
        onSeeking={stopPreview}
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
