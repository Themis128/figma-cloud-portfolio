"use client";

import { CheckCircle2, XCircle, Trophy, RotateCcw } from "lucide-react";
import { useState } from "react";
import { trackGA4 } from "@/components/GoogleAnalytics";

interface Question {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

const QUESTIONS: Question[] = [
  {
    question: "What does the 'Zero Trust' security model assume?",
    options: [
      "All internal traffic is trusted",
      "Never trust, always verify",
      "Only VPN traffic is secure",
      "Firewalls are sufficient protection",
    ],
    correct: 1,
    explanation: "Zero Trust assumes no implicit trust. Every request must be verified regardless of origin.",
  },
  {
    question: "Which Cisco technology provides data center network automation?",
    options: [
      "Cisco Meraki",
      "Cisco Webex",
      "Cisco ACI",
      "Cisco Umbrella",
    ],
    correct: 2,
    explanation: "Cisco ACI (Application Centric Infrastructure) automates data center network provisioning and management.",
  },
  {
    question: "What does IaC stand for in cloud engineering?",
    options: [
      "Internet as a Commodity",
      "Infrastructure as Code",
      "Integration and Compliance",
      "Intelligent Access Control",
    ],
    correct: 1,
    explanation: "Infrastructure as Code enables managing infrastructure through declarative configuration files.",
  },
  {
    question: "Which AWS service provides serverless compute?",
    options: [
      "EC2",
      "S3",
      "Lambda",
      "RDS",
    ],
    correct: 2,
    explanation: "AWS Lambda runs code without provisioning servers. You pay only for compute time consumed.",
  },
  {
    question: "What protocol does HTTPS use for encryption?",
    options: [
      "SSH",
      "TLS/SSL",
      "IPSec",
      "WPA3",
    ],
    correct: 1,
    explanation: "HTTPS uses TLS (Transport Layer Security) to encrypt HTTP traffic between browser and server.",
  },
];

export default function CyberQuiz() {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [answered, setAnswered] = useState(false);

  const q = QUESTIONS[currentQ];

  function handleSelect(idx: number) {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    if (idx === q?.correct) setScore((s) => s + 1);
  }

  function handleNext() {
    if (currentQ + 1 >= QUESTIONS.length) {
      const pct = Math.round((score / QUESTIONS.length) * 100);
      const grade = pct >= 80 ? "A" : pct >= 60 ? "B" : pct >= 40 ? "C" : "D";
      trackGA4("quiz_complete", { score, total: QUESTIONS.length, grade, percent: pct });
      setFinished(true);
    } else {
      setCurrentQ((c) => c + 1);
      setSelected(null);
      setAnswered(false);
    }
  }

  function handleRestart() {
    setCurrentQ(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
    setAnswered(false);
  }

  if (!q) return null;

  if (finished) {
    const pct = Math.round((score / QUESTIONS.length) * 100);
    const grade = pct >= 80 ? "A" : pct >= 60 ? "B" : pct >= 40 ? "C" : "D";
    return (
      <div className="bg-card/40 backdrop-blur-sm border border-border/20 rounded-lg p-6 text-center">
        <Trophy className="w-10 h-10 text-cyan-400 mx-auto mb-3" />
        <p className="text-foreground font-mono text-lg font-bold">
          {score}/{QUESTIONS.length} Correct, Grade {grade}
        </p>
        <p className="text-foreground/60 font-mono text-sm mt-1">
          {pct >= 80 ? "Impressive! You know your stuff." :
           pct >= 60 ? "Good knowledge! Room to grow." :
           "Keep learning, cybersecurity is a journey!"}
        </p>
        <button
          onClick={handleRestart}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 font-mono text-xs hover:bg-cyan-500/20 transition-colors"
        >
          <RotateCcw className="w-3 h-3" /> Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-card/40 backdrop-blur-sm border border-border/20 rounded-lg p-6">
      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-foreground/50 font-mono text-xs">
          Question {currentQ + 1}/{QUESTIONS.length}
        </span>
        <span className="text-cyan-400 font-mono text-xs font-bold">
          Score: {score}
        </span>
      </div>
      <div className="w-full h-1 bg-foreground/10 rounded-full mb-4">
        <div
          className="h-1 bg-cyan-400 rounded-full transition-all duration-300"
          style={{ width: `${((currentQ + 1) / QUESTIONS.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <p className="text-foreground font-mono text-sm font-medium mb-4 leading-relaxed">
        {q.question}
      </p>

      {/* Options */}
      <div className="flex flex-col gap-2">
        {q.options.map((opt, idx) => {
          let style = "border-border/20 text-foreground/80 hover:border-cyan-500/30 hover:bg-cyan-500/5";
          if (answered) {
            if (idx === q.correct) style = "border-green-500/50 bg-green-500/10 text-green-400";
            else if (idx === selected) style = "border-red-500/50 bg-red-500/10 text-red-400";
            else style = "border-border/10 text-foreground/30";
          }
          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={answered}
              className={`text-left px-3 py-2 rounded border font-mono text-xs transition-all ${style}`}
            >
              <span className="flex items-center gap-2">
                {answered && idx === q.correct && <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" />}
                {answered && idx === selected && idx !== q.correct && <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />}
                {opt}
              </span>
            </button>
          );
        })}
      </div>

      {/* Explanation + Next */}
      {answered && (
        <div className="mt-4 space-y-3">
          <p className="text-foreground/60 font-mono text-xs leading-relaxed border-l-2 border-cyan-500/30 pl-3">
            {q.explanation}
          </p>
          <button
            onClick={handleNext}
            className="px-4 py-2 rounded border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 font-mono text-xs hover:bg-cyan-500/20 transition-colors"
          >
            {currentQ + 1 >= QUESTIONS.length ? "See Results" : "Next Question →"}
          </button>
        </div>
      )}
    </div>
  );
}
