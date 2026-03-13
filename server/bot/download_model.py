"""Download the GGUF model file from HuggingFace Hub (one-time setup)."""

from pathlib import Path

from huggingface_hub import hf_hub_download

MODELS_DIR = Path(__file__).parent / "models"

# Llama 3.2 3B Instruct — Q4_K_M quantization (~2GB, great quality/size ratio)
REPO_ID = "bartowski/Llama-3.2-3B-Instruct-GGUF"
FILENAME = "Llama-3.2-3B-Instruct-Q4_K_M.gguf"


def download():
    MODELS_DIR.mkdir(exist_ok=True)
    target = MODELS_DIR / FILENAME

    if target.exists():
        print(f"Model already exists: {target} ({target.stat().st_size / 1e9:.1f} GB)")
        return str(target)

    print(f"Downloading {FILENAME} from {REPO_ID}...")
    print("This is a one-time download (~2 GB). Please wait...")

    path = hf_hub_download(
        repo_id=REPO_ID,
        filename=FILENAME,
        local_dir=str(MODELS_DIR),
    )

    print(f"Downloaded to: {path}")
    return path


if __name__ == "__main__":
    download()
