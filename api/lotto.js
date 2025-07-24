// api/lotto.js
const { getLottoCombinations } = require("../lotto-service");

module.exports = async (req, res) => {
  res.setHeader("Content-Type", "application/json");

  try {
    const combos = await getLottoCombinations();
    res.status(200).json({ success: true, combos });
  } catch (e) {
    console.error("API 오류:", e);
    res.status(500).json({ success: false, message: "서버 오류" });
  }
};
