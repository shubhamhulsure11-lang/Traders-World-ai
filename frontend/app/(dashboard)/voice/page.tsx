"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, Sparkles, Activity, BookOpen } from "lucide-react";

export default function VoicePage() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState(
    "Voice Copilot Ready. Press the microphone button and speak your setup or question."
  );
  const [citations, setCitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const recognitionRef = useRef<any>(null);

  const speakText = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    // Clean markdown hashes/stars before speaking
    const cleanText = text.replace(/[#*`_]/g, "").trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const processVoiceInput = async (userSpokenText: string) => {
    if (!userSpokenText.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/v1/voice/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_message: userSpokenText,
          user_id: "default_user",
          conversation_id: "voice_session",
        }),
      });

      if (!res.ok) throw new Error("Voice process error");
      const data = await res.json();

      setResponse(data.text);
      setCitations(data.citations || []);
      speakText(data.text);
    } catch (e) {
      setResponse("⚠️ Connection error reaching voice AI backend.");
    } finally {
      setLoading(false);
    }
  };

  const toggleVoice = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Speech Recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript("Listening for your voice...");
    };

    recognition.onresult = (event: any) => {
      const current = event.results[0][0].transcript;
      setTranscript(current);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (transcript && transcript !== "Listening for your voice...") {
        processVoiceInput(transcript);
      }
    };

    recognition.onerror = (err: any) => {
      console.error("Speech recognition error:", err);
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <div className="h-full flex flex-col items-center justify-center space-y-6 max-w-2xl mx-auto text-center">
      <div className="bg-surface border border-border p-8 rounded-2xl w-full shadow-2xl space-y-6">
        <div className="inline-flex items-center space-x-2 bg-accent/10 border border-accent/30 text-accent px-3 py-1 rounded-full text-xs font-semibold">
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          <span>Web Speech API + Gemini AI Voice Copilot</span>
        </div>

        <h1 className="text-2xl font-bold text-white">Hands-Free AI Voice Copilot</h1>
        <p className="text-xs text-gray-400">
          Speak your setups naturally while analyzing charts. The AI mentor speaks back out loud.
        </p>

        <div className="py-6 flex justify-center">
          <button
            onClick={toggleVoice}
            className={`w-28 h-28 rounded-full flex items-center justify-center transition-all transform hover:scale-105 shadow-2xl ${
              isListening
                ? "bg-danger animate-pulse text-white shadow-danger/50 ring-4 ring-danger/30"
                : isSpeaking
                ? "bg-success animate-pulse text-white shadow-success/50 ring-4 ring-success/30"
                : "bg-accent hover:bg-accentHover text-white shadow-accent/40"
            }`}
          >
            {isListening ? (
              <MicOff className="w-12 h-12" />
            ) : (
              <Mic className="w-12 h-12" />
            )}
          </button>
        </div>

        <div className="text-xs font-mono">
          {isListening && <span className="text-danger font-bold">🔴 LISTENING NOW...</span>}
          {isSpeaking && <span className="text-success font-bold">🔊 AI MENTOR SPEAKING...</span>}
          {loading && <span className="text-accent font-bold">⚡ THINKING & RAG RETRIEVAL...</span>}
        </div>

        {transcript && (
          <div className="bg-card border border-border p-3 rounded-xl text-xs text-gray-200 font-mono">
            "{transcript}"
          </div>
        )}

        <div className="bg-card/60 border border-border p-4 rounded-xl text-left space-y-3">
          <div className="flex items-center justify-between border-b border-border/50 pb-2">
            <div className="flex items-center space-x-2 text-accent text-xs font-semibold">
              <Volume2 className="w-4 h-4" />
              <span>AI Mentor Response:</span>
            </div>
            {isSpeaking && (
              <button
                onClick={() => window.speechSynthesis.cancel()}
                className="text-[10px] text-danger hover:underline font-mono"
              >
                Stop Audio
              </button>
            )}
          </div>

          <p className="text-xs text-gray-200 leading-relaxed whitespace-pre-wrap">{response}</p>

          {citations.length > 0 && (
            <div className="pt-2 border-t border-border/40 text-[10px] text-gray-400 space-y-1">
              <div className="flex items-center space-x-1 font-semibold text-accent">
                <BookOpen className="w-3 h-3" />
                <span>RAG CITED SOURCES:</span>
              </div>
              {citations.map((c, i) => (
                <div key={i} className="bg-background/50 px-2 py-1 rounded font-mono border border-border/40">
                  • {c.label} ({c.source})
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
