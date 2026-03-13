"""Knowledge base indexer — reads markdown docs, chunks them, and stores embeddings in ChromaDB."""

import os
import re
from pathlib import Path

import chromadb
from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction

KNOWLEDGE_DIR = Path(__file__).parent / "knowledge"
CHROMA_DIR = Path(__file__).parent / "chroma_db"
COLLECTION_NAME = "portfolio_knowledge"
EMBEDDING_MODEL = "all-MiniLM-L6-v2"  # Fast, free, 384-dim

# Chunk size tuned for RAG: small enough for precision, large enough for context
CHUNK_SIZE = 500  # characters
CHUNK_OVERLAP = 100


def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    """Split text into overlapping chunks at paragraph/section boundaries."""
    # Split on double newlines (paragraphs) first
    paragraphs = re.split(r"\n\n+", text.strip())

    chunks: list[str] = []
    current_chunk = ""

    for para in paragraphs:
        para = para.strip()
        if not para:
            continue

        # If adding this paragraph exceeds chunk size, save current and start new
        if current_chunk and len(current_chunk) + len(para) + 2 > chunk_size:
            chunks.append(current_chunk.strip())
            # Keep overlap from end of previous chunk
            if overlap > 0 and len(current_chunk) > overlap:
                current_chunk = current_chunk[-overlap:] + "\n\n" + para
            else:
                current_chunk = para
        else:
            current_chunk = current_chunk + "\n\n" + para if current_chunk else para

    # Don't forget the last chunk
    if current_chunk.strip():
        chunks.append(current_chunk.strip())

    return chunks


def extract_metadata(filename: str, content: str) -> dict[str, str]:
    """Extract metadata from filename and content."""
    # Get topic from filename: 01_identity.md -> identity
    topic = re.sub(r"^\d+_", "", filename.replace(".md", "")).replace("_", " ")

    # Get the first heading as title
    title_match = re.search(r"^#\s+(.+)$", content, re.MULTILINE)
    title = title_match.group(1) if title_match else topic.title()

    return {"source": filename, "topic": topic, "title": title}


def build_index() -> int:
    """Read all knowledge files, chunk them, and index into ChromaDB. Returns chunk count."""
    embedding_fn = SentenceTransformerEmbeddingFunction(model_name=EMBEDDING_MODEL)

    client = chromadb.PersistentClient(path=str(CHROMA_DIR))

    # Delete existing collection if it exists (full rebuild)
    try:
        client.delete_collection(COLLECTION_NAME)
    except Exception:
        pass

    collection = client.create_collection(
        name=COLLECTION_NAME,
        embedding_function=embedding_fn,
        metadata={"hnsw:space": "cosine"},
    )

    documents: list[str] = []
    metadatas: list[dict[str, str]] = []
    ids: list[str] = []

    knowledge_files = sorted(KNOWLEDGE_DIR.glob("*.md"))
    if not knowledge_files:
        print(f"No knowledge files found in {KNOWLEDGE_DIR}")
        return 0

    for filepath in knowledge_files:
        content = filepath.read_text(encoding="utf-8")
        meta = extract_metadata(filepath.name, content)
        chunks = chunk_text(content)

        for i, chunk in enumerate(chunks):
            doc_id = f"{filepath.stem}_chunk_{i}"
            documents.append(chunk)
            metadatas.append(meta)
            ids.append(doc_id)

    # Batch insert (ChromaDB handles embedding automatically)
    collection.add(documents=documents, metadatas=metadatas, ids=ids)

    print(f"Indexed {len(documents)} chunks from {len(knowledge_files)} files")
    print(f"ChromaDB stored at: {CHROMA_DIR}")
    return len(documents)


if __name__ == "__main__":
    build_index()
