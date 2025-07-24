// api/lotto.js
const { getLottoCombinations } = require("../lotto-service");

let cache = null;
let cacheTime = 0;
const CACHE_TTL = 1000 * 60 * 30; // 30분 캐시

module.exports = async (req, res) => {
  res.setHeader("Content-Type", "application/json");

  // 캐시가 살아있으면 재활용
  if (cache && Date.now() - cacheTime < CACHE_TTL) {
    return res.status(200).json(cache);
  }

  try {
    const combos = await getLottoCombinations();
    cache = { success: true, combos };
    cacheTime = Date.now();
    return res.status(200).json(cache);
  } catch (e) {
    console.error("API 오류:", e);
    return res.status(500).json({ success: false, message: "서버 오류" });
  }
};
