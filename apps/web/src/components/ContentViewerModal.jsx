import React from "react";

export default function ContentViewerModal({ isOpen, onClose, data, type }) {
  if (!isOpen || !data) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 2000 }}>
      <div
        className="auth-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "700px",
          maxHeight: "80vh",
          overflowY: "auto",
          padding: "32px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
            borderBottom: "1px solid var(--border-color)",
            paddingBottom: "12px",
          }}
        >
          <h2 style={{ fontSize: "20px", fontWeight: "600" }}>
            {type === "notes" ? "📝 Study Notes" : "🎯 Assessment Quiz"}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "20px",
              cursor: "pointer",
              color: "var(--text-muted)",
            }}
          >
            ✕
          </button>
        </div>

        {type === "notes" &&
          data.content &&
          data.content.map((section, idx) => (
            <div key={idx} style={{ marginBottom: "20px" }}>
              <h3
                style={{
                  fontSize: "16px",
                  color: "var(--btn-primary)",
                  marginBottom: "8px",
                }}
              >
                {section.heading}
              </h3>
              <ul
                style={{
                  paddingLeft: "20px",
                  color: "var(--text-main)",
                  lineHeight: "1.6",
                  fontSize: "14px",
                }}
              >
                {section.bullet_points.map((point, pIdx) => (
                  <li key={pIdx} style={{ marginBottom: "6px" }}>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          ))}

        {type === "quizzes" &&
          data.questions &&
          data.questions.map((q, idx) => (
            <div
              key={idx}
              style={{
                marginBottom: "24px",
                background: "var(--bg-sidebar)",
                padding: "16px",
                borderRadius: "8px",
                border: "1px solid var(--border-color)",
              }}
            >
              <p
                style={{
                  fontWeight: "600",
                  marginBottom: "12px",
                  fontSize: "15px",
                }}
              >
                {idx + 1}. {q.question}
              </p>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  marginBottom: "12px",
                }}
              >
                {q.options.map((opt, oIdx) => (
                  <div
                    key={oIdx}
                    style={{
                      fontSize: "14px",
                      padding: "8px 12px",
                      background: "var(--bg-main)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "6px",
                    }}
                  >
                    {String.fromCharCode(65 + oIdx)}. {opt}
                  </div>
                ))}
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: "var(--btn-primary)",
                  background: "rgba(16, 163, 127, 0.1)",
                  padding: "8px",
                  borderRadius: "4px",
                }}
              >
                <strong>Answer:</strong> {q.correct_answer} <br />
                <span
                  style={{
                    color: "var(--text-muted)",
                    fontStyle: "italic",
                    marginTop: "4px",
                    display: "block",
                  }}
                >
                  {q.explanation}
                </span>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
