"use client";

import { useState } from "react";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
} from "@codesandbox/sandpack-react";
import { dracula } from "@codesandbox/sandpack-themes";

export default function Home() {
  // --- STATE MANAGEMENT ---
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("preview"); // New: Tab State
  const [generatedCode, setGeneratedCode] =
    useState(`export default function App() {
  return (
    <div className="p-10 text-center font-sans">
      <h1 className="text-3xl font-bold mb-4">👋 Ready to Build</h1>
      <p className="text-gray-600">Describe your UI on the left to begin.</p>
    </div>
  );
}`);

  // --- API HANDLER ---
  const handleGenerate = async () => {
    if (!prompt) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (data.code) {
        setGeneratedCode(data.code);
        setActiveTab("preview"); // Switch to preview automatically on success
      } else {
        alert("Error: " + JSON.stringify(data));
      }
    } catch (error) {
      console.error("Error generating code:", error);
      alert("Failed to connect to server");
    } finally {
      setIsLoading(false);
    }
  };

  // --- RENDER ---
  return (
    <div className="flex h-screen w-full bg-gray-900 text-white overflow-hidden">
      {/* --- LEFT SIDEBAR (CHAT) --- */}
      <div className="w-[400px] flex flex-col border-r border-gray-800 bg-gray-900 flex-shrink-0">
        {/* Header */}
        <div className="p-4 border-b border-gray-800 font-bold text-xl flex items-center gap-2">
          ⚡ Spark.ui
        </div>

        {/* Chat History (Flex-1 allows this to grow and scroll) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="bg-gray-800 p-3 rounded-lg text-sm text-gray-300">
            Welcome! Describe the website you want to build, and I&apos;ll
            generate it.
          </div>
          {/* You can map through a 'messages' array here in the future */}
        </div>

        {/* Input Area (Fixed at bottom) */}
        <div className="p-4 bg-gray-900 border-t border-gray-800">
          <textarea
            className="w-full bg-gray-800 text-white p-3 rounded-md outline-none resize-none border border-gray-700 focus:border-blue-500 text-sm"
            rows={3}
            placeholder="e.g. A landing page for a coffee shop..."
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
            disabled={isLoading}
            className={`mt-3 w-full font-bold py-2 px-4 rounded transition-colors ${
              isLoading
                ? "bg-gray-700 cursor-not-allowed text-gray-400"
                : "bg-blue-600 hover:bg-blue-500 text-white"
            }`}
          >
            {isLoading ? "Thinking..." : "Generate Website"}
          </button>
        </div>
      </div>

      {/* --- RIGHT MAIN AREA (SANDPACK) --- */}
      <div className="flex-1 flex flex-col h-full relative">
        <SandpackProvider
          template="react"
          theme={dracula}
          files={{
            "/App.js": generatedCode,
          }}
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
          {/* Custom Tab Bar */}
          <div className="h-14 border-b border-gray-800 flex items-center justify-between px-4 bg-gray-900">
            <div className="flex gap-2 bg-gray-800 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab("preview")}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  activeTab === "preview"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-400 hover:text-white hover:bg-gray-700"
                }`}
              >
                Preview UI
              </button>
              <button
                onClick={() => setActiveTab("code")}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  activeTab === "code"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-400 hover:text-white hover:bg-gray-700"
                }`}
              >
                Code Editor
              </button>
            </div>
            {/* Optional: Status Indicator */}
            <div className="text-xs text-gray-500">
              {isLoading ? "Generating..." : "Ready"}
            </div>
          </div>

          {/* Sandpack Content Area */}
          <div className="flex-1 h-full overflow-hidden relative">
            <SandpackLayout
              style={{ height: "100%", border: "none", borderRadius: 0 }}
            >
              {activeTab === "code" && (
                <SandpackCodeEditor
                  showTabs
                  showLineNumbers
                  showInlineErrors
                  wrapContent
                  style={{ height: "100%", flex: 1 }}
                />
              )}

              {activeTab === "preview" && (
                <SandpackPreview
                  showNavigator={true}
                  showRefreshButton={true}
                  style={{ height: "100%", flex: 1 }}
                />
              )}
            </SandpackLayout>
          </div>
        </SandpackProvider>
      </div>
    </div>
  );
}
