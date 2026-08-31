const assert = require("assert");
const { isKorean, buildPapagoUrl } = require("../papago.js");

// isKorean
assert.strictEqual(isKorean("hello"), false);
assert.strictEqual(isKorean("안녕하세요"), true);
assert.strictEqual(isKorean("hello 안녕"), true); // mixed counts as Korean
assert.strictEqual(isKorean("ㄱㄴㄸ ㅏㅣ"), true); // jamo counts
assert.strictEqual(isKorean("日本語"), false);
assert.strictEqual(isKorean(""), false);

// buildPapagoUrl
assert.strictEqual(
  buildPapagoUrl("hello world"),
  "https://papago.naver.com/?sk=auto&tk=ko&st=hello%20world"
);
assert.strictEqual(
  buildPapagoUrl("안녕"),
  "https://papago.naver.com/?sk=ko&tk=en&st=%EC%95%88%EB%85%95"
);

console.log("All papago tests passed");
