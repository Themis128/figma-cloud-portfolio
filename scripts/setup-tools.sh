#!/usr/bin/env bash
set -euo pipefail

printf '%s\n' "[*] Setting up external tools (Unix)..."

if ! command -v node >/dev/null 2>&1; then
  echo "[!] ERROR: Node.js is required." >&2
  exit 1
fi

if ! command -v pnpm >/dev/null 2>&1; then
  echo "[!] ERROR: pnpm is required." >&2
  exit 1
fi

install_with_brew() {
  brew install gitleaks awscli python || true
}

install_with_apt() {
  sudo apt-get update
  sudo apt-get install -y awscli python3 python3-pip

  if ! command -v gitleaks >/dev/null 2>&1; then
    echo "[*] Installing gitleaks from GitHub releases..."
    tmp_dir=$(mktemp -d)
    curl -sSL https://github.com/gitleaks/gitleaks/releases/latest/download/gitleaks_8.24.0_linux_x64.tar.gz -o "$tmp_dir/gitleaks.tar.gz"
    tar -xzf "$tmp_dir/gitleaks.tar.gz" -C "$tmp_dir"
    sudo install -m 0755 "$tmp_dir/gitleaks" /usr/local/bin/gitleaks
    rm -rf "$tmp_dir"
  fi
}

if command -v brew >/dev/null 2>&1; then
  echo "[+] Using brew to install tools..."
  install_with_brew
elif command -v apt-get >/dev/null 2>&1; then
  echo "[+] Using apt to install tools..."
  install_with_apt
else
  echo "[!] WARNING: No supported package manager found (brew/apt)." >&2
  echo "    Install tools manually:" >&2
  echo "    - gitleaks: https://github.com/gitleaks/gitleaks/releases" >&2
  echo "    - AWS CLI: https://aws.amazon.com/cli/" >&2
  echo "    - Python: https://www.python.org/" >&2
fi

printf '%s\n' ""
printf '%s\n' "[*] Installing Playwright browsers..."
pnpm exec playwright install

printf '%s\n' ""
printf '%s\n' "[+] Tool setup complete!"

