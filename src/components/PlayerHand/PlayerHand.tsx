import React from 'react';
import { CardType, type Participant } from '../../types/game';
import styles from './PlayerHand.module.css';

export interface PlayerHandProps {
  readonly player: Participant;
  readonly selectedCard: CardType | null;
  readonly isSelectionPhase: boolean;
  readonly onSelectCard: (card: CardType) => void;
}

export const PlayerHand: React.FC<PlayerHandProps> = ({
  player,
  selectedCard,
  isSelectionPhase,
  onSelectCard,
}) => {
  const totalCards =
    player.cards[CardType.ROCK] +
    player.cards[CardType.PAPER] +
    player.cards[CardType.SCISSORS];

  const statusClass =
    player.status === 'QUALIFIED'
      ? styles['player-hand__status--qualified']
      : player.status === 'ELIMINATED'
        ? styles['player-hand__status--eliminated']
        : styles['player-hand__status--active'];

  return (
    <section className={styles['player-hand']} aria-label="Player Hand and Assets">
      <header className={styles['player-hand__header']}>
        <div className={styles['player-hand__identity']}>
          <h2 className={styles['player-hand__name']}>{player.name}</h2>
          <span className={`${styles['player-hand__status']} ${statusClass}`}>
            Status: {player.status}
          </span>
        </div>

        <div className={styles['player-hand__assets']}>
          <div className={styles['player-hand__stars']} aria-label={`${player.stars} Stars`}>
            <span className={styles['player-hand__star-icon']}>⭐</span>
            <span className={styles['player-hand__star-count']}>{player.stars} Stars</span>
          </div>

          <div className={styles['player-hand__cards-summary']}>
            Cards in Hand:{' '}
            <span className={styles['player-hand__cards-total']}>{totalCards}</span>
          </div>
        </div>
      </header>

      {isSelectionPhase && (
        <div className={styles['player-hand__instruction']}>
          ⚡ Duel Active: Choose your secret card to throw against the opponent!
        </div>
      )}

      <div className={styles['player-hand__cards-grid']}>
        {/* ROCK */}
        <button
          type="button"
          className={`${styles['player-hand__card']} ${styles['player-hand__card--rock']} ${
            selectedCard === CardType.ROCK ? styles['player-hand__card--selected'] : ''
          }`}
          disabled={!isSelectionPhase || player.cards[CardType.ROCK] === 0}
          onClick={() => onSelectCard(CardType.ROCK)}
          aria-label={`Select Rock. ${player.cards[CardType.ROCK]} remaining.`}
          data-testid="player-card-rock"
        >
          <span className={styles['player-hand__card-symbol']}>✊</span>
          <span className={styles['player-hand__card-title']}>Rock</span>
          <span className={styles['player-hand__card-count']}>
            Remaining: <span className={styles['player-hand__card-count-num']}>{player.cards[CardType.ROCK]}</span>
          </span>
        </button>

        {/* PAPER */}
        <button
          type="button"
          className={`${styles['player-hand__card']} ${styles['player-hand__card--paper']} ${
            selectedCard === CardType.PAPER ? styles['player-hand__card--selected'] : ''
          }`}
          disabled={!isSelectionPhase || player.cards[CardType.PAPER] === 0}
          onClick={() => onSelectCard(CardType.PAPER)}
          aria-label={`Select Paper. ${player.cards[CardType.PAPER]} remaining.`}
          data-testid="player-card-paper"
        >
          <span className={styles['player-hand__card-symbol']}>✋</span>
          <span className={styles['player-hand__card-title']}>Paper</span>
          <span className={styles['player-hand__card-count']}>
            Remaining: <span className={styles['player-hand__card-count-num']}>{player.cards[CardType.PAPER]}</span>
          </span>
        </button>

        {/* SCISSORS */}
        <button
          type="button"
          className={`${styles['player-hand__card']} ${styles['player-hand__card--scissors']} ${
            selectedCard === CardType.SCISSORS ? styles['player-hand__card--selected'] : ''
          }`}
          disabled={!isSelectionPhase || player.cards[CardType.SCISSORS] === 0}
          onClick={() => onSelectCard(CardType.SCISSORS)}
          aria-label={`Select Scissors. ${player.cards[CardType.SCISSORS]} remaining.`}
          data-testid="player-card-scissors"
        >
          <span className={styles['player-hand__card-symbol']}>✌</span>
          <span className={styles['player-hand__card-title']}>Scissors</span>
          <span className={styles['player-hand__card-count']}>
            Remaining: <span className={styles['player-hand__card-count-num']}>{player.cards[CardType.SCISSORS]}</span>
          </span>
        </button>
      </div>
    </section>
  );
};
