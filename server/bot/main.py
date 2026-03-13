"""FastAPI chatbot with RAG + local LLM — fully offline, no internet required."""

import asyncio
import json
import os
from pathlib import Path
from typing import AsyncGenerator

import chromadb
from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from llama_cpp import Llama
from pydantic import BaseModel

load_dotenv()

app = FastAPI(title="Portfolio Chatbot (RAG + Local LLM)")

# ── Configuration ────────────────────────────────────────────────────────────

PORTFOLIO_ORIGIN = os.environ.get("PORTFOLIO_ORIGIN", "*")

# Local LLM
MODELS_DIR = Path(__file__).parent / "models"
MODEL_FILENAME = "Llama-3.2-3B-Instruct-Q4_K_M.gguf"
MODEL_PATH = MODELS_DIR / MODEL_FILENAME
N_GPU_LAYERS = int(os.environ.get("N_GPU_LAYERS", "-1"))  # -1 = offload all layers to GPU
N_CTX = 4096  # Context window
MAX_TOKENS = 512

# RAG
CHROMA_DIR = Path(__file__).parent / "chroma_db"
COLLECTION_NAME = "portfolio_knowledge"
EMBEDDING_MODEL = "all-MiniLM-L6-v2"
TOP_K = 5

origins = [PORTFOLIO_ORIGIN] if PORTFOLIO_ORIGIN != "*" else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["*"],
)

# ── Local LLM setup ─────────────────────────────────────────────────────────

_llm: Llama | None = None


def get_llm() -> Llama | None:
    """Lazy-load the local LLM (loaded once, reused across requests)."""
    global _llm
    if _llm is not None:
        return _llm

    if not MODEL_PATH.exists():
        print(f"ERROR: Model not found at {MODEL_PATH}")
        print("Run `python download_model.py` to download the model first.")
        return None

    print(f"Loading local LLM: {MODEL_FILENAME} (GPU layers: {N_GPU_LAYERS})...")
    _llm = Llama(
        model_path=str(MODEL_PATH),
        n_gpu_layers=N_GPU_LAYERS,
        n_ctx=N_CTX,
        n_threads=4,
        verbose=False,
    )
    print(f"LLM loaded successfully ({MODEL_PATH.stat().st_size / 1e9:.1f} GB)")
    return _llm


# ── RAG: ChromaDB setup ─────────────────────────────────────────────────────

_collection = None


def get_collection():
    """Lazy-load ChromaDB collection (loaded once, reused across requests)."""
    global _collection
    if _collection is not None:
        return _collection

    if not CHROMA_DIR.exists():
        print(f"WARNING: ChromaDB not found at {CHROMA_DIR}. Run `python indexer.py` first.")
        return None

    embedding_fn = SentenceTransformerEmbeddingFunction(model_name=EMBEDDING_MODEL)
    client = chromadb.PersistentClient(path=str(CHROMA_DIR))

    try:
        _collection = client.get_collection(
            name=COLLECTION_NAME,
            embedding_function=embedding_fn,
        )
        print(f"Loaded ChromaDB collection: {_collection.count()} chunks")
    except Exception:
        print(f"WARNING: Collection '{COLLECTION_NAME}' not found. Run `python indexer.py` first.")
        return None

    return _collection


def retrieve_context(query: str, top_k: int = TOP_K) -> str:
    """Retrieve the most relevant knowledge chunks for a user query."""
    collection = get_collection()
    if collection is None:
        return ""

    results = collection.query(query_texts=[query], n_results=top_k)

    if not results["documents"] or not results["documents"][0]:
        return ""

    seen = set()
    chunks = []
    for doc in results["documents"][0]:
        if doc not in seen:
            seen.add(doc)
            chunks.append(doc)

    return "\n\n---\n\n".join(chunks)


# ── System prompt ────────────────────────────────────────────────────────────

SYSTEM_PROMPT_TEMPLATE = """You are an AI assistant for Themistoklis Baltzakis's portfolio website.
Answer questions about Themis professionally and helpfully. Be concise and friendly.

Use the RETRIEVED CONTEXT below to answer the user's question accurately.
If the context doesn't contain the answer, say you're not sure but suggest they contact Themis directly.
Do NOT make up information that isn't in the context.

RETRIEVED CONTEXT:
{context}

RULES:
- Answer based on the retrieved context above.
- Be concise — 2-4 sentences for simple questions, more for detailed ones.
- If asked about topics unrelated to Themis or his portfolio, politely redirect to portfolio-related questions.
- If the user wants to book, schedule, or arrange a meeting or call, respond ONLY with the exact token: [BOOK_CALL]
- Do not add any other text when emitting [BOOK_CALL]."""


# ── Models ───────────────────────────────────────────────────────────────────

class HistoryMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list[HistoryMessage] = []


# ── Chat logic ───────────────────────────────────────────────────────────────

def build_messages(message: str, history: list[HistoryMessage]) -> list[dict[str, str]]:
    """Build the message array with RAG-enhanced system prompt."""
    context = retrieve_context(message)

    system_prompt = SYSTEM_PROMPT_TEMPLATE.format(
        context=context if context else "No specific context retrieved. Use your general knowledge about Themis."
    )

    messages: list[dict[str, str]] = [{"role": "system", "content": system_prompt}]

    for entry in history:
        if entry.role in ("user", "assistant"):
            messages.append({"role": entry.role, "content": entry.content})

    messages.append({"role": "user", "content": message})
    return messages


def generate_response(messages: list[dict[str, str]]) -> str:
    """Generate a response using the local LLM (synchronous, runs in thread pool)."""
    llm = get_llm()
    if llm is None:
        return "Error: Local LLM model not loaded. Please run `python download_model.py` first."

    response = llm.create_chat_completion(
        messages=messages,
        max_tokens=MAX_TOKENS,
        temperature=0.7,
        top_p=0.9,
        stop=["<|eot_id|>"],
    )

    # Extract the generated text
    choice = response["choices"][0] if response.get("choices") else None
    if choice and choice.get("message"):
        return choice["message"].get("content", "").strip()
    return ""


async def stream_local_response(messages: list[dict[str, str]]) -> AsyncGenerator[str, None]:
    """Generate response from local LLM and emit as SSE events."""
    try:
        # Run the synchronous LLM call in a thread pool to not block the event loop
        loop = asyncio.get_event_loop()
        accumulated = await loop.run_in_executor(None, generate_response, messages)

        if not accumulated:
            yield f"data: {json.dumps({'error': 'No response generated'})}\n\n"
        elif "[BOOK_CALL]" in accumulated:
            yield f"data: {json.dumps({'action': 'start_booking'})}\n\n"
        else:
            yield f"data: {json.dumps({'token': accumulated})}\n\n"

    except Exception as e:
        yield f"data: {json.dumps({'error': f'LLM error: {str(e)}'})}\n\n"

    yield "data: [DONE]\n\n"


# ── Endpoints ────────────────────────────────────────────────────────────────

@app.post("/api/chat/stream")
async def chat_stream(request: ChatRequest):
    """Chat endpoint with RAG + local LLM — fully offline."""
    messages = build_messages(request.message, request.history)

    return StreamingResponse(
        stream_local_response(messages),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


@app.get("/api/health")
async def health_check():
    """Health check with model and RAG status."""
    llm = get_llm()
    collection = get_collection()

    return {
        "status": "ok",
        "model": {
            "name": MODEL_FILENAME,
            "loaded": llm is not None,
            "local": True,
            "gpu_layers": N_GPU_LAYERS,
        },
        "rag": {
            "indexed": collection is not None,
            "chunks": collection.count() if collection else 0,
        },
    }


if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)
