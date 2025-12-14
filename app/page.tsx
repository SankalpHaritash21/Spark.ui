"use client";

import { useState, useEffect, useRef } from "react";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
} from "@codesandbox/sandpack-react";
import { dracula } from "@codesandbox/sandpack-themes";
import {
  Send,
  Bot,
  User,
  Loader2,
  Code2,
  MonitorPlay,
  Sparkles,
} from "lucide-react";

export default function Home() {
  // --- STATE ---
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("preview");
  const [messages, setMessages] = useState([
    {
      role: "system",
      content: "Hello! I'm Spark. What can I build for you today?",
    },
  ]);

  // Fake "Agent Steps" to make it feel like Bolt
  const [steps, setSteps] = useState<string[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const [generatedCode, setGeneratedCode] = useState(`import React from 'react';
import { Rocket } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-lg">
        <div className="mx-auto w-24 h-24 bg-blue-600/20 rounded-full flex items-center justify-center mb-6 ring-1 ring-blue-500/50">
          <Rocket className="w-12 h-12 text-blue-400" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-emerald-400 text-transparent bg-clip-text">
          Ready to Build
        </h1>
        <p className="text-slate-400 text-lg">
          Describe your dream app in the chat, and I'll generate the code instantly.
        </p>
      </div>
    </div>
  );
}`);

  // Auto-scroll chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages, steps]);

  // --- API HANDLER ---
  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    const userMessage = { role: "user", content: prompt };
    setMessages((prev) => [...prev, userMessage]);
    setPrompt("");
    setIsLoading(true);
    setSteps(["Analyzing request...", "Planning components..."]);

    try {
      setTimeout(
        () => setSteps((s) => [...s, "Generating React code..."]),
        1000
      );

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userMessage.content }),
      });

      const data = await response.json();

      if (data.code) {
        setSteps((s) => [...s, "Refining styles..."]);
        setTimeout(() => {
          setGeneratedCode(data.code);
          setMessages((prev) => [
            ...prev,
            {
              role: "system",
              content: "I've built that for you! Check the preview.",
            },
          ]);
          setActiveTab("preview");
          setIsLoading(false);
          setSteps([]);
        }, 800);
      } else {
        throw new Error(data.error || "Unknown error");
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: "system", content: "❌ Something went wrong." },
      ]);
      setIsLoading(false);
      setSteps([]);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#0a0a0a] text-zinc-100 font-sans overflow-hidden">
      {/* --- SIDEBAR (Chat) --- */}
      <div className="w-[400px] flex flex-col border-r border-zinc-800 bg-[#0f0f10]">
        {/* Header */}
        <div className="h-14 border-b border-zinc-800 flex items-center px-4 gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">Spark.new</span>
        </div>

        {/* Chat History */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth"
        >
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${
                msg.role === "user" ? "flex-row-reverse" : ""
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === "user" ? "bg-zinc-700" : "bg-blue-600/20"
                }`}
              >
                {msg.role === "user" ? (
                  <User size={16} />
                ) : (
                  <Bot size={16} className="text-blue-400" />
                )}
              </div>

              {/* Bubble */}
              <div
                className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-zinc-800 text-zinc-100 rounded-tr-sm"
                    : "bg-transparent text-zinc-300 pl-0 pt-1"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {/* Loading Steps */}
          {isLoading && (
            <div className="flex flex-col gap-2 ml-11">
              {steps.map((step, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-xs text-zinc-500 animate-pulse"
                >
                  <Loader2 className="w-3 h-3 animate-spin" />
                  {step}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-zinc-800 bg-[#0f0f10]">
          <div className="relative bg-zinc-900 border border-zinc-700 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-blue-500/50 transition-all">
            <textarea
              className="w-full bg-transparent text-sm text-zinc-200 p-3 pr-12 outline-none resize-none placeholder:text-zinc-600 h-[100px]"
              placeholder="Describe your app..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
            />
            <button
              onClick={handleGenerate}
              disabled={isLoading || !prompt.trim()}
              className="absolute bottom-3 right-3 p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
          <div className="text-center mt-2">
            <span className="text-xs text-zinc-600">
              Powered by Gemini • Spark UI
            </span>
          </div>
        </div>
      </div>

      {/* --- MAIN WORKSPACE --- */}
      <div className="flex-1 flex flex-col h-full bg-[#0a0a0a] relative">
        <SandpackProvider
          template="react"
          theme={dracula}
          files={{ "/App.js": generatedCode }}
          options={{
            externalResources: ["https://cdn.tailwindcss.com"],
          }}
          customSetup={{
            dependencies: {
              "lucide-react": "latest",
              recharts: "latest",
              "framer-motion": "latest",
            },
          }}
        >
          {/* Header / Tabs */}
          <div className="h-14 border-b border-zinc-800 flex items-center justify-between px-4 bg-[#0a0a0a]">
            <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800">
              <button
                onClick={() => setActiveTab("preview")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  activeTab === "preview"
                    ? "bg-zinc-800 text-white shadow-sm"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <MonitorPlay size={14} />
                Preview
              </button>
              <button
                onClick={() => setActiveTab("code")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  activeTab === "code"
                    ? "bg-zinc-800 text-white shadow-sm"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <Code2 size={14} />
                Code
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 px-3 py-1.5 bg-zinc-900 rounded-md border border-zinc-800">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isLoading ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
                  }`}
                />
                {isLoading ? "Building..." : "Ready"}
              </div>
            </div>
          </div>

          {/* Editor Content - FIXED HEIGHT SECTION */}
          <div className="flex-1 h-[calc(100vh-3.5rem)] overflow-hidden">
            <SandpackLayout className="!h-full !w-full !rounded-none !border-none !bg-[#0a0a0a]">
              {activeTab === "code" && (
                <SandpackCodeEditor
                  showTabs={false}
                  showLineNumbers
                  showInlineErrors
                  wrapContent
                  style={{ height: "100%", fontFamily: "monospace" }}
                />
              )}

              {activeTab === "preview" && (
                <SandpackPreview
                  showNavigator={true}
                  showRefreshButton={true}
                  showOpenInCodeSandbox={false}
                  className="!h-full !w-full"
                  style={{
                    height: "100%",
                    border: "none",
                  }}
                />
              )}
            </SandpackLayout>
          </div>
        </SandpackProvider>
      </div>
    </div>
  );
}
