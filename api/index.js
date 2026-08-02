const words = require('an-array-of-english-words');

// ১. মেমোরিতে শব্দ সাজিয়ে রাখার ইনডেক্স বক্স
const signatureMap = {};

// ২. ডিকশনারি প্রসেস করার নিয়ম
words.forEach((word) => {
    const cleanWord = word.toLowerCase().trim();
    if (!cleanWord) return;
    const signature = cleanWord.split('').sort().join('');
    if (!signatureMap[signature]) {
        signatureMap[signature] = [];
    }
    signatureMap[signature].push(cleanWord);
});

// ৩. আসল সলভার ফাংশন
function solveJumble(input) {
    const cleanInput = input.trim().toLowerCase();
    const inputLen = cleanInput.length;
    const resultsByLength = {};

    const inputCounts = {};
    for (const char of cleanInput) {
        inputCounts[char] = (inputCounts[char] || 0) + 1;
    }

    for (const signature in signatureMap) {
        if (signature.length > inputLen) continue;

        let isMatch = true;
        const sigCounts = {};
        for (const char of signature) {
            sigCounts[char] = (sigCounts[char] || 0) + 1;
            if (!inputCounts[char] || sigCounts[char] > inputCounts[char]) {
                isMatch = false;
                break;
            }
        }

        if (isMatch) {
            const wordLen = signature.length;
            if (!resultsByLength[wordLen]) {
                resultsByLength[wordLen] = [];
            }
            resultsByLength[wordLen].push(...signatureMap[signature]);
        }
    }

    return resultsByLength;
}

// Vercel-এর জন্য এক্সপোর্ট আর্কিটেকচার
module.exports = { solveJumble };
