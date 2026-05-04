/**
 * FreeImageScanner.jsx  —  Fixed Version
 *
 * FIXES:
 *  - Puter.js: wrapped in full try/catch, shows friendly setup message instead of crashing
 *  - All providers: individual error boundaries so one failure doesn't affect others
 *  - Puter.js WebSocket errors caught and surfaced as a human-readable notice
 *  - Results from previous providers cached so switching tabs keeps them
 */

import { useState, useRef, useCallback } from 'react';

/* ─── CONFIG — paste your free keys here ─────────────────────────────────── */
const CONFIG = {
 clarifai: {
  pat:     '558e157b5acd4cd691b4d265855b0063',
  modelId: 'general-image-recognition',
  userId:  'clarifai',
  appId:   'main',
},
  ocr: {
    apiKey: 'helloworld',   // replace with your free key from ocr.space/ocrapi
  },
  imagga: {
  apiKey:    'acc_a7790d193c4f0a0',
  apiSecret: 'f70849f635dd452008d78e9bf14c2e47',
},
};

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
const toBase64 = (file) => new Promise((res, rej) => {
  const r = new FileReader();
  r.onload  = () => res(r.result);
  r.onerror = rej;
  r.readAsDataURL(file);
});

const stripPrefix = (b64) => b64.replace(/^data:image\/[a-z+]+;base64,/, '');

const b64ToBlob = (b64, type = 'image/jpeg') => {
  const byteStr = atob(stripPrefix(b64));
  const arr = new Uint8Array(byteStr.length);
  for (let i = 0; i < byteStr.length; i++) arr[i] = byteStr.charCodeAt(i);
  return new Blob([arr], { type });
};

/* ─── Provider runners ────────────────────────────────────────────────────── */

async function runClarifai(b64) {
  // ✅ only check if empty, NOT equal to your key
  if (!CONFIG.clarifai.pat) {
    throw new Error('Clarifai PAT not set.');
  }

  const resp = await fetch(
    `https://api.clarifai.com/v2/users/${CONFIG.clarifai.userId}/apps/${CONFIG.clarifai.appId}/models/${CONFIG.clarifai.modelId}/outputs`,
    {
      method: 'POST',
      headers: {
        Authorization: `Key ${CONFIG.clarifai.pat}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: [
          {
            data: {
              image: { base64: stripPrefix(b64) }
            }
          }
        ]
      }),
    }
  );

  if (!resp.ok) {
    throw new Error(`Clarifai HTTP Error: ${resp.status}`);
  }

  const json = await resp.json();

  if (json.status?.code !== 10000) {
    throw new Error(json.status?.description || 'Clarifai API error');
  }

  return json.outputs[0].data.concepts
    .slice(0, 12)
    .map((c) => ({
      label: c.name,
      score: c.value
    }));
}

async function runOCR(b64) {
  const body = new FormData();
  body.append('base64Image', b64);
  body.append('language', 'eng');
  body.append('isOverlayRequired', 'false');
  body.append('OCREngine', '2');
  const resp = await fetch('https://api.ocr.space/parse/image', {
    method: 'POST',
    headers: { apikey: CONFIG.ocr.apiKey },
    body,
  });
  if (!resp.ok) throw new Error(`OCR.Space HTTP ${resp.status}`);
  const json = await resp.json();
  if (json.IsErroredOnProcessing) throw new Error(json.ErrorMessage?.[0] || 'OCR processing error');
  const text = json.ParsedResults?.[0]?.ParsedText?.trim() || '';
  return {
    text: text || '(No text detected in this image)',
    wordCount: text.split(/\s+/).filter(Boolean).length,
  };
}

async function runImagga(b64) {
  const creds = btoa(`${CONFIG.imagga.apiKey}:${CONFIG.imagga.apiSecret}`);

  const form  = new FormData();
  form.append('image', b64ToBlob(b64), 'image.jpg');

  const uploadResp = await fetch('https://api.imagga.com/v2/uploads', {
    method: 'POST',
    headers: { Authorization: `Basic ${creds}` },
    body: form,
  });

  if (!uploadResp.ok) {
    throw new Error(`Imagga upload failed (HTTP ${uploadResp.status})`);
  }

  const uploadJson = await uploadResp.json();

  if (uploadJson.status?.type !== 'success') {
    throw new Error(
      'Imagga upload rejected: ' + (uploadJson.status?.text || 'unknown')
    );
  }

  const uploadId = uploadJson.result.upload_id;

  const [tagResp, catResp] = await Promise.all([
    fetch(`https://api.imagga.com/v2/tags?image_upload_id=${uploadId}`, {
      headers: { Authorization: `Basic ${creds}` }
    }),
    fetch(`https://api.imagga.com/v2/categories/personal_photos?image_upload_id=${uploadId}`, {
      headers: { Authorization: `Basic ${creds}` }
    }),
  ]);

  const tagJson = await tagResp.json();
  const catJson = await catResp.json();

  return {
    tags:
      tagJson.result?.tags?.slice(0, 14).map((t) => ({
        label: t.tag.en,
        score: t.confidence / 100
      })) || [],

    categories:
      catJson.result?.categories?.slice(0, 4).map((c) => ({
        label: c.name.en,
        score: c.confidence / 100
      })) || [],
  };
}

// ── Extract plain text from any Puter ai.chat() response shape ──
function extractPuterText(result) {
  if (!result) return '';
  // Plain string
  if (typeof result === 'string') return result.trim();
  // {message:{content:[{type:'text',text:'...'}]}}  ← current Puter v2 shape
  if (result?.message?.content) {
    const content = result.message.content;
    if (Array.isArray(content)) {
      return content
        .filter((b) => b.type === 'text')
        .map((b) => b.text)
        .join('\n')
        .trim();
    }
    if (typeof content === 'string') return content.trim();
  }
  // {choices:[{message:{content:'...'}}]}  ← OpenAI-compat shape
  if (Array.isArray(result?.choices)) {
    return (result.choices[0]?.message?.content || '').trim();
  }
  // {content:'...'}
  if (typeof result?.content === 'string') return result.content.trim();
  // {text:'...'}
  if (typeof result?.text === 'string') return result.text.trim();
  // fallback — should never reach here
  return '';
}

// ── Puter.js runner — fully isolated, never throws to caller unhandled ──
async function runPuter(b64) {
  if (typeof window === 'undefined' || typeof window.puter === 'undefined') {
    throw new Error(
      'Puter.js script not loaded.\n\nAdd this line to your index.html <head>:\n<script src="https://js.puter.com/v2/"></script>\n\nNote: Puter.js requires a WebSocket connection to api.puter.com.'
    );
  }

  const puter = window.puter;
  const blob  = b64ToBlob(b64);
  const file  = new File([blob], 'image.jpg', { type: 'image/jpeg' });

  let ocrText     = '';
  let description = '';
  let ocrError    = '';
  let descError   = '';

  // ── Vision description via ai.chat with image attachment ──
  // Puter v2 correct usage: pass image as second arg array item
  try {
    if (puter.ai && typeof puter.ai.chat === 'function') {
      const result = await Promise.race([
        puter.ai.chat(
          [
            {
              role: 'user',
              content: [
                { type: 'image_url', image_url: { url: await toBase64(file) } },
                { type: 'text',      text: 'Describe this image in 2-3 sentences. Be specific about what you see.' },
              ],
            },
          ],
          { model: 'gpt-4o-mini' }
        ),
        new Promise((_, rej) => setTimeout(() => rej(new Error('Timed out after 20s')), 20000)),
      ]);
      description = extractPuterText(result);
      if (!description) descError = 'Empty response from AI — the model may not support vision in this environment';
    } else {
      descError = 'puter.ai.chat() not available';
    }
  } catch (e) {
    descError = e.message || 'Description failed';
  }

  // ── OCR via puter.ai.chat (vision) as fallback since puter.ocr is removed in v2 ──
  try {
    if (puter.ai && typeof puter.ai.chat === 'function') {
      const result = await Promise.race([
        puter.ai.chat(
          [
            {
              role: 'user',
              content: [
                { type: 'image_url', image_url: { url: await toBase64(file) } },
                { type: 'text',      text: 'Extract ALL text visible in this image exactly as it appears. If there is no text, reply with exactly: (no text)' },
              ],
            },
          ],
          { model: 'gpt-4o-mini' }
        ),
        new Promise((_, rej) => setTimeout(() => rej(new Error('Timed out after 20s')), 20000)),
      ]);
      ocrText = extractPuterText(result);
      if (!ocrText || ocrText === '(no text)') ocrText = '(No text detected in image)';
    } else {
      ocrError = 'puter.ai.chat() not available';
    }
  } catch (e) {
    ocrError = e.message || 'OCR failed';
  }

  if (!ocrText && !description && (ocrError || descError)) {
    const msg = [descError, ocrError].filter(Boolean).join(' | ');
    throw new Error(`Puter.js features failed: ${msg}\n\nThis usually means the WebSocket to api.puter.com is blocked or the user is not signed in.`);
  }

  return {
    description: description || (descError ? `(Unavailable: ${descError})` : ''),
    ocr:         ocrText     || (ocrError  ? `(Unavailable: ${ocrError})`  : '(No text found)'),
  };
}

/* ─── UI helpers ─────────────────────────────────────────────────────────── */
function Bar({ score, color = '#1e40af' }) {
  const p = Math.min(Math.max(score * 100, 0), 100).toFixed(1);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 5, background: '#e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${p}%`, height: '100%', background: color, borderRadius: 3, transition: 'width .7s ease' }} />
      </div>
      <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#6b7280', minWidth: 38, textAlign: 'right' }}>{p}%</span>
    </div>
  );
}

const PROVIDER_META = {
  clarifai: { label: 'Clarifai',  color: '#6366f1', icon: '🧠', free: '1,000/mo',   speed: '~2 sec' },
  ocr:      { label: 'OCR.Space', color: '#0891b2', icon: '📄', free: '25,000/mo',  speed: '~1 sec' },
  imagga:   { label: 'Imagga',    color: '#16a34a', icon: '🏷️', free: '1,000/mo',   speed: '~3 sec' },
  puter:    { label: 'Puter.js',  color: '#d97706', icon: '⚡', free: 'Unlimited',  speed: '~4 sec' },
};

/* ════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════════════ */
export default function FreeImageScanner() {
  const [imgSrc,   setImgSrc]   = useState(null);
  const [imgFile,  setImgFile]  = useState(null);
  const [imgB64,   setImgB64]   = useState(null);
  const [provider, setProvider] = useState('clarifai');

  // Per-provider state
  const [statuses, setStatuses] = useState({});   // { clarifai: 'idle'|'running'|'done'|'error' }
  const [results,  setResults]  = useState({});
  const [errors,   setErrors]   = useState({});

  const fileRef = useRef(null);

  const loadFile = useCallback(async (file) => {
    if (!file?.type.startsWith('image/')) return;
    const b64 = await toBase64(file);
    setImgSrc(URL.createObjectURL(file));
    setImgFile(file);
    setImgB64(b64);
    setResults({});
    setErrors({});
    setStatuses({});
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag');
    loadFile(e.dataTransfer.files[0]);
  }, [loadFile]);

  const analyse = useCallback(async () => {
    if (!imgB64 || statuses[provider] === 'running') return;

    setStatuses((p) => ({ ...p, [provider]: 'running' }));
    setErrors((p)   => ({ ...p, [provider]: '' }));

    try {
      let res;
      if (provider === 'clarifai') res = await runClarifai(imgB64);
      else if (provider === 'ocr') res = await runOCR(imgB64);
      else if (provider === 'imagga') res = await runImagga(imgB64);
      else res = await runPuter(imgB64);

      setResults((p)  => ({ ...p, [provider]: res }));
      setStatuses((p) => ({ ...p, [provider]: 'done' }));
    } catch (err) {
      setErrors((p)   => ({ ...p, [provider]: err.message }));
      setStatuses((p) => ({ ...p, [provider]: 'error' }));
    }
  }, [imgB64, provider, statuses]);

  const cur    = results[provider];
  const meta   = PROVIDER_META[provider];
  const status = statuses[provider] || 'idle';
  const errMsg = errors[provider]   || '';
  const busy   = status === 'running';

  const clearImage = () => {
    setImgSrc(null); setImgFile(null); setImgB64(null);
    setResults({}); setErrors({}); setStatuses({});
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        @keyframes spin  { to { transform:rotate(360deg); } }
        @keyframes fadeU { from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:none;} }
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:.35} }

        .fis{min-height:100vh;background:#f0f2f8;font-family:'DM Sans',sans-serif;padding-bottom:60px;}
        .fis-bar{background:#0d1b3e;height:52px;display:flex;align-items:center;padding:0 24px;gap:12px;}
        .fis-bar-dot{width:7px;height:7px;border-radius:50%;background:#60a5fa;animation:pulse 2s ease infinite;}
        .fis-bar-title{font-size:17px;font-weight:700;color:#fff;letter-spacing:-.3px;}
        .fis-bar-tag{margin-left:auto;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);padding:3px 11px;font-size:10px;letter-spacing:1.8px;text-transform:uppercase;color:#93b4f0;font-weight:500;border-radius:2px;}

        .fis-wrap{max-width:1020px;margin:0 auto;padding:24px 18px 0;display:grid;grid-template-columns:1fr 1fr;gap:18px;align-items:start;}
        @media(max-width:700px){.fis-wrap{grid-template-columns:1fr;}}

        .fis-card{background:#fff;border:1.5px solid #e2e6ef;border-radius:3px;overflow:hidden;}
        .fis-hd{padding:12px 16px;border-bottom:1.5px solid #e2e6ef;display:flex;align-items:center;gap:8px;}
        .fis-hd-title{font-size:11px;font-weight:600;letter-spacing:1.2px;text-transform:uppercase;color:#0d1b3e;}

        .fis-drop{margin:16px;border:2px dashed #d1d5db;border-radius:3px;padding:40px 20px;display:flex;flex-direction:column;align-items:center;gap:9px;cursor:pointer;transition:border-color .2s,background .2s;}
        .fis-drop:hover,.fis-drop.drag{border-color:#1a3a8f;background:#eff6ff;}
        .fis-drop-txt{font-size:14px;color:#4b5563;font-weight:500;}
        .fis-drop-sub{font-size:12px;color:#9ca3af;}

        .fis-preview{margin:16px;border:1.5px solid #e2e6ef;border-radius:3px;overflow:hidden;}
        .fis-preview img{width:100%;height:auto;max-height:320px;object-fit:contain;background:#f8f9fb;display:block;}
        .fis-preview-foot{display:flex;align-items:center;padding:8px 12px;background:#f8f9fb;border-top:1px solid #e2e6ef;font-size:11px;color:#9ca3af;gap:10px;}
        .fis-rm{margin-left:auto;background:none;border:none;font-size:11px;color:#dc2626;cursor:pointer;font-family:'DM Sans',sans-serif;font-weight:600;}

        .fis-providers{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:12px 16px;border-bottom:1.5px solid #e2e6ef;}
        .fis-prov-btn{padding:10px 12px;border:1.5px solid #e2e6ef;border-radius:3px;background:#f8f9fb;cursor:pointer;display:flex;align-items:center;gap:8px;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:500;color:#374151;transition:all .15s ease;text-align:left;position:relative;}
        .fis-prov-btn:hover{background:#eff6ff;border-color:#93c5fd;}
        .fis-prov-btn.active{background:#0d1b3e;border-color:#0d1b3e;color:#fff;}
        .fis-prov-done{position:absolute;top:5px;right:7px;width:6px;height:6px;border-radius:50%;background:#22c55e;}
        .fis-prov-emoji{font-size:16px;flex-shrink:0;}
        .fis-prov-name{font-size:12px;font-weight:600;display:block;}
        .fis-prov-free{font-size:10px;opacity:.6;display:block;margin-top:1px;}

        .fis-desc{margin:0 16px 12px;padding:10px 13px;background:#f8f9fb;border:1px solid #e2e6ef;border-left:3px solid var(--pc);border-radius:2px;font-size:12px;color:#4b5563;line-height:1.6;}

        .fis-btn-wrap{padding:12px 16px;border-top:1.5px solid #e2e6ef;}
        .fis-btn{width:100%;height:42px;background:#1a3a8f;color:#fff;border:none;border-radius:3px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;letter-spacing:.8px;text-transform:uppercase;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:9px;transition:background .15s,transform .1s;}
        .fis-btn:hover:not(:disabled){background:#1e4bbd;}
        .fis-btn:disabled{opacity:.5;cursor:not-allowed;}
        .spin{animation:spin .7s linear infinite;}

        .fis-status{margin:10px 16px 0;padding:11px 13px;background:#eff6ff;border:1px solid #bfdbfe;border-left:3px solid #1a3a8f;border-radius:2px;display:flex;align-items:center;gap:8px;font-size:13px;color:#1e40af;}

        /* Error box — scrollable for long messages */
        .fis-error{margin:10px 16px 0;padding:11px 13px;background:#fef2f2;border:1px solid #fecaca;border-left:3px solid #dc2626;border-radius:2px;font-size:13px;color:#b91c1c;display:flex;align-items:flex-start;gap:8px;}
        .fis-error pre{font-family:'DM Mono',monospace;font-size:11px;white-space:pre-wrap;word-break:break-word;line-height:1.6;max-height:160px;overflow-y:auto;}

        .fis-results{padding:16px;animation:fadeU .4s ease both;}
        .fis-res-eye{font-size:10px;font-weight:600;letter-spacing:1.8px;text-transform:uppercase;color:#6b7280;margin-bottom:14px;}

        .fis-hero-chip{background:#0d1b3e;border-radius:3px;padding:14px 16px;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px;}
        .fis-hero-label{font-size:18px;font-weight:700;color:#fff;}
        .fis-hero-score{font-family:'DM Mono',monospace;font-size:22px;color:#60a5fa;}

        .fis-row{margin-bottom:11px;}
        .fis-row-top{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px;}
        .fis-row-name{font-size:13px;color:#111827;font-weight:500;max-width:70%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}

        .fis-ocr{background:#f8f9fb;border:1px solid #e2e6ef;border-left:3px solid #0891b2;border-radius:2px;padding:14px 16px;}
        .fis-ocr pre{font-family:'DM Mono',monospace;font-size:12px;color:#374151;white-space:pre-wrap;word-break:break-word;line-height:1.7;}
        .fis-ocr-stat{font-size:11px;color:#9ca3af;margin-top:8px;}

        .fis-cats{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:14px;}
        .fis-cat-chip{padding:4px 12px;background:#dcfce7;border:1.5px solid #86efac;border-radius:100px;font-size:12px;font-weight:600;color:#166534;}

        .fis-puter-desc{background:#fffbeb;border:1px solid #fde68a;border-left:3px solid #d97706;border-radius:2px;padding:14px 16px;font-size:14px;color:#78350f;line-height:1.7;font-style:italic;margin-bottom:14px;}

        .fis-info-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:14px;}
        @media(max-width:700px){.fis-info-grid{grid-template-columns:1fr 1fr;}}
        .fis-info-card{background:#fff;border:1.5px solid #e2e6ef;border-radius:3px;padding:11px 12px;}
        .fis-info-lbl{font-size:9px;letter-spacing:1.5px;text-transform:uppercase;color:#9ca3af;margin-bottom:4px;}
        .fis-info-val{font-size:13px;font-weight:700;color:#0d1b3e;}
        .fis-info-sub{font-size:10px;color:#6b7280;margin-top:2px;}

        .fis-tip{background:#f0fdf4;border:1px solid #bbf7d0;border-left:3px solid #16a34a;border-radius:2px;padding:10px 13px;font-size:12px;color:#166534;margin-top:14px;line-height:1.6;}
        .fis-tip a{color:#166534;font-weight:600;}
        .fis-tip code{background:#dcfce7;padding:1px 5px;font-family:'DM Mono',monospace;font-size:11px;border-radius:2px;}

        /* Puter warning box */
        .fis-warn{background:#fffbeb;border:1px solid #fde68a;border-left:3px solid #d97706;border-radius:2px;padding:12px 14px;font-size:12px;color:#78350f;line-height:1.7;margin:10px 16px 0;}
        .fis-warn code{background:#fef3c7;padding:1px 5px;font-family:'DM Mono',monospace;font-size:11px;border-radius:2px;}

        .cached-badge{display:inline-flex;align-items:center;gap:5px;padding:2px 9px;background:#dcfce7;border:1px solid #86efac;border-radius:100px;font-size:10px;font-weight:600;color:#166534;margin-left:auto;}

        .fis-empty{padding:36px 16px;text-align:center;}
        .fis-empty p{font-size:13px;color:#9ca3af;margin-top:10px;}
      `}</style>

      <div className="fis">
        {/* TOP BAR */}
        <div className="fis-bar">
          <div className="fis-bar-dot" />
          <span className="fis-bar-title"> Scanner</span>
        </div>

        <div className="fis-wrap">

          {/* ═══ LEFT — Upload ═══ */}
          <div>
            <div className="fis-card">
              <div className="fis-hd">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a3a8f" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                <span className="fis-hd-title">Upload Image</span>
              </div>

              {!imgSrc ? (
                <div
                  className="fis-drop"
                  onClick={() => fileRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('drag'); }}
                  onDragLeave={(e) => e.currentTarget.classList.remove('drag')}
                >
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.4">
                    <polyline points="16 16 12 12 8 16"/>
                    <line x1="12" y1="12" x2="12" y2="21"/>
                    <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/>
                  </svg>
                  <p className="fis-drop-txt">Drop image or click to browse</p>
                  <p className="fis-drop-sub">JPG · PNG · WEBP · GIF</p>
                </div>
              ) : (
                <>
                  <div className="fis-preview">
                    <img src={imgSrc} alt="preview" />
                  </div>
                  <div className="fis-preview-foot">
                    <span>{imgFile?.name}</span>
                    <span>{imgFile ? (imgFile.size / 1024).toFixed(0) + ' KB' : ''}</span>
                    <button className="fis-rm" onClick={clearImage}>✕ Remove</button>
                  </div>
                </>
              )}

              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
                onChange={(e) => loadFile(e.target.files[0])} />

              {/* Status */}
              {busy && (
                <div className="fis-status">
                  <svg className="spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
                  </svg>
                  Running {meta.label}…
                </div>
              )}

              {/* Error — shown below status */}
              {status === 'error' && errMsg && (
                <div className="fis-error">
                  <span style={{ flexShrink: 0 }}>⚠</span>
                  <div>
                    <strong>Error ({meta.label}):</strong>
                    <pre style={{ marginTop: 5 }}>{errMsg}</pre>
                  </div>
                </div>
              )}

              {/* Puter-specific warning when not loaded */}
              {provider === 'puter' && status === 'idle' && !cur && (
                <div className="fis-warn">
                  <strong>⚠ Puter.js requires extra setup:</strong><br />
                  Add to your <code>index.html</code> <code>&lt;head&gt;</code>:<br />
                  <code>&lt;script src="https://js.puter.com/v2/"&gt;&lt;/script&gt;</code><br /><br />
                  Puter.js uses WebSockets to <code>api.puter.com</code>. If that domain is blocked by your environment, use one of the other 3 providers instead.
                </div>
              )}

              {/* Analyse button */}
              <div className="fis-btn-wrap">
                <button className="fis-btn" onClick={analyse} disabled={!imgSrc || busy}>
                  {busy ? (
                    <>
                      <svg className="spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
                      </svg>
                      Analysing…
                    </>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <polygon points="5 3 19 12 5 21 5 3"/>
                      </svg>
                      {cur ? `Re-run ${meta.label}` : `Analyse with ${meta.label}`}
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Provider info grid */}
            <div className="fis-info-grid">
              {Object.entries(PROVIDER_META).map(([id, m]) => (
                <div key={id} className="fis-info-card" style={{ borderTopColor: m.color, borderTopWidth: 3 }}>
                  <div className="fis-info-lbl">{m.icon} {m.label}</div>
                  <div className="fis-info-val">{m.speed}</div>
                  <div className="fis-info-sub">{m.free} free</div>
                  {results[id] && <div style={{ marginTop: 5 }}><span className="cached-badge">✓ Done</span></div>}
                  {errors[id]  && <div style={{ marginTop: 5, fontSize: 10, color: '#dc2626' }}>✕ Error</div>}
                </div>
              ))}
            </div>

            {/* Setup tips */}
            <div className="fis-tip">
              <strong>One-time key setup:</strong><br />
              • <strong>Clarifai:</strong> <a href="https://clarifai.com" target="_blank" rel="noreferrer">clarifai.com</a> → Sign up → Security → Create PAT<br />
              • <strong>OCR.Space:</strong> <a href="https://ocr.space/ocrapi" target="_blank" rel="noreferrer">ocr.space/ocrapi</a> → free key (or use <code>helloworld</code> to test)<br />
              • <strong>Imagga:</strong> <a href="https://imagga.com" target="_blank" rel="noreferrer">imagga.com</a> → Sign up → Dashboard → API credentials<br />
              • <strong>Puter.js:</strong> No key — but add <code>&lt;script src="https://js.puter.com/v2/"&gt;&lt;/script&gt;</code> to <code>index.html</code>
            </div>
          </div>

          {/* ═══ RIGHT — Provider selector + Results ═══ */}
          <div>
            <div className="fis-card">
              <div className="fis-hd">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a3a8f" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/>
                </svg>
                <span className="fis-hd-title">Choose Provider</span>
                {cur && <span className="cached-badge">✓ Results ready</span>}
              </div>

              {/* Provider buttons */}
              <div className="fis-providers">
                {Object.entries(PROVIDER_META).map(([id, m]) => (
                  <button
                    key={id}
                    className={`fis-prov-btn${provider === id ? ' active' : ''}`}
                    onClick={() => setProvider(id)}
                  >
                    {results[id] && <span className="fis-prov-done" />}
                    <span className="fis-prov-emoji">{m.icon}</span>
                    <span className="fis-prov-info">
                      <span className="fis-prov-name">{m.label}</span>
                      <span className="fis-prov-free">{m.free} · {m.speed}</span>
                    </span>
                  </button>
                ))}
              </div>

              {/* What this provider does */}
              <div className="fis-desc" style={{ '--pc': meta.color }}>
                {provider === 'clarifai' && <><strong style={{ color: '#0d1b3e' }}>Image Recognition</strong> — Returns labels for everything visible in the image with confidence scores. Great for general-purpose tagging.</>}
                {provider === 'ocr'      && <><strong style={{ color: '#0d1b3e' }}>OCR Text Extraction</strong> — Reads and returns all text found inside the image. Works on documents, screenshots, signs, receipts.</>}
                {provider === 'imagga'   && <><strong style={{ color: '#0d1b3e' }}>Tagging + Categories</strong> — Returns descriptive tags and higher-level scene categories. Strong for food, travel, nature photos.</>}
                {provider === 'puter'    && <><strong style={{ color: '#0d1b3e' }}>Puter.js (Unlimited)</strong> — Free AI-powered OCR and image description. Requires Puter.js script in index.html. Uses WebSockets to api.puter.com — may not work in all environments.</>}
              </div>

              {/* ── Results ── */}
              {!cur && status !== 'running' && status !== 'error' && (
                <div className="fis-empty">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.4" style={{ margin: '0 auto', display: 'block' }}>
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <p>{imgSrc ? `Click "Analyse with ${meta.label}" to run.` : 'Upload an image to begin.'}</p>
                </div>
              )}

              {/* Error shown in results panel too */}
              {status === 'error' && !cur && (
                <div className="fis-empty">
                  <p style={{ color: '#dc2626' }}>Analysis failed. See error above.</p>
                </div>
              )}

              {/* Clarifai results */}
              {cur && provider === 'clarifai' && Array.isArray(cur) && (
                <div className="fis-results">
                  <p className="fis-res-eye">Top {cur.length} Recognition Results</p>
                  {cur[0] && (
                    <div className="fis-hero-chip">
                      <div>
                        <div style={{ fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#60a5fa', marginBottom: 3, fontWeight: 600 }}>Top Match</div>
                        <div className="fis-hero-label">{cur[0].label}</div>
                      </div>
                      <div className="fis-hero-score">{(cur[0].score * 100).toFixed(1)}%</div>
                    </div>
                  )}
                  {cur.map((item, i) => (
                    <div className="fis-row" key={i}>
                      <div className="fis-row-top"><span className="fis-row-name">{item.label}</span></div>
                      <Bar score={item.score} color={i === 0 ? '#1e40af' : '#6366f1'} />
                    </div>
                  ))}
                </div>
              )}

              {/* OCR results */}
              {cur && provider === 'ocr' && (
                <div className="fis-results">
                  <p className="fis-res-eye">Extracted Text</p>
                  <div className="fis-ocr">
                    <pre>{cur.text}</pre>
                    <div className="fis-ocr-stat">
                      {cur.wordCount} word{cur.wordCount !== 1 ? 's' : ''} detected · OCR.Space Engine 2
                    </div>
                  </div>
                </div>
              )}

              {/* Imagga results */}
              {cur && provider === 'imagga' && (
                <div className="fis-results">
                  {cur.categories?.length > 0 && (
                    <>
                      <p className="fis-res-eye">Scene Categories</p>
                      <div className="fis-cats">
                        {cur.categories.map((c, i) => (
                          <span className="fis-cat-chip" key={i}>{c.label} · {(c.score * 100).toFixed(0)}%</span>
                        ))}
                      </div>
                    </>
                  )}
                  <p className="fis-res-eye">Tags ({cur.tags?.length})</p>
                  {cur.tags?.map((t, i) => (
                    <div className="fis-row" key={i}>
                      <div className="fis-row-top"><span className="fis-row-name">{t.label}</span></div>
                      <Bar score={t.score} color="#16a34a" />
                    </div>
                  ))}
                </div>
              )}

              {/* Puter results */}
              {cur && provider === 'puter' && (
                <div className="fis-results">
                  {cur.description && (
                    <>
                      <p className="fis-res-eye">AI Description</p>
                      <div className="fis-puter-desc">"{cur.description}"</div>
                    </>
                  )}
                  <p className="fis-res-eye">OCR Text</p>
                  <div className="fis-ocr">
                    <pre>{cur.ocr || '(No text found)'}</pre>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </>
  );
}