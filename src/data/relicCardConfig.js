// 유물수호자 — 정령 카드 토큰 설정

export const GRADE_CONFIG = {
  common: {
    label: '일반',
    color: '#7ab87a',
    diamonds: 2,
    flavor: '유물 정령이 감동받으면 마음의 봉인이 열린다.',
    glow: '0 0 0 1px rgba(122,184,122,0.35)',
    panel: '#161b12',
    panelText: '#5e7a52',
  },
  rare: {
    label: '고급',
    color: '#5b9bd5',
    diamonds: 3,
    flavor: '고급 정령의 가호가 수호자의 발걸음을 이끈다.',
    glow: '0 0 6px rgba(91,155,213,0.35)',
    panel: '#141a20',
    panelText: '#4a7a9c',
  },
  legendary: {
    label: '전설',
    color: '#c9a24b',
    diamonds: 4,
    flavor: '전설 정령이 각성하면 역사 그 자체가 숨을 쉰다.',
    glow: '0 0 16px rgba(201,162,75,0.45)',
    panel: '#1d160d',
    panelText: '#9c7a3a',
  },
  boss: {
    label: '보스',
    color: '#c04040',
    diamonds: 5,
    flavor: '수호신에게 인정받은 자만이 이 힘을 담을 수 있다.',
    glow: '0 0 22px rgba(192,64,64,0.5)',
    panel: '#1d0f0f',
    panelText: '#9c4a4a',
  },
};

export const ERA_GRADIENT = {
  paleo:    ['#5a3a1d', '#7a4f22', '#2e1c0a'], // 구석기
  bronze:   ['#2e5a2e', '#3b6d11', '#1a2e0a'], // 신석기·청동기
  baekje:   ['#6e5a1d', '#a8862b', '#2e2410'], // 백제·삼국
  gaya:     ['#473a6e', '#5a4aa8', '#241c3a'], // 가야·통일신라
  silla:    ['#6e561d', '#c9a24b', '#2e2410'], // 신라
  goryeo:   ['#1d6e56', '#0f6e56', '#04342c'], // 고려
  joseon:   ['#6e4a1d', '#a8702b', '#2e1c0a'], // 조선·대한제국
  greece:   ['#1d4a6e', '#2b6ea8', '#0a1c2e'], // 그리스·간다라
  tang:     ['#6e1d1d', '#a82b2b', '#2e0a0a'], // 당나라·중국
  japan:    ['#6e1d4a', '#a82b70', '#2e0a1c'], // 일본
  goguryeo: ['#3a1a5e', '#5a2a8e', '#180a2e'], // 고구려
  balhae:   ['#1a3a5e', '#2a5a8e', '#0a1a2e'], // 발해
};

export function eraGradient(eraKey) {
  const stops = ERA_GRADIENT[eraKey] || ERA_GRADIENT.bronze;
  return `linear-gradient(160deg, ${stops[0]}, ${stops[1]}, ${stops[2]})`;
}

export function diamonds(grade) {
  const n = (GRADE_CONFIG[grade] || GRADE_CONFIG.common).diamonds;
  return '◆'.repeat(n);
}
