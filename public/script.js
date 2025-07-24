const btn = document.getElementById("generateBtn");
const resultDiv = document.getElementById("result");

btn.addEventListener("click", async () => {
  btn.disabled = true;
  btn.textContent = "공식 분석 중...(기다려 주세요)";

  try {
    const res = await fetch("/api/lotto");
    const json = await res.json();

    resultDiv.innerHTML = "";
    if (json.success) {
      json.combos.forEach((combo, i) => {
        const line = document.createElement("div");
        line.className = "combo-line";

        const label = document.createElement("span");
        label.className = "combo-label";
        label.textContent = `조합 ${i + 1}:`;
        line.appendChild(label);

        combo.forEach((n) => {
          const ball = document.createElement("span");
          ball.className = "lotto-num";
          ball.textContent = n;
          line.appendChild(ball);
        });

        resultDiv.appendChild(line);
      });
    } else {
      resultDiv.textContent = "서버 오류가 발생했습니다.";
    }
  } catch (err) {
    resultDiv.textContent = "네트워크 오류를 확인해 주세요.";
  } finally {
    btn.disabled = false;
    btn.textContent = "이번엔 꼭 당첨되실 거예요";
  }
});
