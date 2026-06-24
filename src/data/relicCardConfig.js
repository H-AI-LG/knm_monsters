// 유물수호자 — 정령 카드 토큰 설정

export const GRADE_CONFIG = {
  common: {
    label: '일반',
    color: '#4caf78',
    diamonds: 2,
    flavor: '유물 정령이 감동받으면 마음의 봉인이 열린다.',
    glow: '0 0 8px rgba(76,175,120,0.45)',
    panel: '#0d1810',
    panelText: '#3a7a52',
  },
  rare: {
    label: '고급',
    color: '#56b4e9',
    diamonds: 3,
    flavor: '고급 정령의 가호가 수호자의 발걸음을 이끈다.',
    glow: '0 0 14px rgba(86,180,233,0.6), 0 0 32px rgba(86,180,233,0.2)',
    panel: '#0c1620',
    panelText: '#3a6a9c',
  },
  legendary: {
    label: '전설',
    color: '#F2C94C',
    diamonds: 4,
    flavor: '전설 정령이 각성하면 역사 그 자체가 숨을 쉰다.',
    glow: '0 0 0 2px rgba(242,201,76,0.55), 0 0 22px rgba(242,201,76,0.7), 0 0 50px rgba(242,201,76,0.3), 0 0 80px rgba(255,183,0,0.12)',
    panel: '#1e1608',
    panelText: '#a07d20',
  },
  boss: {
    label: '보스',
    color: '#e05252',
    diamonds: 5,
    flavor: '수호신에게 인정받은 자만이 이 힘을 담을 수 있다.',
    glow: '0 0 0 2px rgba(100,0,0,0.8), 0 0 22px rgba(224,82,82,0.7), 0 0 50px rgba(139,0,0,0.4)',
    panel: '#1e0808',
    panelText: '#9c2020',
  },
};

export const ERA_GRADIENT = {
  paleo:    ['#5a3a1d', '#7a4f22', '#2e1c0a'],
  bronze:   ['#2e5a2e', '#3b6d11', '#1a2e0a'],
  baekje:   ['#6e5a1d', '#a8862b', '#2e2410'],
  gaya:     ['#473a6e', '#5a4aa8', '#241c3a'],
  silla:    ['#6e561d', '#c9a24b', '#2e2410'],
  goryeo:   ['#1d6e56', '#0f6e56', '#04342c'],
  joseon:   ['#6e4a1d', '#a8702b', '#2e1c0a'],
  greece:   ['#1d4a6e', '#2b6ea8', '#0a1c2e'],
  tang:     ['#6e1d1d', '#a82b2b', '#2e0a0a'],
  japan:    ['#6e1d4a', '#a82b70', '#2e0a1c'],
  goguryeo: ['#3a1a5e', '#5a2a8e', '#180a2e'],
  balhae:   ['#1a3a5e', '#2a5a8e', '#0a1a2e'],
};

export function eraGradient(eraKey) {
  const stops = ERA_GRADIENT[eraKey] || ERA_GRADIENT.bronze;
  return `linear-gradient(160deg, ${stops[0]}, ${stops[1]}, ${stops[2]})`;
}

export function diamonds(grade) {
  const n = (GRADE_CONFIG[grade] || GRADE_CONFIG.common).diamonds;
  return '◆'.repeat(n);
}
