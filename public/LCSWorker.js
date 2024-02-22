function computeMED(s1, s2) {
  const m = s1.length;
  const n = s2.length;
  const dp = Array.from(Array(m + 1), () => Array(n + 1).fill(0));

  // 초기화
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  // DP를 통한 MED 계산
  for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
          const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
          dp[i][j] = Math.min(
              dp[i - 1][j] + 1,    // 삭제
              dp[i][j - 1] + 1,    // 삽입
              dp[i - 1][j - 1] + cost // 대체 또는 매치
          );
      }
  }

  // 변경사항 추적 (역추적)
  let operations = {deletions: [], insertions: []};
  let i = m, j = n;

  while (i > 0 || j > 0) {
      if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
          operations.deletions.push({index: i - 1, length: 1});
          i--;
      } else if (j > 0 && dp[i][j] === dp[i][j - 1] + 1) {
          operations.insertions.push({index: i, text: s2[j - 1]});
          j--;
      } else {
          i--;
          j--;
      }
  }

  return operations;
}

self.addEventListener('message', (event) => {
  const {s1, s2} = event.data;
  const result = computeMED(s1, s2);
  postMessage(result);
});