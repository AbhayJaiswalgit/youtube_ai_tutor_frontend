import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@tutor/api";

export function useChatSession({ currentUser, onAuthRequired }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [status, setStatus] = useState("idle");
  const [videoId, setVideoId] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [playerTime, setPlayerTime] = useState(0);
  const pollRef = useRef(null);

  const resetChatState = useCallback(() => {
    setMessages([]);
    setInputText("");
    setIsTyping(false);
    setSessionId(null);
    setStatus("idle");
    setVideoId(null);
    setVideoUrl("");
    setPlayerTime(0);
  }, []);

  const clearPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearPolling();
  }, [clearPolling]);

  const initializeVideoPipeline = useCallback(
    async (urlToProcess) => {
      const targetUrl = urlToProcess || videoUrl;
      const extractedId = targetUrl.match(
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/,
      );
      const nextVideoId = extractedId?.[1] || null;

      if (!nextVideoId) {
        alert("Please provide a valid YouTube reference link.");
        return;
      }

      clearPolling();
      setVideoId(nextVideoId);
      setVideoUrl(targetUrl);
      setStatus("processing");
      setMessages([]);
      setSessionId(null);
      setPlayerTime(0);

      try {
        await api.processVideo(targetUrl);

        pollRef.current = setInterval(async () => {
          try {
            const res = await api.getVideoStatus(nextVideoId);
            if (res.data.processing_status === "completed") {
              clearPolling();
              setStatus("ready");
              setMessages([
                {
                  sender: "ai",
                  text: "Ask anything about the video!",
                  citations: [],
                },
              ]);
            } else if (res.data.processing_status === "failed") {
              clearPolling();
              setStatus("error");
              setMessages([
                {
                  sender: "ai",
                  text: "This video cannot be processed. Please ensure the video has standard closed captions or subtitles available.",
                  citations: [],
                },
              ]);
            }
          } catch (err) {
            console.error("Status synchronization check failed", err);
            clearPolling();
            setStatus("error");
          }
        }, 2000);
      } catch (error) {
        clearPolling();
        setStatus("error");
        setMessages([
          {
            sender: "ai",
            text: "This video cannot be processed. Please ensure the video has standard closed captions or subtitles available.",
            citations: [],
          },
        ]);
      }
    },
    [clearPolling, videoUrl],
  );

  const sendMessage = useCallback(
    async (e) => {
      e.preventDefault();
      if (!inputText.trim() || status !== "ready") return;
      if (!currentUser) {
        if (onAuthRequired) onAuthRequired();
        return;
      }

      const userMessage = inputText;
      setInputText("");
      setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
      setIsTyping(true);

      try {
        const response = await api.askQuestion({
          video_id: videoId,
          message: userMessage,
          session_id: sessionId,
        });

        if (!sessionId) {
          setSessionId(response.data.session_id);
        }

        setMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            text: response.data.answer,
            citations: response.data.citations || [],
          },
        ]);
      } catch (error) {
        setMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            text: "Authorization session validation checked context error.",
            citations: [],
          },
        ]);
      } finally {
        setIsTyping(false);
      }
    },
    [currentUser, inputText, onAuthRequired, sessionId, status, videoId],
  );

  const handleLoadSession = useCallback(async (pastSessionId, pastVideoId) => {
    setStatus("processing");
    setVideoId(pastVideoId);
    setSessionId(pastSessionId);
    setVideoUrl(`https://youtube.com/watch?v=${pastVideoId}`);

    try {
      const response = await api.getSessionMessages(pastSessionId);
      const formattedMessages = response.data.map((msg) => {
        const backendSender = String(msg.sender ?? msg.role ?? "")
          .trim()
          .toLowerCase();

        return {
          sender:
            backendSender === "user" || backendSender === "human"
              ? "user"
              : "ai",
          text: msg.content,
          citations: msg.citations || [],
        };
      });

      setMessages(formattedMessages);
      setStatus("ready");
    } catch (err) {
      console.error("Failed to load session", err);
      alert("Failed to load chat history. Ensure you are logged in.");
      setStatus("idle");
    }
  }, []);

  return {
    messages,
    setMessages,
    inputText,
    setInputText,
    isTyping,
    setIsTyping,
    sessionId,
    setSessionId,
    status,
    setStatus,
    videoId,
    setVideoId,
    videoUrl,
    setVideoUrl,
    playerTime,
    setPlayerTime,
    initializeVideoPipeline,
    sendMessage,
    handleLoadSession,
    resetChatState,
    clearPolling,
  };
}
