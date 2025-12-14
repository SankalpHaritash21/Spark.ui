"use client";

import { useState } from "react";
import { Sandpack } from "@codesandbox/sandpack-react";
import { dracula } from "@codesandbox/sandpack-themes";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCode, setGeneratedCode] =
    useState(`export default function App() {
  return (
    <div className="p-10 text-center font-sans">
      <h1 className="text-3xl font-bold mb-4">👋 Ready to Build</h1>
      <p className="text-gray-600">Describe your UI on the left to begin.</p>
    </div>
  );
}`);

  const handleGenerate = async () => {
    if (!prompt) return;

    setIsLoading(true);
    try {
      // CALL THE BACKEND (step 2)
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (data.code) {
        setGeneratedCode(data.code);
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

  return (
    <div className="flex h-screen w-full bg-gray-900 text-white">
      {/* LEFT SIDE: Chat Interface */}
      <div className="w-[400px] flex flex-col border-r border-gray-700 bg-gray-900">
        <div className="p-4 border-b border-gray-700 font-bold text-xl">
          ⚡ Spark.ui
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="bg-gray-800 p-3 rounded-lg text-sm text-gray-300">
            Welcome! Describe the website you want to build, and I&apos;ll
            generate it.
          </div>
        </div>

        <div className="p-4 border-t border-gray-700 bg-gray-800">
          <textarea
            className="w-full bg-gray-900 text-white p-3 rounded border border-gray-600 focus:outline-none focus:border-blue-500 text-sm resize-none"
            rows={4}
            placeholder="e.g. A landing page for a coffee shop..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className={`mt-3 w-full font-bold py-2 px-4 rounded transition-colors ${
              isLoading
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-500 text-white"
            }`}
          >
            {isLoading ? "Thinking..." : "Generate Website"}
          </button>
        </div>
      </div>

      {/* RIGHT SIDE: Live Preview */}
      <div className="flex-1 h-full bg-black flex flex-col">
        <Sandpack
          template="react"
          theme={dracula}
          options={{
            showNavigator: true,
            editorHeight: "100vh",
            externalResources: ["https://cdn.tailwindcss.com"],
          }}
          customSetup={{
            // ✅ Move libraries inside the 'dependencies' object
            dependencies: {
              "lucide-react": "latest",
              recharts: "latest",
              "framer-motion": "latest",
            },
          }}
          files={{
            "/App.js": generatedCode,
          }}
        />
      </div>
    </div>
  );
}
