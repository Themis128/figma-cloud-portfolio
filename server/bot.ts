import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Dummy knowledge base (replace with real info or connect to a vector DB)
const websiteInfo = [
  {
    question: "What is this website about?",
    answer:
      "This is a modern portfolio built with Next.js, React, and TypeScript.",
  },
  {
    question: "Who is the creator?",
    answer: "The portfolio was created by tbaltzakis.",
  },
  {
    question: "How can I contact you?",
    answer:
      "You can use the contact form on the website or email tbaltzakis@example.com.",
  },
];

function findAnswer(userQuestion: string) {
  // Simple keyword match (replace with LLM or semantic search for production)
  const q = userQuestion.toLowerCase();
  for (const info of websiteInfo) {
    if (q.includes(info.question.toLowerCase().split(" ")[2])) {
      return info.answer;
    }
  }
  return "Sorry, I don't know the answer to that yet.";
}

app.post("/api/chatbot", (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "No message provided" });
  const reply = findAnswer(message);
  res.json({ reply });
});

app.listen(3010, () => {
  console.log("Chatbot server running on port 3010");
});
