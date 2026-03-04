import { useState, useEffect } from "react";
import { ResumeBuilder } from "../components/resume/ResumeBuilder";
import { ResumeHeader } from "../components/resume/ResumeHeader";
import { ResumeSidebar } from "../components/resume/ResumeSidebar";
import { ResumeContent } from "../components/resume/ResumeContent";
import { ResumeFooter } from "../components/resume/ResumeFooter";
import { ResumeContextProvider } from "../components/resume/ResumeContext";
import { ResumeData } from "../types/resume";

// MCP Server Integration
const useMemoryMCP = async (action: "save" | "load", payload: any) => {
  try {
    // Implement Memory MCP server integration
    console.log("Memory MCP server action:", action, payload);
    return { success: true };
  } catch (error) {
    console.error("Memory MCP error:", error);
    throw error;
  }
};

export default function ResumePage() {
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);

  useEffect(() => {
    // Initialize resume data or load from storage
    initializeResumeData();
  }, []);

  const initializeResumeData = async () => {
    try {
      // Load resume data from Memory MCP server
      const memoryData = await getResumeFromMemory();
      if (memoryData) {
        setResumeData(memoryData);
      } else {
        // Create new resume with default data
        const defaultData = createDefaultResume();
        setResumeData(defaultData);
        await saveResumeToMemory(defaultData);
      }
    } catch (error) {
      console.error("Failed to initialize resume data:", error);
      // Fallback to default data
      const defaultData = createDefaultResume();
      setResumeData(defaultData);
    }
  };

  const createDefaultResume = () => ({
    personalInfo: {
      name: "Your Name",
      title: "Software Developer",
      email: "your.email@example.com",
      phone: "+1 (555) 123-4567",
      location: "San Francisco, CA",
      summary:
        "Passionate software developer with expertise in modern web technologies and a strong focus on creating user-centric applications.",
    },
    workExperience: [
      {
        company: "Tech Company",
        position: "Software Developer",
        startDate: "Jan 2020",
        endDate: "Present",
        description:
          "Developed and maintained web applications using React, TypeScript, and Node.js. Collaborated with cross-functional teams to deliver high-quality software solutions.",
      },
    ],
    education: [
      {
        institution: "University Name",
        degree: "Bachelor of Science in Computer Science",
        graduationDate: "May 2019",
        description:
          "Relevant coursework: Data Structures, Algorithms, Software Engineering, Web Development",
      },
    ],
    skills: [
      { name: "JavaScript", level: "Expert" as const },
      { name: "React", level: "Expert" as const },
      { name: "TypeScript", level: "Advanced" as const },
      { name: "Node.js", level: "Advanced" as const },
      { name: "HTML/CSS", level: "Expert" as const },
    ],
    projects: [
      {
        name: "Portfolio Website",
        description:
          "Modern portfolio website built with Next.js, TypeScript, and Tailwind CSS",
        technologies: ["Next.js", "TypeScript", "Tailwind CSS"],
      },
    ],
  });

  const saveResumeToMemory = async (data: ResumeData) => {
    // Use Memory MCP server to save resume data
    try {
      await useMemoryMCP("save", { key: "resume", data });
    } catch (error) {
      console.error("Failed to save resume to memory:", error);
    }
  };

  const getResumeFromMemory = async () => {
    // Use Memory MCP server to load resume data
    try {
      const result = await useMemoryMCP("load", { key: "resume" });
      return result.success ? null : null; // Simplified for now since we don't have actual data
    } catch (error) {
      console.error("Failed to load resume from memory:", error);
      return null;
    }
  };

  if (!resumeData) {
    return <div>Loading resume...</div>;
  }

  return (
    <ResumeContextProvider value={{ resumeData, setResumeData }}>
      <div className="min-h-screen bg-gray-50">
        <ResumeHeader />
        <ResumeBuilder />
        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <ResumeSidebar />
            <ResumeContent />
          </div>
        </main>
        <ResumeFooter />
      </div>
    </ResumeContextProvider>
  );
}
