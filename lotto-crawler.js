const axios = require("axios");

const RECENT_COUNT = 26;
const BASE_URL =
  "https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=";

//실제 최신 회차 번호를 직접 확인해서 넣기.
const latestDrawNo = 1181;

//로또 당첨번호 클로링(최근 6개월)
async function fetchLottoData() {
  const results = [];

  for (let i = latestDrawNo; i > latestDrawNo - RECENT_COUNT; i--) {
    const url = `${BASE_URL}${i}`;

    try {
      const res = await axios.get(url);
      const data = res.data;

      if (data.returnValue === "success") {
        const nums = [];
        for (let j = 1; j <= 6; j++) {
          nums.push(data[`drwtNo${j}`]);
        }
        results.push({ draw: i, numbers: nums });
      }
    } catch (e) {
      console.error(`${i}회차 요청 실패:`, e.message);
    }
  }
  return results;
}

//배열을 랜덤으로 섞는 유틸
function shuffle(arr) {
  return arr
    .map((v) => ({ v, r: Math.random() }))
    .sort((a, b) => a.r - b.r)
    .map((o) => o.v);
}

//배열에서 랜덤으로 한 개 뽑기
function pickOne(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

fetchLottoData()
  .then((data) => {
    console.log("최근 6개월 로또 당첨번호:", data);

    //출현 빈도 계산
    const freq = {};
    data.forEach((d) =>
      d.numbers.forEach((n) => (freq[n] = (freq[n] || 0) + 1))
    );

    //3~4회 등장한 번호만 추출하는 거
    const pool = Object.entries(freq)
      .filter(([, c]) => c >= 3 && c <= 4)
      .map(([n]) => Number(n));
    console.log("3~4회 등장 번호 풀:", pool);

    // 지난 주 1등 번호
    const lastWeek = data[0].numbers;
    //그 중 랜덤 5개 선택
    const chosenLast = shuffle(lastWeek).slice(0, 5);

    // 공식 적용해서 5개 조합 생성
    const combinations = chosenLast.map((baseNum) => {
      const combo = [baseNum];
      const available = pool.filter((n) => n !== baseNum);

      //연속되거나 근접한 숫자 2~3개 묶기
      const groupSize = Math.floor(Math.random() * 2) + 2;

      const start = pickOne(available);
      const group = [start];

      let candidates = available.filter(
        (n) => n !== start && Math.abs(n - start) <= 3
      );
      while (group.length < groupSize && candidates.length) {
        const next = pickOne(candidates);
        candidates = candidates.filter((n) => n !== next);
      }
      combo.push(...group);

      //나머지 숫자 채우기
      let restPool = available.filter((n) => !group.includes(n));
      while (combo.length < 6 && restPool.length) {
        const pick = pickOne(restPool);
        combo.push(pick);
        restPool = restPool.filter((n) => n !== pick);
      }

      return combo.sort((a, b) => a - b);
    });

    console.log("최종 5개 조합:");
    combinations.forEach((c, i) => console.log(`조합 ${i + 1}:`, c));
  })
  .catch((err) => console.error("크롤링 전체 실패:", err));
