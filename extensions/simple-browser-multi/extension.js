const vscode = require('vscode')

function activate(context) {
  // Helper to create a new browser panel
  function createBrowserPanel(url) {
    const title = `Simple Browser — ${url}`
    const panel = vscode.window.createWebviewPanel(
      'simpleBrowserMulti.view',
      title,
      vscode.ViewColumn.Active,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
      },
    )

    panel.webview.html = getWebviewContent(url)

    // store the url in panel's state for serialization
    try {
      panel.state = panel.state || {}
      panel.state.url = url
    } catch (e) {
      // ignore
    }

    panel.onDidDispose(() => {
      // noop
    })

    return panel
  }

  // Show command (interactive)
  const showCmd = vscode.commands.registerCommand(
    'simpleBrowserMulti.show',
    async () => {
      const url = await vscode.window.showInputBox({
        prompt: 'Enter URL to open',
        placeHolder: 'https://example.com',
        value: 'https://example.com',
      })
      if (typeof url !== 'string' || url.trim() === '') return
      createBrowserPanel(url)
    },
  )

  // API open (accepts string or Uri)
  const apiOpen = vscode.commands.registerCommand(
    'simpleBrowserMulti.api.open',
    async (arg) => {
      const url =
        (arg && (arg.toString ? arg.toString() : String(arg))) || 'about:blank'
      createBrowserPanel(url)
    },
  )

  // Backwards-compatible API command name
  const legacyApiOpen = vscode.commands.registerCommand(
    'simpleBrowser.api.open',
    async (arg) => {
      const url =
        (arg && (arg.toString ? arg.toString() : String(arg))) || 'about:blank'
      createBrowserPanel(url)
    },
  )

  // Alias to original simpleBrowser.show
  const simpleShow = vscode.commands.registerCommand(
    'simpleBrowser.show',
    async () => {
      const url = await vscode.window.showInputBox({
        prompt: 'Enter URL to open',
        placeHolder: 'https://example.com',
        value: 'https://example.com',
      })
      if (typeof url !== 'string' || url.trim() === '') return
      createBrowserPanel(url)
    },
  )

  // Register a serializer so panels can be restored
  if (vscode.window.registerWebviewPanelSerializer) {
    try {
      const serializer = {
        async deserializeWebviewPanel(panel, state) {
          // state contains serialized view state; expect { url }
          const url = (state && state.url) || 'about:blank'
          panel.webview.html = getWebviewContent(url)
        },
      }
      context.subscriptions.push(
        vscode.window.registerWebviewPanelSerializer(
          'simpleBrowserMulti.view',
          serializer,
        ),
      )
    } catch (e) {
      // ignore on older API
    }
  }

  context.subscriptions.push(showCmd, apiOpen, legacyApiOpen, simpleShow)
}

function deactivate() {}

function getWebviewContent(targetUrl) {
  // Basic webview with an address bar and an iframe
  const escapedUrl = escapeHtml(targetUrl)
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <style>
      body,html{height:100%;margin:0}
      .top{display:flex;padding:6px;gap:6px;background:#1e1e1e}
      input{flex:1;padding:6px;border-radius:4px;border:1px solid #444;background:#fff}
      button{padding:6px 10px;border-radius:4px}
      iframe{width:100%;height:calc(100% - 48px);border:0}
    </style>
  </head>
  <body>
    <div class="top">
      <input id="address" value="${escapedUrl}" />
      <button id="go">Go</button>
      <button id="openExternal">Open External</button>
    </div>
    <iframe id="frame" src="${escapedUrl}"></iframe>
    <script>
      const vscode = acquireVsCodeApi?.();
      const input = document.getElementById('address');
      const btn = document.getElementById('go');
      const openExternal = document.getElementById('openExternal');
      const frame = document.getElementById('frame');

      function navigate() {
        const val = input.value;
        if (!val) return;
        // Basic heuristic: add scheme if missing
        const hasScheme = /^[a-zA-Z][a-zA-Z0-9+-.]*:/.test(val);
        const url = hasScheme ? val : 'https://' + val;
        frame.src = url;
        document.title = 'Simple Browser — ' + url;
      }

      btn.addEventListener('click', navigate);
      input.addEventListener('keydown', (e)=>{ if(e.key==='Enter') navigate(); });
      openExternal.addEventListener('click', ()=>{
        const url = input.value || frame.src;
        window.open(url, '_blank');
      });
    </script>
  </body>
</html>`
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

module.exports = { activate, deactivate }
