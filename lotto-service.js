// lotto-service.js
const axios = require("axios");

const RECENT_COUNT = 26;
const BASE_URL =
  "https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=";
const latestDrawNo = 1181;

// 1) 배열을 랜덤 섞는 유틸
function shuffle(arr) {
  return arr
    .map((v) => ({ v, r: Math.random() }))
    .sort((a, b) => a.r - b.r)
    .map((o) => o.v);
}

// 2) 배열에서 랜덤 한 개 뽑기
function pickOne(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 3) 당첨번호 6개월분만 캐시
let drawCache = null;
let drawCacheTime = 0;
const DRAW_TTL = 1000 * 60 * 30; // 30분

async function fetchLottoData() {
  if (drawCache && Date.now() - drawCacheTime < DRAW_TTL) {
    return drawCache;
  }

  const promises = Array.from({ length: RECENT_COUNT }, (_, idx) => {
    const no = latestDrawNo - idx;
    return axios
      .get(`${BASE_URL}${no}`)
      .then((r) =>
        r.data.returnValue === "success"
          ? [1, 2, 3, 4, 5, 6].map((i) => r.data[`drwtNo${i}`])
          : []
      )
      .catch(() => []);
  });

  const draws = await Promise.all(promises);
  drawCache = draws;
  drawCacheTime = Date.now();
  return draws;
}

// 4) 매번 새로 조합 생성
async function getLottoCombinations() {
  const draws = await fetchLottoData();

  // 등장 빈도 계산
  const freq = {};
  draws.flat().forEach((n) => {
    if (n) freq[n] = (freq[n] || 0) + 1;
  });

  // 3~4회 등장 번호 풀
  const pool = Object.entries(freq)
    .filter(([, c]) => c >= 3 && c <= 4)
    .map(([n]) => Number(n));

  const lastWeek = draws[0] || [];
  const chosenLast = shuffle(lastWeek).slice(0, 5);

  // 5개 조합 생성
  return chosenLast.map((baseNum) => {
    const combo = [baseNum];
    const avail = pool.filter((n) => n !== baseNum);

    // 연속·근접 묶음 2~3개
    const size = Math.floor(Math.random() * 2) + 2;
    const start = pickOne(avail);
    const group = [start];
    let cand = avail.filter((n) => n !== start && Math.abs(n - start) <= 3);
    while (group.length < size && cand.length) {
      const next = pickOne(cand);
      group.push(next);
      cand = cand.filter((n) => n !== next);
    }
    combo.push(...group);

    // 나머지 숫자 채우기
    let rest = avail.filter((n) => !group.includes(n));
    while (combo.length < 6 && rest.length) {
      const p = pickOne(rest);
      combo.push(p);
      rest = rest.filter((n) => n !== p);
    }

    return combo.sort((a, b) => a - b);
  });
}

module.exports = { getLottoCombinations };
