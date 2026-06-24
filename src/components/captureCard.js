// 유물수호자 — 정령 카드 PNG 캡처 유틸
// html2canvas 를 사용해 카드 DOM 을 PNG 로 추출한다.
// 의존성: npm i html2canvas

import html2canvas from 'html2canvas';

/**
 * 카드 ref 를 PNG dataURL 로 캡처한다.
 * 폰트·이미지 로드 완료를 기다린 뒤 캡처하며,
 * 정령 PNG 가 프레임 위로 overflow 된 부분까지 포함한다.
 *
 * @param {HTMLElement} node  카드 최상위 DOM (RelicCard 의 ref.current)
 * @param {object} [opts]
 * @param {number} [opts.scale=3]  해상도 배율 (도트 선명도 위해 3 권장)
 * @returns {Promise<string>} PNG dataURL
 */
export async function captureCardDataUrl(node, opts = {}) {
  const { scale = 3 } = opts;
  if (!node) throw new Error('captureCard: node 가 없습니다.');

  // 1) 웹폰트 로드 완료 대기 (Galmuri 등)
  if (document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready;
    } catch (_) {
      /* 폰트 로드 실패해도 폴백 폰트로 진행 */
    }
  }

  // 2) 카드 내 이미지(정령 PNG) 로드 완료 대기
  const imgs = Array.from(node.querySelectorAll('img'));
  await Promise.all(
    imgs.map(
      (img) =>
        img.complete
          ? Promise.resolve()
          : new Promise((res) => {
              img.onload = img.onerror = res;
            })
    )
  );

  // 3) 캡처. overflow 된 정령까지 담기 위해 여유 패딩을 둔다.
  const pad = Math.round(node.offsetHeight * 0.12); // 위로 넘친 만큼 보정
  const canvas = await html2canvas(node, {
    scale,
    backgroundColor: null, // 투명 배경
    useCORS: true,
    allowTaint: false,
    logging: false,
    // 카드 위쪽으로 넘친 정령을 포함하도록 캡처 영역을 위로 확장
    y: -pad,
    height: node.offsetHeight + pad,
    windowHeight: node.offsetHeight + pad,
  });

  return canvas.toDataURL('image/png');
}

/**
 * 캡처한 PNG 를 즉시 다운로드한다.
 * @param {HTMLElement} node      카드 DOM
 * @param {string} [filename]     저장 파일명
 * @param {object} [opts]         captureCardDataUrl 옵션
 */
export async function downloadCardPng(node, filename = 'relic-card.png', opts) {
  const dataUrl = await captureCardDataUrl(node, opts);
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/**
 * 캡처한 PNG 를 Blob 으로 반환한다 (공유 API 등에 사용).
 * @param {HTMLElement} node
 * @param {object} [opts]
 * @returns {Promise<Blob>}
 */
export async function captureCardBlob(node, opts) {
  const dataUrl = await captureCardDataUrl(node, opts);
  const res = await fetch(dataUrl);
  return res.blob();
}
