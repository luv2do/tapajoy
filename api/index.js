const words = require('an-array-of-english-words');

const signatureMap = {};
let isReady = false;

// ক্লাউড ফাংশন বুট হওয়ার সময় ব্যাকগ্রাউন্ডে ৩ লাখ শব্দ প্রসেস করার মেথড
function prepareDictionary() {
    if (isReady) return;
    for (let i = 0; i < words.length; i++) {
        const cleanWord = words[i].toLowerCase().trim();
        if (cleanWord.length >= 2 && cleanWord.length <= 7) {
            const signature = cleanWord.split('').sort().join('');
            if (!signatureMap[signature]) {
                signatureMap[signature] = [];
            }
            signatureMap[signature].push(cleanWord);
        }
    }
    isReady = true;
}

prepareDictionary();

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    prepareDictionary();

    const input = req.query.input || '';
    const cleanInput = input.trim().toLowerCase();
    const inputLen = cleanInput.length;
    const resultsByLength = {};

    // ২ থেকে ১৫ অক্ষরের কঠোর ব্যাকএন্ড লক
    if (inputLen < 2 || inputLen > 15) {
        return res.status(200).json({});
    }

    const inputCounts = {};
    for (let i = 0; i < cleanInput.length; i++) {
        const char = cleanInput[i];
        inputCounts[char] = (inputCounts[char] || 0) + 1;
    }

    // টাইমআউট প্রতিরোধী আল্ট্রা-ফাস্ট অ্যানাগ্রাম লুপ
    for (const signature in signatureMap) {
        if (signature.length > inputLen) continue;

        let isMatch = true;
        const sigCounts = {};
        for (let i = 0; i < signature.length; i++) {
            const char = signature[i];
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
