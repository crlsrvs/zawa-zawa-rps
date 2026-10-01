import React from 'react';
import { CardType, type Participant } from '../../types/game';
import styles from './LobbyGrid.module.css';

export interface LobbyGridProps {
  readonly bots: Participant[];
  readonly isLobbyPhase: boolean;
  readonly activeOpponentId: string | null;
  readonly onChallengeBot: (botId: string) => void;
}

export const LobbyGrid: React.FC<LobbyGridProps> = ({
  bots,
  isLobbyPhase,
  activeOpponentId,
  onChallengeBot,
}) => {
  return (
    <section className={styles['lobby-grid']} aria-label="Espoir Bot Roster">
      <header className={styles['lobby-grid__header']}>
        <div>
          <h2 className={styles['lobby-grid__title']}>Floor Duelists (対戦相手)</h2>
          <span className={styles['lobby-grid__hint']}>
            Select an active debtor on the casino floor to initiate a card battle
          </span>
        </div>
      </header>

      <div className={styles['lobby-grid__roster']}>
        {bots.map((bot) => {
          const totalCards =
            bot.cards[CardType.ROCK] +
            bot.cards[CardType.PAPER] +
            bot.cards[CardType.SCISSORS];

          const isTargeted = activeOpponentId === bot.id;
          const isEligible = isLobbyPhase && bot.status === 'ACTIVE' && totalCards > 0;

          const cardModifier =
            bot.status === 'QUALIFIED'
              ? styles['lobby-grid__bot-card--qualified']
              : bot.status === 'ELIMINATED'
                ? styles['lobby-grid__bot-card--eliminated']
                : styles['lobby-grid__bot-card--active'];

          const badgeModifier =
            bot.status === 'QUALIFIED'
              ? styles['lobby-grid__status-badge--qualified']
              : bot.status === 'ELIMINATED'
                ? styles['lobby-grid__status-badge--eliminated']
                : styles['lobby-grid__status-badge--active'];

          return (
            <article
              key={bot.id}
              className={`${styles['lobby-grid__bot-card']} ${cardModifier} ${
                isTargeted ? styles['lobby-grid__bot-card--targeted'] : ''
              }`}
              data-testid={`bot-card-${bot.id}`}
            >
              <div>
                <div className={styles['lobby-grid__bot-top']}>
                  <h3 className={styles['lobby-grid__bot-name']}>{bot.name}</h3>
                  <span className={`${styles['lobby-grid__status-badge']} ${badgeModifier}`}>
                    {bot.status}
                  </span>
                </div>

                <div className={styles['lobby-grid__strategy-tag']}>
                  Strategy: {bot.botStrategy ?? 'UNKNOWN'}
                </div>

                <div className={styles['lobby-grid__bot-info']}>
                  <div className={styles['lobby-grid__stat-group']}>
                    <span className={styles['lobby-grid__stat-label']}>Stars (星)</span>
                    <span className={styles['lobby-grid__stat-stars']}>
                      ⭐ {bot.stars}
                    </span>
                  </div>

                  <div className={styles['lobby-grid__stat-group']}>
                    <span className={styles['lobby-grid__stat-label']}>Hand Size</span>
                    <span className={styles['lobby-grid__stat-cards']}>
                      {totalCards} Cards
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className={styles['lobby-grid__challenge-btn']}
                disabled={!isEligible}
                onClick={() => onChallengeBot(bot.id)}
                aria-label={`Challenge ${bot.name} to duel`}
                data-testid={`challenge-btn-${bot.id}`}
              >
                <span>⚔ Challenge</span>
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
};
