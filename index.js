const express = require("express");
const cors = require("cors");
const { getLottoCombinations } = require("./lotto-service");

const app = express();
app.use(cors());
const PORT = 3000;

app.get("/api/lotto", async (req, res) => {
  try {
    const combos = await getLottoCombinations();
    res.json({ success: true, combos });
  } catch (e) {
    console.error("로또 API 오류:", e);
    res.status(500).json({ success: false, message: "서버 오류" });
  }
});

// 정적 파일 서비스(나중에 프론트엔드 파일을 이 디렉토리에 넣으면 됨)
app.use(express.static("public"));

app.listen(PORT, () => {
  console.log(`서버 실행: http://localhost:${PORT}`);
});
