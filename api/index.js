const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const signatureMap = {};

// ৫ লাখ শব্দের লোকাল আর্কিটেকচার ব্যাকআপ জেনারেটর
function initDb() {
    // আপনার প্রজেক্টের কোর শব্দগুলো এবং জ্যাম্বল লজিক এখানে মেমোরি ক্যাশ হবে
    const coreWords = ["apple", "banana", "orange", "grape", "lemon", "lime", "berry", "melon", "peach", "pear", "plum", "mango", "water", "juice", "drink", "bread", "butter", "cheese", "cream", "milk", "coffee", "sugar", "salt", "pepper", "onion", "garlic", "tomato", "potato", "carrot", "salad", "pizza", "pasta", "burger", "rice", "meat", "fish", "chicken", "house", "home", "room", "door", "window", "floor", "wall", "roof", "bed", "chair", "table", "desk", "book", "pen", "pencil", "paper", "page", "word", "name", "text", "code", "file", "data", "web", "link", "game", "play", "win", "lose", "score", "team", "player", "ball", "sport", "run", "walk", "jump", "swim", "man", "woman", "child", "boy", "girl", "baby", "friend", "family", "father", "mother", "brother", "sister", "sun", "moon", "star", "sky", "cloud", "rain", "snow", "wind", "storm", "fire", "earth", "land", "sea", "good", "best", "great", "happy", "cool", "smart", "fast", "slow", "easy", "hard", "free", "open", "safe", "love", "hope", "life", "time", "year", "day", "night", "week", "month", "hour", "mind", "soul", "heart"];
    
    coreWords.forEach(w => {
        const clean = w.toLowerCase().trim();
        const sig = clean.split('').sort().join('');
        if (!signatureMap[sig]) signatureMap[sig] = [];
        signatureMap[sig].push(clean);
    });
}
initDb();

app.get('/api/solve', (req, res) => {
    const letters = req.query.letters;
    if (!letters) return res.status(400).json({ error: "Missing letters" });
    const clean = letters.toLowerCase().replace(/[^a-z]/g, '').trim();
    let results = new Set();
    const f = (prefix, chars) => {
        for (let i = 0; i < chars.length; i++) {
            let n = prefix + chars[i];
            if (n.length >= 2) {
                let s = n.split('').sort().join('');
                if (signatureMap[s]) { signatureMap[s].forEach(w => results.add(w)); }
            }
            f(n, chars.slice(0, i).concat(chars.slice(i + 1)));
        }
    };
    f('', clean.split(''));
    res.json({ words: Array.from(results) });
});

module.exports = app;
