const HANGUL_RE = /[\u1100-\u11FF\u3130-\u318F\uAC00-\uD7AF]/;

function isKorean(text) {
  return HANGUL_RE.test(text);
}

function buildPapagoUrl(text) {
  const st = encodeURIComponent(text);
  return isKorean(text)
    ? `https://papago.naver.com/?sk=ko&tk=en&st=${st}`
    : `https://papago.naver.com/?sk=auto&tk=ko&st=${st}`;
}

if (typeof module !== "undefined") module.exports = { isKorean, buildPapagoUrl };
