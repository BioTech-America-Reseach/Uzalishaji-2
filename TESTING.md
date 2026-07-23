# Testing checklist

## Quick static check

Run this before pushing:

```bash
node scripts/smoke-check.mjs
```

## Local browser test

1. Start a static server from the repository root:
   ```bash
   cd /home/runner/work/Uzalishaji-2/Uzalishaji-2
   python -m http.server 8000
   ```
2. Open `http://127.0.0.1:8000/index.html`.
3. Confirm the page loads and the canvas appears without JavaScript errors in the browser console.
4. Verify core offline-safe flows:
   - Upload a local image with **📁 Pakia picha kuu**
   - Add a text layer with **➕/💾 Ongeza au Update**
   - Draw on the canvas with **✏️ Draw**
   - Download with **⬇️ Pakua**
5. Verify graceful third-party failures:
   - Leave the Mistral key empty and try **📤** or **✨ AI Pendekezo**; a clear error should appear
   - Try **✨ Zalisha** with networking blocked or the service unavailable; the loading indicator must stop and the status message must explain the failure
   - Leave Supabase empty; local editing/download must still work
   - Try Facebook publish without pages/tokens; the app must show an error instead of claiming success
6. If you do have real credentials, also verify:
   - Mistral chat/post assistance returns text
   - Supabase save/load works
   - Facebook immediate publish succeeds only after a successful API response
   - Facebook scheduled posts are described as scheduled, not already published

## After GitHub Pages deployment

1. In **Settings → Pages**, use **Deploy from a branch**.
2. Select branch **main** and folder **/(root)**, then save.
3. Wait for the latest **pages-build-deployment** workflow to finish.
4. Open the GitHub Pages URL in a fresh/incognito tab.
5. Repeat the local browser checklist above, especially:
   - page load + visible canvas
   - local upload
   - text layer editing
   - drawing
   - PNG download
   - graceful AI/Supabase/Facebook failure handling when credentials are missing
