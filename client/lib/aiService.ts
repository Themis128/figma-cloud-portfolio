interface AIProvider {
  name: "openai" | "together";
  apiKey: string;
  baseURL: string;
  models: string[];
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
    const provider = (import.meta.env.VITE_AI_PROVIDER || "openai") as "openai" | "together";
    const apiKey =
      provider === "openai"
        ? import.meta.env.VITE_OPENAI_API_KEY
        : import.meta.env.VITE_TOGETHER_API_KEY;

    if (apiKey && apiKey !== "test_openai_key" && apiKey !== "test_together_key") {
      this.provider = {
        name: provider,
        apiKey,
        baseURL:
          provider === "openai" ? "https://api.openai.com/v1" : "https://api.together.xyz/v1",
        models:
          provider === "openai"
            ? ["gpt-4o-mini", "gpt-3.5-turbo", "gpt-4"]
            : ["meta-llama/Llama-2-70b-chat-hf", "mistralai/Mistral-7B-Instruct-v0.1"],
      };
    }
  }

  async generateResponse(message: string, context?: string): Promise<AIResponse> {
    if (!this.provider) {
      return {
        content: this.getFallbackResponse(message),
        model: "fallback",
      };
    }

    const model = import.meta.env.VITE_AI_MODEL || this.provider.models[0];

    const systemPrompt = `You are an AI assistant for Themistoklis Baltzakis' portfolio website. You help visitors learn about his work, experience, and projects.

Key information about Themistoklis:
- Cloud Architect & Cybersecurity Specialist with 15+ years of IT expertise
- Specializes in Azure AD, Microsoft 365, and multi-cloud environments
- Expert in DevOps, automation, and modern web development
- Technologies: React, TypeScript, Node.js, Python, Azure, AWS, Kubernetes

${context ? `Additional context: ${context}` : ""}

Be helpful, professional, and engaging. Keep responses concise but informative. If asked about specific projects or technologies, provide relevant details based on modern development practices.`;

    try {
      const response = await fetch(`${this.provider.baseURL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.provider.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message },
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`AI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      return {
        content:
          data.choices[0]?.message?.content ||
          "I apologize, but I couldn't generate a response at the moment.",
        usage: data.usage
          ? {
              promptTokens: data.usage.prompt_tokens,
              completionTokens: data.usage.completion_tokens,
              totalTokens: data.usage.total_tokens,
            }
          : undefined,
        model: data.model || model,
      };
    } catch (error) {
      console.error("AI Service Error:", error);
      // Fallback to mock response if API fails
      return {
        content: this.getFallbackResponse(message),
        model: "fallback",
      };
    }
  }

  private getFallbackResponse(message: string): string {
    // Simple keyword-based fallback responses
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes("react") || lowerMessage.includes("frontend")) {
      return "Themistoklis specializes in modern React development with TypeScript, using the latest patterns and best practices for scalable web applications.";
    }

    if (lowerMessage.includes("azure") || lowerMessage.includes("cloud")) {
      return "With extensive experience in Azure and multi-cloud environments, Themistoklis designs and implements robust cloud architectures for enterprise solutions.";
    }

    if (lowerMessage.includes("security") || lowerMessage.includes("cybersecurity")) {
      return "Themistoklis brings 15+ years of cybersecurity expertise, focusing on Azure AD, identity management, and secure cloud deployments.";
    }

    if (lowerMessage.includes("project") || lowerMessage.includes("work")) {
      return "Themistoklis has worked on numerous projects involving cloud architecture, DevOps automation, and full-stack web development. Check out the Projects section for detailed examples.";
    }

    return "I'd be happy to help you learn more about Themistoklis' experience and work. Feel free to ask about specific technologies, projects, or his background in cloud architecture and cybersecurity.";
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
