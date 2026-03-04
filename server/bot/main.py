import json
import os
from typing import AsyncGenerator

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

load_dotenv()

app = FastAPI()

HF_TOKEN = os.environ.get("HF_TOKEN", "")
PORTFOLIO_ORIGIN = os.environ.get("PORTFOLIO_ORIGIN", "*")
HF_MODEL = "mistralai/Mistral-7B-Instruct-v0.3"
HF_API_URL = f"https://api-inference.huggingface.co/models/{HF_MODEL}"

origins = [PORTFOLIO_ORIGIN] if PORTFOLIO_ORIGIN != "*" else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["*"],
)

PORTFOLIO_CONTEXT = """You are an AI assistant for Themistoklis Baltzakis's portfolio website.
Answer questions about Themis professionally and helpfully. Be concise and friendly.

About Themis:
- Name: Themistoklis Baltzakis
- Title: Cloud Architect & Cybersecurity Specialist
- Location: Athens, Greece
- Email: baltzakis.themis@gmail.com
- LinkedIn: https://www.linkedin.com/in/baltzakis-themis
- Website: https://www.baltzakisthemis.com

Summary:
15+ years of IT expertise specializing in Azure AD, Microsoft 365, and multi-cloud environments.
Computer Science degree combined with industry certifications and hands-on experience across
network infrastructure, cybersecurity, and cloud migration strategies.

Experience:
1. Estarta Solutions – Systems and Network Engineer (Dec 2024 – Mar 2025, Remote)
   - Cisco UCS, HyperFlex, ACI virtualization platforms
   - VMware vSphere and ESXi environments
   - Network virtualization with Cisco ACI and Nexus

2. Cosmos Business Systems Group – IT Support Engineer (Mar 2023 – May 2024, Athens)
   - Azure Active Directory and identity governance
   - Microsoft 365 support services
   - Microsoft Intune for mobile device management
   - Conditional access and MFA policies

3. CPI SA (Nielsen Greece) – IT Consultant (Feb 2023 – Mar 2023, Athens)
   - Technology roadmap and IT strategy
   - Active Directory administration
   - ServiceNow ITSM, CyberArk PAM

Education:
- Master's in Informatics and Telematics (Data-driven Agricultural Innovations) – Harokopio University (2023–Present)
- BSc Computer Science – University of Piraeus (2006–2013)

Certifications:
- AWS Cloud Practitioner
- Cisco DevNet Associate
- Microsoft Azure Solutions Architect
- CISSP (Certified Information Systems Security Professional)
- CEH (Certified Ethical Hacker)
- ITIL Foundation

Skills:
- Cloud: Microsoft Azure, AWS, Multi-cloud Migration, Infrastructure as Code
- Security: Zero-Trust Security, Azure AD, CyberArk PAM, Microsoft Sentinel
- Networking: Cisco ACI, Cisco UCS, VMware vSphere, Nexus Switching
- Development: React, Next.js, TypeScript, Node.js, Python
- Tools: Microsoft 365, ServiceNow, Microsoft Intune, GitHub Actions

Languages: English (Full Professional), Greek (Native/Bilingual)

Honors:
- 3rd Place – Cisco Incubator 12.0 (Customer Experience Track)
- Scholarship Recipient (Academic Excellence)

If asked about topics unrelated to Themis or his portfolio, politely redirect to portfolio-related questions.

Booking:
- You can help users schedule a teleconference call with Themis.
- If the user expresses intent to book, schedule, or arrange a meeting or call, respond ONLY with the exact token: [BOOK_CALL]
- Do not add any other text when emitting [BOOK_CALL]."""


class HistoryMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list[HistoryMessage] = []


def build_mistral_prompt(message: str, history: list[HistoryMessage]) -> str:
    """Build a Mistral-formatted chat prompt with system context and history."""
    prompt_parts = []

    # First turn always includes the system context
    first_user = f"{PORTFOLIO_CONTEXT}\n\n{history[0].content}" if history else f"{PORTFOLIO_CONTEXT}\n\n{message}"

    if history:
        # Inject system context into the first user message
        prompt_parts.append(f"<s>[INST] {first_user} [/INST]")
        if len(history) > 0 and history[0].role == "user":
            # Find matching assistant response
            i = 1
            while i < len(history):
                if history[i].role == "assistant":
                    prompt_parts.append(f" {history[i].content} </s>")
                    i += 1
                    if i < len(history) and history[i].role == "user":
                        prompt_parts.append(f"[INST] {history[i].content} [/INST]")
                        i += 1
                else:
                    i += 1
        # Add the new message
        prompt_parts.append(f" [INST] {message} [/INST]")
    else:
        # No history — first message with system context
        prompt_parts.append(f"<s>[INST] {first_user} [/INST]")

    return "".join(prompt_parts)


async def stream_hf_response(prompt: str) -> AsyncGenerator[str, None]:
    """Stream tokens from HuggingFace Inference API as SSE events."""
    headers = {
        "Authorization": f"Bearer {HF_TOKEN}",
        "Content-Type": "application/json",
    }
    payload = {
        "inputs": prompt,
        "parameters": {
            "max_new_tokens": 512,
            "temperature": 0.7,
            "top_p": 0.9,
            "return_full_text": False,
            "stop": ["</s>", "[INST]"],
        },
        "stream": True,
    }

    accumulated = ""

    async with httpx.AsyncClient(timeout=60.0) as client:
        async with client.stream("POST", HF_API_URL, headers=headers, json=payload) as response:
            if response.status_code != 200:
                error_body = await response.aread()
                yield f"data: {json.dumps({'error': f'HF API error {response.status_code}: {error_body.decode()}'})}\n\n"
                return

            async for line in response.aiter_lines():
                if not line:
                    continue
                # HF streaming returns lines like: data: {"token": {"text": "..."}, ...}
                if line.startswith("data:"):
                    raw = line[5:].strip()
                    if raw == "[DONE]":
                        break
                    try:
                        chunk = json.loads(raw)
                        # HF text-generation streaming format
                        token_text = (
                            chunk.get("token", {}).get("text")
                            or chunk.get("generated_text")
                            or ""
                        )
                        if token_text:
                            accumulated += token_text
                    except json.JSONDecodeError:
                        continue

    # Check if the model signalled a booking request
    if "[BOOK_CALL]" in accumulated:
        yield f"data: {json.dumps({'action': 'start_booking'})}\n\n"
    else:
        # Re-emit the full accumulated text as a single token
        # (avoids holding the stream open; widget handles concatenation)
        if accumulated:
            yield f"data: {json.dumps({'token': accumulated})}\n\n"

    yield "data: [DONE]\n\n"


@app.post("/api/chat/stream")
async def chat_stream(request: ChatRequest):
    prompt = build_mistral_prompt(request.message, request.history)

    return StreamingResponse(
        stream_hf_response(prompt),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "model": HF_MODEL}


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)
