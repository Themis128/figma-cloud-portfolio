import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Knowledge base for the simple chatbot fallback
const websiteInfo = [
  {
    question: "What is this website about?",
    answer:
      "This is the portfolio of Themistoklis Baltzakis — Cloud Architect & Cybersecurity Specialist. Built with Next.js, React, and TypeScript.",
  },
  {
    question: "Who is the creator?",
    answer:
      "Themistoklis Baltzakis — a Cloud Architect & Cybersecurity Specialist with 15+ years of experience in network infrastructure, Azure, AWS, and security solutions.",
  },
  {
    question: "How can I contact you?",
    answer:
      "You can use the contact form on the website or visit the Contact page for more details.",
  },
];

function findAnswer(userQuestion: string) {
  // Simple keyword match fallback — production chat uses AWS Bedrock via server/routes/chat.ts
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
