// apps/web/src/components/QuickActions.jsx
import React from "react";

export default function QuickActions({
  onGenerateNotes,
  onGenerateQuiz,
  status,
}) {
  const isDisabled = status !== "ready";

  return (
    <div className="quick-actions-container">
      <button
        className="action-pill-btn"
        onClick={onGenerateNotes}
        disabled={isDisabled}
      >
        📝 Generate Structural Notes
      </button>
      <button
        className="action-pill-btn"
        onClick={onGenerateQuiz}
        disabled={isDisabled}
      >
        ✏️ Generate Concept Quiz
      </button>
    </div>
  );
}
