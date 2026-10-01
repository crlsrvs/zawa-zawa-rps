import React from 'react';
import {
  CardType,
  type Participant,
  type DuelState,
  type GamePhase,
} from '../../types/game';
import styles from './DuelModal.module.css';

export interface DuelModalProps {
  readonly phase: GamePhase;
  readonly humanPlayer: Participant;
  readonly opponent: Participant;
  readonly activeDuel: DuelState;
  readonly onSelectCard: (card: CardType) => void;
  readonly onConfirmSelection: () => void;
  readonly onRevealDuel: () => void;
  readonly onResolveRound: () => void;
  readonly onCancelDuel: () => void;
}

function getCardIcon(card: CardType): string {
  switch (card) {
    case CardType.ROCK:
      return '✊';
    case CardType.PAPER:
      return '✋';
    case CardType.SCISSORS:
      return '✌';
  }
}

export const DuelModal: React.FC<DuelModalProps> = ({
  phase,
  humanPlayer,
  opponent,
  activeDuel,
  onSelectCard,
  onConfirmSelection,
  onRevealDuel,
  onResolveRound,
  onCancelDuel,
}) => {
  const isSelection = phase === 'DUEL_SELECTION';
  const isReveal = phase === 'DUEL_REVEAL';
  const isResolve = phase === 'ROUND_RESOLVE';

  const playerCard = activeDuel.playerCard;
  const opponentCard = activeDuel.opponentCard;
  const outcome = activeDuel.outcome;

  const outcomeBannerClass =
    outcome === 'PLAYER_WIN'
      ? styles['duel-modal__outcome-banner--win']
      : outcome === 'BOT_WIN'
        ? styles['duel-modal__outcome-banner--loss']
        : styles['duel-modal__outcome-banner--tie'];

  const outcomeTitle =
    outcome === 'PLAYER_WIN'
      ? 'VICTORY (勝利)'
      : outcome === 'BOT_WIN'
        ? 'DEFEAT (敗北)'
        : 'DRAW (引き分け)';

  const outcomeDescription =
    outcome === 'PLAYER_WIN'
      ? `You won 1 Star from ${opponent.name}! Both cards burned.`
      : outcome === 'BOT_WIN'
        ? `${opponent.name} seized 1 Star from you! Both cards burned.`
        : 'Neither player wins a star. Both cards burned to discard.';

  return (
    <div className={styles['duel-modal-backdrop']} role="dialog" aria-modal="true" aria-label="Duel Arena">
      <div className={styles['duel-modal']}>
        <div className={styles['duel-modal__ambient-zawa']}>
          ざわ... ざわ... ZAWA... ZAWA... ざわ... ざわ...
        </div>

        <header className={styles['duel-modal__header']}>
          <h2 className={styles['duel-modal__title']}>Face-Off Arena // 決闘場</h2>
          <span className={styles['duel-modal__subtitle']}>
            {isSelection && 'Select a card from your inventory below, then confirm.'}
            {isReveal && 'Cards are locked in. Uncover the cards simultaneously!'}
            {isResolve && 'Duel concluded. Review outcome and star exchange.'}
          </span>
        </header>

        <div className={styles['duel-modal__table']}>
          {/* PLAYER SIDE */}
          <div className={styles['duel-modal__participant']}>
            <span className={styles['duel-modal__participant-name']}>{humanPlayer.name}</span>
            <span className={styles['duel-modal__participant-stars']}>⭐ {humanPlayer.stars} Stars</span>
            {playerCard ? (
              <div
                className={`${styles['duel-modal__card-slot']} ${styles['duel-modal__card-slot--revealed']} ${
                  playerCard === CardType.ROCK
                    ? styles['duel-modal__card-slot--rock']
                    : playerCard === CardType.PAPER
                      ? styles['duel-modal__card-slot--paper']
                      : styles['duel-modal__card-slot--scissors']
                }`}
                data-testid="player-slot-card"
              >
                <span className={styles['duel-modal__card-symbol']}>{getCardIcon(playerCard)}</span>
                <span className={styles['duel-modal__card-type']}>{playerCard}</span>
              </div>
            ) : (
              <div className={`${styles['duel-modal__card-slot']} ${styles['duel-modal__card-slot--empty']}`}>
                Select a card below
              </div>
            )}
          </div>

          {/* VS BADGE */}
          <div className={styles['duel-modal__vs-container']}>
            <span className={styles['duel-modal__vs-badge']}>VS</span>
          </div>

          {/* OPPONENT SIDE */}
          <div className={styles['duel-modal__participant']}>
            <span className={styles['duel-modal__participant-name']}>{opponent.name}</span>
            <span className={styles['duel-modal__participant-stars']}>⭐ {opponent.stars} Stars</span>

            {isResolve && opponentCard ? (
              <div
                className={`${styles['duel-modal__card-slot']} ${styles['duel-modal__card-slot--revealed']} ${
                  opponentCard === CardType.ROCK
                    ? styles['duel-modal__card-slot--rock']
                    : opponentCard === CardType.PAPER
                      ? styles['duel-modal__card-slot--paper']
                      : styles['duel-modal__card-slot--scissors']
                }`}
                data-testid="opponent-slot-revealed"
              >
                <span className={styles['duel-modal__card-symbol']}>{getCardIcon(opponentCard)}</span>
                <span className={styles['duel-modal__card-type']}>{opponentCard}</span>
              </div>
            ) : (
              <div
                className={`${styles['duel-modal__card-slot']} ${styles['duel-modal__card-slot--facedown']}`}
                data-testid="opponent-slot-facedown"
              >
                <span className={styles['duel-modal__facedown-art']}>ESPOIR</span>
                <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>SECRET CARD</span>
              </div>
            )}
          </div>
        </div>

        {/* OUTCOME BANNER */}
        {isResolve && outcome && (
          <div
            className={`${styles['duel-modal__outcome-banner']} ${outcomeBannerClass}`}
            data-testid="outcome-banner"
          >
            <h3 className={styles['duel-modal__outcome-title']}>{outcomeTitle}</h3>
            <p className={styles['duel-modal__outcome-desc']}>{outcomeDescription}</p>
          </div>
        )}

        {/* CARD SELECTION GRID — only shown during DUEL_SELECTION */}
        {isSelection && (
          <div className={styles['duel-modal__card-picker']} role="group" aria-label="Select your card">
            {(
              [
                { type: CardType.ROCK, icon: '✊', label: 'Rock' },
                { type: CardType.PAPER, icon: '✋', label: 'Paper' },
                { type: CardType.SCISSORS, icon: '✌', label: 'Scissors' },
              ] as const
            ).map(({ type, icon, label }) => {
              const count = humanPlayer.cards[type];
              const isSelected = playerCard === type;
              return (
                <button
                  key={type}
                  type="button"
                  className={`${styles['duel-modal__pick-btn']} ${styles[`duel-modal__pick-btn--${type.toLowerCase()}`]} ${isSelected ? styles['duel-modal__pick-btn--selected'] : ''}`}
                  disabled={count === 0}
                  onClick={() => onSelectCard(type)}
                  aria-pressed={isSelected}
                  aria-label={`Select ${label}. ${count} remaining.`}
                  data-testid={`modal-card-${type.toLowerCase()}`}
                >
                  <span className={styles['duel-modal__pick-icon']}>{icon}</span>
                  <span className={styles['duel-modal__pick-label']}>{label}</span>
                  <span className={styles['duel-modal__pick-count']}>×{count}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* ACTIONS */}
        <div className={styles['duel-modal__actions']}>
          {isSelection && (
            <>
              <button
                type="button"
                className={`${styles['duel-modal__btn']} ${styles['duel-modal__btn--secondary']}`}
                onClick={onCancelDuel}
              >
                Cancel Duel
              </button>
              <button
                type="button"
                className={`${styles['duel-modal__btn']} ${styles['duel-modal__btn--primary']}`}
                disabled={!playerCard}
                onClick={onConfirmSelection}
                data-testid="confirm-duel-btn"
              >
                Lock In Selection
              </button>
            </>
          )}

          {isReveal && (
            <button
              type="button"
              className={`${styles['duel-modal__btn']} ${styles['duel-modal__btn--reveal']}`}
              onClick={onRevealDuel}
              data-testid="open-cards-btn"
            >
              ⚡ OPEN CARDS (OPEN!!)
            </button>
          )}

          {isResolve && (
            <button
              type="button"
              className={`${styles['duel-modal__btn']} ${styles['duel-modal__btn--primary']}`}
              onClick={onResolveRound}
              data-testid="continue-btn"
            >
              Proceed to Next Round (次へ) ➔
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
