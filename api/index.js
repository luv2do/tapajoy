const words = require('an-array-of-english-words');

// ক্লাউড মেমোরি ক্যাশিং বক্স (সার্ভার ডাউন এবং টাইমআউট প্রতিরোধের মূল চাবিকাঠি)
let isIndexed = false;
const signatureMap = {};

function initializeDictionary() {
    if (isIndexed) return;
    words.forEach((word) => {
        const cleanWord = word.toLowerCase().trim();
        // ব্যাকএন্ড লেভেলে ২ থেকে ৭ অক্ষরের কঠোর লক
        if (cleanWord.length < 2 || cleanWord.length > 7) return;
        const signature = cleanWord.split('').sort().join('');
        if (!signatureMap[signature]) {
            signatureMap[signature] = [];
        }
        signatureMap[signature].push(cleanWord);
    });
    isIndexed = true;
}

// গ্লোবাল মেমোরি ইনিশিয়েলাইজেশন ট্রিগার
initializeDictionary();

module.exports = async (req, res) => {
    // ক্রসব্রাউজার কানেকশন পলিসি সেটআপ
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // গ্লোবাল মেমোরি কোনো কারণে স্লিপ করলে পুনরায় জাগানোর ব্যাকআপ প্রোটেকশন
    initializeDictionary();

    const input = req.query.input || '';
    const cleanInput = input.trim().toLowerCase();
    const inputLen = cleanInput.length;
    const resultsByLength = {};

    // ২ থেকে ১৫ অক্ষরের কঠোর ব্যাকএন্ড ভ্যালিডেশন
    if (inputLen < 2 || inputLen > 15) {
        return res.status(200).json({});
    }

    const inputCounts = {};
    for (const char of cleanInput) {
        inputCounts[char] = (inputCounts[char] || 0) + 1;
    }

    // হাই-স্পিড সিগনেচার অ্যালগরিদম যা ১ মিলিসেকেন্ডে রেজাল্ট মেলায়
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

    return res.status(200).json(resultsByLength);
};
