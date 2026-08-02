const words = require('an-array-of-english-words');

const signatureMap = {};

// ডিকশনারি ডাটা মেমোরি ইনডেক্সিং (২ থেকে ৭ অক্ষরের শব্দ লক)
words.forEach((word) => {
    const cleanWord = word.toLowerCase().trim();
    if (!cleanWord) return;
    const signature = cleanWord.split('').sort().join('');
    if (!signatureMap[signature]) {
        signatureMap[signature] = [];
    }
    signatureMap[signature].push(cleanWord);
});

// Vercel নোড ক্লাউড রিকোয়েস্ট ইন্টারফেস
module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Content-Type', 'application/json');

    const input = req.query.input || '';
    const cleanInput = input.trim().toLowerCase();
    const inputLen = cleanInput.length;
    const resultsByLength = {};

    if (inputLen < 2 || inputLen > 15) {
        return res.status(200).json({});
    }

    const inputCounts = {};
    for (const char of cleanInput) {
        inputCounts[char] = (inputCounts[char] || 0) + 1;
    }

    for (const signature in signatureMap) {
        // ব্যাকএন্ড লেভেলে ২-৭ অক্ষরের কঠোর ফিল্টারিং লক
        if (signature.length < 2 || signature.length > 7 || signature.length > inputLen) continue;

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

    return res.status(200).json(resultsByLength);
};
