// lotto-service.js
const axios = require("axios");

const RECENT_COUNT = 26;
const BASE_URL =
  "https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=";
const latestDrawNo = 1181;

// 1) 최근 6개월 당첨번호 병렬 크롤링
async function fetchLottoData() {
  const promises = Array.from({ length: RECENT_COUNT }, (_, idx) => {
    const drawNo = latestDrawNo - idx;
    return axios
      .get(`${BASE_URL}${drawNo}`)
      .then((res) => {
        const d = res.data;
        if (d.returnValue === "success") {
          // drwtNo1~6
          return [1, 2, 3, 4, 5, 6].map((i) => d[`drwtNo${i}`]);
        }
        return [];
      })
      .catch(() => []); // 실패해도 빈 배열로 처리
  });

  // 병렬 실행 → 가장 느린 요청 시간 만큼만 소요
  return Promise.all(promises);
}

// 2) 공식 기반 5개 조합 생성 (기존 코드 재사용)
async function getLottoCombinations() {
  const draws = await fetchLottoData();

  // 등장 빈도 계산 → 3~4회 풀
  const freq = {};
  draws.flat().forEach((n) => {
    if (n) freq[n] = (freq[n] || 0) + 1;
  });

  const pool = Object.entries(freq)
    .filter(([, c]) => c >= 3 && c <= 4)
    .map(([n]) => Number(n));

  // 지난주 1등 번호
  const lastWeek = draws[0];
  const chosenLast = shuffle(lastWeek).slice(0, 5);

  // 조합 로직 그대로…
  return chosenLast.map((baseNum) => {
    /* … */
  });
}

module.exports = { getLottoCombinations };
