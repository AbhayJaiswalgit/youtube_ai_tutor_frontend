import React from "react";

export default function InputFooter({
  inputText,
  setInputText,
  onSend,
  status,
  isTyping,
}) {
  const isDisabled = status !== "ready" || isTyping;

  return (
    <footer className="input-footer">
      <form className="input-box" onSubmit={onSend}>
        <input
          type="text"
          placeholder={
            status === "ready"
              ? "Ask a question about this video..."
              : "Waiting for video to process..."
          }
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isDisabled}
        />
        <button
          type="submit"
          disabled={isDisabled}
          style={{ opacity: isDisabled ? 0.5 : 1 }}
        >
          ↑
        </button>
      </form>
    </footer>
  );
}
