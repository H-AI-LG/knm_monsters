import { forwardRef } from 'react';
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

  const styleVars = {
    '--grade-color': cfg.color,
    '--grade-glow':  cfg.glow,
    '--era-gradient': eraGradient(eraKey),
    '--panel':      cfg.panel,
    '--panel-text': cfg.panelText,
  };

  return (
    <div
      className={`relic-card relic-card--${grade}`}
      style={styleVars}
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
