// Test watermark unblending formula
const ALPHA_THRESHOLD = 0.002;
const MAX_ALPHA = 0.99;
const LOGO_VALUE = 255;

function testReverseAlpha() {
  const originalR = 120;
  const alpha = 0.6; // 60% watermark alpha
  const watermarkedR = Math.round(originalR * (1 - alpha) + LOGO_VALUE * alpha);
  
  // Reverse formula:
  const restored = (watermarkedR - (alpha * LOGO_VALUE)) / (1.0 - alpha);
  console.log(`Original: ${originalR}, Watermarked: ${watermarkedR}, Restored: ${Math.round(restored)}`);
  
  if (Math.round(restored) === originalR) {
    console.log("Formula test PASSED: 100% exact lossless recovery!");
  } else {
    console.error("Formula test FAILED!");
  }
}

testReverseAlpha();
