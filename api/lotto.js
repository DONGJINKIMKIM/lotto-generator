// api/lotto.js
const { getLottoCombinations } = require("../lotto-service");

module.exports = async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  try {
    // 매 요청마다 새 조합 생성
    const combos = await getLottoCombinations();
    return res.status(200).json({ success: true, combos });
  } catch (e) {
    console.error("API 오류:", e);
    return res.status(500).json({ success: false, message: e.message });
  }
};
