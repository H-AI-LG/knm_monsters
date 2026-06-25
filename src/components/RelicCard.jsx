import { forwardRef, useState } from 'react';
import { GRADE_CONFIG, eraGradient, diamonds } from '../data/relicCardConfig';
import './relicCard.css';

const RelicCard = forwardRef(function RelicCard(
  {
    artifactName,
    spiritName,
    era,
    eraKey = 'bronze',
    grade = 'common',
    spriteUrl,
    praiseText,
    playerName,
    artifactNumber,   // "001" ~ "055"
  },
  ref
) {
  const cfg = GRADE_CONFIG[grade] || GRADE_CONFIG.common;
  const isFoil = grade === 'legendary' || grade === 'boss';
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e) => {
    if (!isFoil) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setTilt({ x: (0.5 - y) * 14, y: (x - 0.5) * 18 });
    setGlare({ x: x * 100, y: y * 100, opacity: 0.38 });
  };
  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setGlare({ x: 50, y: 50, opacity: 0 });
  };

  const ERA_BG_MAP = {
    paleo: 'paleo', bronze: 'bronze', baekje: 'baekje',
    gaya: 'gaya', silla: 'silla', goryeo: 'goryeo',
    joseon: 'joseon', greece: 'greece', tang: 'tang', japan: 'japan',
    goguryeo: 'silla', balhae: 'goryeo',
  };
  const bgKey = ERA_BG_MAP[eraKey] || 'bronze';

  const styleVars = {
    '--grade-color': cfg.color,
    '--grade-glow':  cfg.glow,
    '--era-gradient': eraGradient(eraKey),
    '--era-bg-image': `url('/bg/bg_${bgKey}.png.png')`,
    '--panel':      cfg.panel,
    '--panel-text': cfg.panelText,
  };

  return (
    <div
      className={`relic-card relic-card--${grade}`}
      style={{
        ...styleVars,
        transform: isFoil ? `perspective(600px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` : undefined,
        transition: 'transform 0.12s ease',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      ref={ref}
    >
      {/* 헤더 */}
      <div className="relic-card__header">
        <div>
          <div className="relic-card__era">{era}</div>
          <div className="relic-card__name">{artifactName}</div>
        </div>
        <div className="relic-card__badge">
          {cfg.label} {diamonds(grade)}
        </div>
      </div>

      {/* 아트 프레임 */}
      <div className="relic-card__art">
        <div className="relic-card__shimmer" />
        <div className="relic-card__rays" />
        {isFoil && (
          <div className="relic-card__glare" style={{
            background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,${glare.opacity}) 0%, transparent 55%)`,
          }} />
        )}
        <span className="relic-card__corner relic-card__corner--tl" />
        <span className="relic-card__corner relic-card__corner--tr" />
        <span className="relic-card__corner relic-card__corner--bl" />
        <span className="relic-card__corner relic-card__corner--br" />
        {spriteUrl && (
          <img
            className="relic-card__sprite"
            src={spriteUrl}
            alt={spiritName || artifactName}
            crossOrigin="anonymous"
          />
        )}
      </div>

      {/* 바디 */}
      <div className="relic-card__body">
        <div className="relic-card__spirit">✦ {spiritName} · {era}</div>
        <div className="relic-card__divider" />
        <div className="relic-card__praise">{praiseText}</div>
      </div>

      {/* 푸터 */}
      <div className="relic-card__footer">
        <span>{diamonds(grade)} 수호자 · {playerName}</span>
        <span className="relic-card__serial">
          {artifactNumber ? `#${artifactNumber}` : '정령 카드'}
        </span>
      </div>
      <div className="relic-card__flavor">{cfg.flavor}</div>
    </div>
  );
});

export default RelicCard;
