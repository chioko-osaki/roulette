/* =========================================================
   roulette.js
   ルーレットの「見た目」と「回転アニメーション」だけを担当します。

   重要：このファイルは、当選景品を「決める」処理は一切行いません。
   当選景品はすでに app.js 側で決まっており、
   このファイルはその結果を演出として表示するだけです。
   そのため、後からこのファイルの中身（回転時間・見た目など）を
   自由に変更しても、抽選確率や在庫管理には影響しません。
   ========================================================= */

const Roulette = (function () {
  const svgEl = document.getElementById('wheel-svg');
  const rotorEl = document.getElementById('wheel-rotor');

  // ホイールの色（景品数が多い場合は繰り返し使われます）
  const PALETTE = ['#E8590C', '#2F6F4E', '#E3B23C', '#3A6EA5', '#8E5572', '#4A7C59'];

  // ここを変えると「何周してから止まるか」を調整できます（多いほど盛り上がるが長くなる）
  const EXTRA_SPINS = 5;

  let currentAngle = 0;       // ホイールの現在の累積回転角度
  let currentCandidates = []; // 直近に描画した「抽選対象の景品」の並び順（表示用）

  function polarToCartesian(cx, cy, r, angleDeg) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function describeSlicePath(cx, cy, r, startAngle, endAngle) {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
  }

  // 現在の抽選対象（在庫があり、一時停止されていない景品）でホイールを描き直す
  function render(candidates) {
    currentCandidates = candidates;
    svgEl.innerHTML = '';

    const sliceCount = candidates.length;
    if (sliceCount === 0) return;

    const cx = 200;
    const cy = 200;
    const r = 190;
    const sliceAngle = 360 / sliceCount;

    candidates.forEach((prize, index) => {
      const startAngle = index * sliceAngle;
      const endAngle = startAngle + sliceAngle;

      const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      pathEl.setAttribute('d', describeSlicePath(cx, cy, r, startAngle, endAngle));
      pathEl.setAttribute('fill', PALETTE[index % PALETTE.length]);
      pathEl.setAttribute('stroke', '#FFFFFF');
      pathEl.setAttribute('stroke-width', '2');
      svgEl.appendChild(pathEl);

      const midAngle = startAngle + sliceAngle / 2;
      const labelPos = polarToCartesian(cx, cy, r * 0.62, midAngle);

      const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      textEl.setAttribute('x', labelPos.x);
      textEl.setAttribute('y', labelPos.y);
      textEl.setAttribute('text-anchor', 'middle');
      textEl.setAttribute('dominant-baseline', 'middle');
      textEl.setAttribute('transform', `rotate(${midAngle + 90} ${labelPos.x} ${labelPos.y})`);
      textEl.setAttribute('class', 'wheel-label');
      textEl.textContent = prize.name;
      svgEl.appendChild(textEl);
    });
  }

  // winnerId（すでに決まっている当選景品）の位置まで回転させる。
  // 回転が終わったら onFinish() を呼び出す。
  function spinTo(winnerId, onFinish) {
    const sliceCount = currentCandidates.length;
    if (sliceCount === 0) {
      onFinish();
      return;
    }
    const winnerIndex = currentCandidates.findIndex((p) => p.id === winnerId);
    const sliceAngle = 360 / sliceCount;
    const sliceCenterAngle = winnerIndex * sliceAngle + sliceAngle / 2;

    // ポインターは常に12時位置（0度）に固定されているため、
    // 「当選スライスの中心」がその位置に来るように、ホイール全体を回す角度を逆算する。
    const targetMod = (360 - sliceCenterAngle) % 360;

    // スライスのちょうど中心ではなく、少しランダムにブレさせて自然な止まり方にする
    const jitterRange = sliceAngle * 0.5;
    const jitter = (Math.random() - 0.5) * jitterRange;

    const baseFullTurns = Math.ceil(currentAngle / 360) * 360;
    let targetAngle = baseFullTurns + EXTRA_SPINS * 360 + targetMod + jitter;
    if (targetAngle <= currentAngle) {
      targetAngle += 360;
    }

    playSound('roulette');

    // 回転時間・イージングを変えたい場合は css/roulette.css の
    // #wheel-rotor の transition と、下の行を合わせて変更してください。
    rotorEl.style.transition = 'transform 4s cubic-bezier(0.12, 0.7, 0.15, 1)';
    rotorEl.style.transform = `rotate(${targetAngle}deg)`;
    currentAngle = targetAngle;

    const handleTransitionEnd = () => {
      rotorEl.removeEventListener('transitionend', handleTransitionEnd);
      playSound('win');
      onFinish();
    };
    rotorEl.addEventListener('transitionend', handleTransitionEnd);
  }

  return { render, spinTo };
})();
