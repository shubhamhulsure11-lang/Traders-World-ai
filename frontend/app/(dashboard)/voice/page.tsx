"use client";

import React, { useState } from "react";
import { Mic, MicOff, Volume2, Sparkles, Activity } from "lucide-react";

export default function VoicePage() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState(
    "Voice Copilot Ready. Press the microphone button and talk to your mentor."
  );

  const toggleVoice = () => {
    if (!isListening) {
      if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
        alert("Speech Recognition API is not supported in this browser. Use Chrome or Edge.");
        return;
      }
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript("Listening...");
      };

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
      };

      recognition.onend = async () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      setIsListening(false);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center space-y-6 max-w-2xl mx-auto text-center">
      <div className="bg-surface border border-border p-8 rounded-2xl w-full shadow-2xl space-y-6">
        <div className="inline-flex items-center space-x-2 bg-accent/10 border border-accent/30 text-accent px-3 py-1 rounded-full text-xs font-semibold">
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          <span>Web Speech API Native Engine (100% Free)</span>
        </div>

        <h1 className="text-2xl font-bold text-white">Voice AI Copilot</h1>
        <p className="text-xs text-gray-400">
          Hands-free real-time conversation while analyzing your charts.
        </p>

        <div className="py-6 flex justify-center">
          <button
            onClick={toggleVoice}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all transform hover:scale-105 shadow-xl ${
              isListening
                ? "bg-danger animate-pulse text-white shadow-danger/50"
                : "bg-accent hover:bg-accentHover text-white shadow-accent/40"
            }`}
          >
            {isListening ? <MicOff className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
          </button>
        </div>

        {transcript && (
          <div className="bg-card border border-border p-3 rounded-xl text-xs text-gray-300 font-mono">
            "{transcript}"
          </div>
        )}

        <div className="bg-card/60 border border-border p-4 rounded-xl text-left space-y-2">
          <div className="flex items-center space-x-2 text-accent text-xs font-semibold">
            <Volume2 className="w-4 h-4" />
            <span>AI Mentor Response:</span>
          </div>
          <p className="text-xs text-gray-200 leading-relaxed">{response}</p>
        </div>
      </div>
    </div>
  );
}
