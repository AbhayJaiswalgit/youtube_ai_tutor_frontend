// // apps/web/src/components/ChatBox.jsx
// import React from "react";
// import { ChatBubble } from "@tutor/ui";

// function formatTimestamp(seconds) {
//   const mins = Math.floor(seconds / 60);
//   const secs = Math.floor(seconds % 60);
//   return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
// }

// export default function ChatBox({
//   messages,
//   isTyping,
//   chatEndRef,
//   onTimestampClick,
// }) {
//   return (
//     <div className="chat-scroll-area">
//       <div className="chat-container-inner">
//         {messages.map((msg, idx) => {
//           const hasCitations = msg.citations && msg.citations.length > 0;

//           return (
//             <div key={idx} className={`message-row ${msg.sender}`}>
//               <ChatBubble sender={msg.sender} text={msg.text} />

//               {/* Citations render natively using global tokens */}
//               {msg.sender === "ai" && hasCitations && (
//                 <div className="sources-panel">
//                   <div className="sources-title">
//                     🔍 Referenced Verification Sources:
//                   </div>
//                   <div
//                     style={{
//                       display: "flex",
//                       flexDirection: "column",
//                       gap: "6px",
//                     }}
//                   >
//                     {msg.citations.map((cite, cIdx) => (
//                       <div key={cIdx} className="citation-item">
//                         <button
//                           className="timestamp-pill"
//                           onClick={() => onTimestampClick(cite.start_time)}
//                         >
//                           ⏱️ {formatTimestamp(cite.start_time)}
//                         </button>
//                         <span>{cite.text_snippet}</span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>
//           );
//         })}

//         {isTyping && (
//           <div
//             style={{
//               alignSelf: "flex-start",
//               color: "var(--text-muted)",
//               fontStyle: "italic",
//               fontSize: "14px",
//             }}
//           >
//             AI tutor is conceptualizing answer matrix...
//           </div>
//         )}
//         <div ref={chatEndRef} />
//       </div>
//     </div>
//   );
// }

// apps/web/src/components/ChatBox.jsx
import React from "react";
import { ChatBubble } from "@tutor/ui";

export default function ChatBox({ messages, isTyping, chatEndRef }) {
  return (
    <div className="chat-scroll-area">
      <div className="chat-container-inner">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message-row ${msg.sender}`}>
            {/* We rely entirely on the shared ChatBubble component now */}
            <ChatBubble sender={msg.sender} text={msg.text} />
          </div>
        ))}

        {isTyping && (
          <div
            style={{
              alignSelf: "flex-start",
              color: "var(--text-muted)",
              fontStyle: "italic",
              fontSize: "14px",
            }}
          >
            AI tutor is conceptualizing answer...
          </div>
        )}

        {/* Invisible div to anchor the auto-scroll */}
        <div ref={chatEndRef} />
      </div>
    </div>
  );
}
