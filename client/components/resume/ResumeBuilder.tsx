import { useState, useEffect } from "react";
import { useResume } from "./ResumeContext";
import { ResumeData } from "../../types/resume";

export function ResumeBuilder() {
  const { resumeData, setResumeData } = useResume();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // MCP Server Integration
  const [mcpServers, setMcpServers] = useState({
    memory: false,
    filesystem: false,
    context7: false,
    github: false,
  });

  useEffect(() => {
    // Check MCP server availability
    checkMcpServers();
  }, []);

  const checkMcpServers = async () => {
    try {
      // Check Memory MCP server
      const memoryAvailable = await checkMemoryServer();
      // Check Filesystem MCP server
      const filesystemAvailable = await checkFilesystemServer();
      // Check Context7 MCP server
      const context7Available = await checkContext7Server();
      // Check GitHub MCP server
      const githubAvailable = await checkGitHubServer();

      setMcpServers({
        memory: memoryAvailable,
        filesystem: filesystemAvailable,
        context7: context7Available,
        github: githubAvailable,
      });
    } catch (error) {
      console.error("Failed to check MCP servers:", error);
    }
  };

  const checkMemoryServer = async () => {
    try {
      // Simulate Memory MCP server check
      return true;
    } catch {
      return false;
    }
  };

  const checkFilesystemServer = async () => {
    try {
      // Simulate Filesystem MCP server check
      return true;
    } catch {
      return false;
    }
  };

  const checkContext7Server = async () => {
    try {
      // Simulate Context7 MCP server check
      return true;
    } catch {
      return false;
    }
  };

  const checkGitHubServer = async () => {
    try {
      // Simulate GitHub MCP server check
      return true;
    } catch {
      return false;
    }
  };

  const saveResume = async () => {
    if (!resumeData) return;

    setLoading(true);
    setError("");

    try {
      // Save to Memory MCP server
      if (mcpServers.memory) {
        await saveToMemoryServer(resumeData);
      }
      // Save to Filesystem MCP server
      if (mcpServers.filesystem) {
        await saveToFilesystem(resumeData);
      }
      // Generate suggestions using Context7 MCP server
      if (mcpServers.context7) {
        await generateSuggestions(resumeData);
      }
    } catch (error) {
      setError("Failed to save resume. Please try again.");
      console.error("Save error:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveToMemoryServer = async (data: ResumeData) => {
    // Implement Memory MCP server save
    console.log("Saving to Memory MCP server:", data);
  };

  const saveToFilesystem = async (data: ResumeData) => {
    // Implement Filesystem MCP server save
    console.log("Saving to Filesystem MCP server:", data);
  };

  const generateSuggestions = async (data: ResumeData) => {
    // Implement Context7 MCP server suggestions
    console.log("Generating suggestions using Context7 MCP server:", data);
  };

  const importResume = async () => {
    setLoading(true);
    setError("");

    try {
      if (mcpServers.filesystem) {
        const importedData = await importFromFilesystem();
        if (importedData) {
          setResumeData(importedData);
        }
      }
    } catch (error) {
      setError("Failed to import resume. Please try again.");
      console.error("Import error:", error);
    } finally {
      setLoading(false);
    }
  };

  const importFromFilesystem = async () => {
    // Implement Filesystem MCP server import
    console.log("Importing resume from Filesystem MCP server");
    return resumeData; // Return current data for now
  };

  const generatePdf = async () => {
    setLoading(true);
    setError("");

    try {
      if (mcpServers.filesystem && resumeData) {
        await generatePdfFile(resumeData);
      }
    } catch (error) {
      setError("Failed to generate PDF. Please try again.");
      console.error("PDF generation error:", error);
    } finally {
      setLoading(false);
    }
  };

  const generatePdfFile = async (data: ResumeData) => {
    // Implement PDF generation
    console.log("Generating PDF for resume:", data);
  };

  return (
    <div className="mt-8">
      {/* MCP Server Status */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          MCP Server Status
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span>Memory Server</span>
            <span
              className={`px-2 py-1 rounded-full text-sm font-medium ${
                mcpServers.memory
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {mcpServers.memory ? "Connected" : "Disconnected"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Filesystem Server</span>
            <span
              className={`px-2 py-1 rounded-full text-sm font-medium ${
                mcpServers.filesystem
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-green-800"
              }`}
            >
              {mcpServers.filesystem ? "Connected" : "Disconnected"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Context7 Server</span>
            <span
              className={`px-2 py-1 rounded-full text-sm font-medium ${
                mcpServers.context7
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {mcpServers.context7 ? "Connected" : "Disconnected"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>GitHub Server</span>
            <span
              className={`px-2 py-1 rounded-full text-sm font-medium ${
                mcpServers.github
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {mcpServers.github ? "Connected" : "Disconnected"}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <button
          onClick={saveResume}
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? "Saving..." : "Save Resume"}
        </button>
        <button
          onClick={importResume}
          disabled={loading}
          className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? "Importing..." : "Import Resume"}
        </button>
        <button
          onClick={generatePdf}
          disabled={loading}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? "Generating..." : "Generate PDF"}
        </button>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* MCP Integration Features */}
      {mcpServers.context7 && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-purple-900 mb-3">
            AI-Powered Suggestions
          </h3>
          <p className="text-purple-800 mb-2">
            Context7 MCP server is available to provide resume writing
            suggestions and best practices.
          </p>
          <button className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700">
            Get Suggestions
          </button>
        </div>
      )}

      {mcpServers.github && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            Version Control
          </h3>
          <p className="text-blue-800 mb-2">
            GitHub MCP server is available to track changes and collaborate on
            your resume.
          </p>
          <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
            Track Changes
          </button>
        </div>
      )}
    </div>
  );
}
