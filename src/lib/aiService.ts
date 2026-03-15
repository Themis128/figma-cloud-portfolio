interface AIProvider {
  name: "openai" | "together" | "ollama";
  apiKey?: string; // Ollama doesn't require API key
  baseURL: string;
  models: string[];
}

interface OllamaRequest {
  model: string;
  prompt: string;
  stream: boolean;
}

interface OpenAIRequest {
  model: string;
  messages: { role: string; content: string }[];
  max_tokens: number;
  temperature: number;
}

interface AIResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
}

class AIService {
  private provider: AIProvider | null = null;

  constructor() {
    const provider = (process.env.NEXT_PUBLIC_AI_PROVIDER || "ollama") as
      | "openai"
      | "together"
      | "ollama";
    let apiKey: string | undefined;

    if (provider === "openai") {
      apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    } else if (provider === "together") {
      apiKey = process.env.NEXT_PUBLIC_TOGETHER_API_KEY;
    }
    // Ollama doesn't require an API key

    if (
      (apiKey && apiKey.length > 0) ||
      provider === "ollama"
    ) {
      this.provider = {
        name: provider,
        ...(apiKey !== undefined && { apiKey }),
        baseURL:
          provider === "openai"
            ? "https://api.openai.com/v1"
            : provider === "together"
              ? "https://api.together.xyz/v1"
              : "http://localhost:11434/v1", // Ollama default
        models:
          provider === "openai"
            ? ["gpt-4o-mini", "gpt-3.5-turbo", "gpt-4"]
            : provider === "together"
              ? [
                  "meta-llama/Llama-2-70b-chat-hf",
                  "mistralai/Mistral-7B-Instruct-v0.1",
                ]
              : [
                  "llama2",
                  "codellama",
                  "mistral",
                  "llama2:13b",
                  "codellama:13b",
                ], // Common Ollama models
      };
    }
  }

  async generateResponse(
    message: string,
    context?: string,
  ): Promise<AIResponse> {
    if (!this.provider) {
      return {
        content: this.getFallbackResponse(message),
        model: "fallback",
      };
    }

    const model =
      process.env.NEXT_PUBLIC_AI_MODEL || this.provider.models[0] || "llama2";

    const systemPrompt = `You are an AI assistant for Themistoklis Baltzakis' portfolio website. You help visitors learn about his work, experience, and projects.

Key information about Themistoklis:
- IT Network Engineer with 15+ years of extensive experience
- Specializes in network infrastructure, Cisco systems, and Fortinet security solutions
- Skilled in data center management, Azure AD, Microsoft 365, and cloud environments
- Technologies: Cisco Systems, Fortinet, Azure AD, AWS, React, TypeScript, Node.js, Python

${context ? `Additional context: ${context}` : ""}

Be helpful, professional, and engaging. Keep responses concise but informative. If asked about specific projects or technologies, provide relevant details based on modern development practices.`;

    try {
      let response: Response;
      let requestBody: OllamaRequest | OpenAIRequest;

      if (this.provider?.name === "ollama") {
        // Ollama API format
        requestBody = {
          model,
          prompt: `${systemPrompt}\n\nUser: ${message}\n\nAssistant:`,
          stream: false,
        };
        response = await fetch(`${this.provider?.baseURL}/generate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });
      } else {
        // OpenAI/Together API format
        requestBody = {
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message },
          ],
          max_tokens: 500,
          temperature: 0.7,
        };
        response = await fetch(`${this.provider?.baseURL}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.provider?.apiKey}`,
          },
          body: JSON.stringify(requestBody),
        });
      }

      if (!response.ok) {
        throw new Error(
          `AI API error: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();

      let content: string;
      let usage: AIResponse["usage"];
      let responseModel: string;

      if (this.provider?.name === "ollama") {
        content =
          data.response ||
          "I apologize, but I couldn't generate a response at the moment.";
        usage = undefined; // Ollama doesn't provide token usage in the same way
        responseModel = data.model || model;
      } else {
        content =
          data.choices[0]?.message?.content ||
          "I apologize, but I couldn't generate a response at the moment.";
        usage = data.usage
          ? {
              promptTokens: data.usage.prompt_tokens,
              completionTokens: data.usage.completion_tokens,
              totalTokens: data.usage.total_tokens,
            }
          : undefined;
        responseModel = data.model || model;
      }

      return {
        content,
        ...(usage !== undefined && { usage }),
        model: responseModel,
      };
    } catch (_error) {
      // Fallback to keyword-based response if API fails
      return {
        content: this.getFallbackResponse(message),
        model: "fallback",
      };
    }
  }

  private getFallbackResponse(message: string): string {
    // Keyword-based fallback responses when AI provider is unavailable
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes("cisco") || lowerMessage.includes("network")) {
      return "Themis is an IT Network Engineer with 15+ years of experience in Cisco infrastructure (UCS, HyperFlex, ACI, Nexus), Fortinet security, and enterprise networking. He holds Cisco CCNA, DevNet Associate, and CyberOps Associate credentials. Check out the About page for more details.";
    }

    if (lowerMessage.includes("azure") || lowerMessage.includes("cloud") || lowerMessage.includes("aws")) {
      return "Themis has extensive experience with Azure AD, Microsoft 365, and AWS cloud environments. He's an AWS Certified Cloud Practitioner and specializes in multi-cloud migration, identity management, and zero-trust architecture. Visit the About page for his full skill set.";
    }

    if (lowerMessage.includes("security") || lowerMessage.includes("cybersecurity") || lowerMessage.includes("fortinet")) {
      return "Themis specializes in cybersecurity with expertise in Fortinet firewalls, zero-trust architecture, CyberArk PAM, conditional access policies, and identity governance. He holds multiple Cisco cybersecurity badges including CyberOps Associate and Cyber Threat Management.";
    }

    if (lowerMessage.includes("project") || lowerMessage.includes("work") || lowerMessage.includes("portfolio")) {
      return "Themis has 12 projects on his portfolio including a Network Monitoring Stack (Prometheus/Grafana), AP Pinpoint tool, Network Automation Lab, Docker Labs, and this portfolio website (Next.js 16 on AWS). Visit the Projects page to explore them all.";
    }

    if (lowerMessage.includes("resume") || lowerMessage.includes("cv") || lowerMessage.includes("builder")) {
      return "The Resume page features an interactive CV builder with 7 professional templates (Classic, Modern, Minimal, Executive, Creative, Bold, Emerald), live preview, PDF download, and JSON export. There's also an ATS optimization guide. Try it at /resume/.";
    }

    if (lowerMessage.includes("contact") || lowerMessage.includes("email") || lowerMessage.includes("hire")) {
      return "You can reach Themis via email at baltzakis.themis@gmail.com, connect on LinkedIn (linkedin.com/in/baltzakis-themis), or use the contact form on the Contact page. He's based in Koropi/Athens, Greece and is open to both remote and on-site work.";
    }

    if (lowerMessage.includes("certification") || lowerMessage.includes("badge") || lowerMessage.includes("credential")) {
      return "Themis holds 4 professional certifications (AWS Cloud Practitioner, Cisco DevNet Associate, Cisco CCNA, Windows Server 2016) and 16 verified Credly badges spanning networking, cybersecurity, Python, Kubernetes, and data analytics. See the About page for the full list.";
    }

    if (lowerMessage.includes("education") || lowerMessage.includes("degree") || lowerMessage.includes("university")) {
      return "Themis holds a Master's in Data Analytics and Technologies (Bolton University / New York College, 2025) and a BSc in Computer Science (Hellenic Open University, 2014-2022). He also completed Cisco Incubator 12.0, DevNet Associate, and CCNA programs.";
    }

    if (lowerMessage.includes("agent") || lowerMessage.includes("ai")) {
      return "The AI Agents page at /agents/ is an educational guide covering agent concepts, architecture patterns (Single, Router, Multi-Agent), key terminology (RAG, ReAct, MCP), network engineering use cases, 5 agent templates, and a Blockly drag-and-drop agent builder for kids.";
    }

    return "I'm Themis's portfolio assistant. I can help you learn about his 15+ years of experience in network engineering, Cisco/Fortinet infrastructure, cloud architecture, and cybersecurity. Ask about his projects, certifications, skills, or how to get in touch!";
  }

  getAvailableModels(): string[] {
    return this.provider?.models || [];
  }

  getCurrentProvider(): string {
    return this.provider?.name || "none";
  }
}

// Export singleton instance
export const aiService = new AIService();
export type { AIResponse };
