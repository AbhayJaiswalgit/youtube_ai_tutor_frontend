// apps/web/src/components/VideoHeader.jsx
import React, { useEffect, useRef } from "react";

export default function VideoHeader({
  videoId,
  status,
  playerTime,
  isVideoExpanded,
  onToggleExpanded,
}) {
  const iframeRef = useRef(null);

  // Mentor Note: Listen for playerTime changes and inject a seek command
  // Also re-seek when layout toggles to restore playback position after component remount
  useEffect(() => {
    if (
      iframeRef.current &&
      iframeRef.current.contentWindow &&
      playerTime > 0
    ) {
      console.log(
        `[VideoPlayer API] Seeking dynamically to: ${playerTime}s without reloading`,
      );

      // We use postMessage to talk to the YouTube player securely
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({
          event: "command",
          func: "seekTo",
          args: [playerTime, true], // true allows seeking ahead of buffered video
        }),
        "*",
      );

      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({
          event: "command",
          func: "playVideo",
          args: [],
        }),
        "*",
      );
    }
  }, [playerTime, isVideoExpanded]);

  return (
    <header className="video-header">
      {!videoId && (
        <div className="empty-state-header">
          <h2>📺 Fixed Video Interface</h2>
          <p>Paste a video link on the home screen to initialize.</p>
        </div>
      )}

      {videoId && status === "processing" && (
        <div className="processing-state">
          <div className="processing-spinner"></div>
          <h3>⚙️ Analyzing Transcript & Building AI Memory...</h3>
        </div>
      )}

      {/* Notice we removed 'start=${playerTime}' from the src to prevent reloading */}
      {videoId && (status === "ready" || status === "error") && (
        <div className="yt-player-container">
          <iframe
            ref={iframeRef}
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=1`}
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
            title="YouTube Video Player"
          ></iframe>

          {/* Expand/Collapse Button - Top Left of Video */}
          <button
            className="expand-video-btn"
            onClick={onToggleExpanded}
            title={isVideoExpanded ? "Exit split view" : "Enable split view"}
            aria-label={
              isVideoExpanded ? "Exit split view" : "Enable split view"
            }
          >
            {isVideoExpanded ? "Exit Split Screen" : "Split Screen"}
          </button>
        </div>
      )}
    </header>
  );
}
