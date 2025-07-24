// lotto-service.js
const axios = require("axios");

const RECENT_COUNT = 26;
const BASE_URL =
  "https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=";
const latestDrawNo = 1181;

// 배열을 랜덤 섞는 유틸
function shuffle(arr) {
  return arr
    .map((v) => ({ v, r: Math.random() }))
    .sort((a, b) => a.r - b.r)
    .map((o) => o.v);
}

// 배열에서 랜덤 한 개 뽑기
function pickOne(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 1) 최근 6개월 당첨번호 병렬로 가져오기
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
      .catch(() => []);
  });
  // 병렬 실행
  return Promise.all(promises);
}

// 2) 공식 기반 5개 조합 생성
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
  const lastWeek = draws[0] || [];
  const chosenLast = shuffle(lastWeek).slice(0, 5);

  // 5개 조합 만들기
  return chosenLast.map((baseNum) => {
    const combo = [baseNum];
    const available = pool.filter((n) => n !== baseNum);

    // 2~3개 연속·근접 묶음
    const groupSize = Math.floor(Math.random() * 2) + 2;
    const start = pickOne(available);
    const group = [start];
    let cand = available.filter((n) => n !== start && Math.abs(n - start) <= 3);
    while (group.length < groupSize && cand.length) {
      const next = pickOne(cand);
      group.push(next);
      cand = cand.filter((n) => n !== next);
    }
    combo.push(...group);

    // 남은 숫자 채우기
    let rest = available.filter((n) => !group.includes(n));
    while (combo.length < 6 && rest.length) {
      const p = pickOne(rest);
      combo.push(p);
      rest = rest.filter((n) => n !== p);
    }

    return combo.sort((a, b) => a - b);
  });
}

module.exports = { getLottoCombinations };
