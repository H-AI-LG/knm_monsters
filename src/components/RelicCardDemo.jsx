import { useRef } from 'react';
import RelicCard from './RelicCard';
import { downloadCardPng } from './captureCard';

// 4개 등급 데모 데이터 (실제로는 artifacts.js + FinalPraiseScreen 에서 주입)
const SAMPLES = [
  {
    artifactName: '반달돌칼',
    spiritName: '수확의 정령',
    era: '청동기',
    eraKey: 'bronze',
    grade: 'common',
    spriteUrl: '/sprites/seonsa/seonsa_08_semilunar_knife_spirit.png',
    praiseText: '"작은 손이 거둔 곡식이 마을을 살렸구나."',
    playerName: '채민',
  },
  {
    artifactName: '청녕사년명동종',
    spiritName: '범종의 울림 정령',
    era: '고려 12세기',
    eraKey: 'goryeo',
    grade: 'rare',
    spriteUrl: '/sprites/bell_spirit.png',
    praiseText: '"네 종소리가 천 년의 잠을 깨웠노라."',
    playerName: '채민',
  },
  {
    artifactName: '비파형동검',
    spiritName: '왕검룡',
    era: '청동기 · 고조선',
    eraKey: 'silla',
    grade: 'legendary',
    spriteUrl: '/sprites/seonsa/seonsa_12_liaoning_dagger_spirit.png',
    praiseText: '"고조선의 검이 네 안에서 다시 울린다."',
    playerName: '채민',
  },
  {
    artifactName: '광개토대왕릉비',
    spiritName: '잠긴 정복왕',
    era: '고구려',
    eraKey: 'goryeo',
    grade: 'boss',
    spriteUrl: '/sprites/gwanggaeto_boss.png',
    praiseText: '"네가 나를 깨울 자격이 있는지 보겠노라."',
    playerName: '채민',
  },
];

export default function RelicCardDemo() {
  const refs = useRef([]);

  return (
    <div
      style={{
        display: 'flex',
        gap: 24,
        flexWrap: 'wrap',
        justifyContent: 'center',
        padding: 32,
        background: '#080906',
      }}
    >
      {SAMPLES.map((s, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <RelicCard {...s} ref={(el) => (refs.current[i] = el)} />
          <button
            onClick={() =>
              downloadCardPng(refs.current[i], `${s.spiritName}.png`)
            }
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: 'none',
              background: '#2a2a26',
              color: '#e8ecdf',
              cursor: 'pointer',
              fontSize: 12,
            }}
          >
            PNG로 저장
          </button>
        </div>
      ))}
    </div>
  );
}
