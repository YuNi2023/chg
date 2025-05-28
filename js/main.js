// データ読み込み
async function loadData() {
  const res = await fetch('data/videos.json');
  return res.json();
}

// 全角→半角、カンマ変換
function normalizeInput(str) {
  return str.replace(/[０-９]/g, c => String.fromCharCode(c.charCodeAt(0)-65248))
            .replace(/[、，]/g, ',')
            .replace(/～/g, '~')
            .trim();
}

// 範囲展開
function expandTerms(terms, maxNum) {
  const nums = new Set();
  terms.forEach(t0 => {
    const t = t0.toUpperCase();
    if (t === 'ALL') for (let i=1; i<=maxNum; i++) nums.add(i);
    else if (t.includes('~')) {
      const [a,b] = t.split('~').map(n=>parseInt(n,10));
      if (!isNaN(a)&&!isNaN(b)) for (let i=Math.min(a,b); i<=Math.max(a,b); i++) nums.add(i);
    } else {
      const n = parseInt(t,10);
      if (!isNaN(n)) nums.add(n);
    }
  });
  return nums;
}

// 割引率
function getDiscount(count) {
  if (count >= 20) return 0.25;
  if (count >= 15) return 0.20;
  if (count >= 10) return 0.15;
  if (count >= 5) return 0.10;
  if (count >= 2) return 0.05;
  return 0;
}

// テーブル表示・更新
async function init() {
  const data = await loadData();
  const tbody = document.querySelector('#priceTable tbody');
  data.forEach(item => {
    const tr = document.createElement('tr');
    tr.dataset.num = item.num;
    tr.innerHTML = `<td>${item.num}</td><td>${item.cnt}本</td><td>${item.price}</td>`;
    tbody.appendChild(tr);
  });
  const searchBox = document.getElementById('searchBox');
  searchBox.addEventListener('input', () => {
    const input = normalizeInput(searchBox.value);
    const terms = input ? input.split(',') : [];
    const nums = expandTerms(terms, data.length);
    let total=0, sum=0;
    data.forEach(item => {
      const row = document.querySelector(`tr[data-num="${item.num}"]`);
      const visible = nums.size===0 || nums.has(item.num);
      row.style.display = visible ? '' : 'none';
      if (visible) { total++; sum += item.price; }
    });
    const disc = getDiscount(total);
    const discSum = Math.round(sum*(1-disc));
    const summary = document.getElementById('summary');
    if (total===0 || nums.size===0) summary.textContent = `選択件数: 全件（${data.length}件） 合計: ---円 (PayPay), ---円 (他)`;
    else summary.textContent = `選択件数: ${total} 合計: ${discSum}円 (PayPay), ${discSum+600}円 (他)`;
  });
}

document.addEventListener('DOMContentLoaded', init);
