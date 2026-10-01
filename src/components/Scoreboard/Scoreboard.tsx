import React from 'react';
import { CardType, type DiscardPool } from '../../types/game';
import styles from './Scoreboard.module.css';

export interface ScoreboardProps {
  readonly circulation: Record<CardType, number>;
  readonly discardPool: DiscardPool;
  readonly totalActiveStars: number;
  readonly roundCount: number;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({
  circulation,
  discardPool,
  totalActiveStars,
  roundCount,
}) => {
  const totalBurned =
    discardPool[CardType.ROCK] +
    discardPool[CardType.PAPER] +
    discardPool[CardType.SCISSORS];

  return (
    <section className={styles.scoreboard} aria-label="Espoir Central Scoreboard">
      <header className={styles.scoreboard__header}>
        <div>
          <h2 className={styles.scoreboard__title}>Central Market Ledger</h2>
          <span className={styles.scoreboard__subtitle}>
            Cards Remaining In Circulation (Hands of Active Duelists)
          </span>
        </div>
        <div className={styles['scoreboard__meta-badge']}>
          ROUND #{roundCount} // {totalActiveStars} STARS IN PLAY
        </div>
      </header>

      <div className={styles.scoreboard__grid}>
        <div
          className={`${styles['scoreboard__card-counter']} ${styles['scoreboard__card-counter--rock']}`}
          data-testid="counter-rock"
        >
          <span className={styles['scoreboard__card-label']}>Rock (Piedra)</span>
          <span className={styles['scoreboard__card-symbol']}>✊</span>
          <span className={styles['scoreboard__card-number']}>
            {circulation[CardType.ROCK]}
          </span>
        </div>

        <div
          className={`${styles['scoreboard__card-counter']} ${styles['scoreboard__card-counter--paper']}`}
          data-testid="counter-paper"
        >
          <span className={styles['scoreboard__card-label']}>Paper (Papel)</span>
          <span className={styles['scoreboard__card-symbol']}>✋</span>
          <span className={styles['scoreboard__card-number']}>
            {circulation[CardType.PAPER]}
          </span>
        </div>

        <div
          className={`${styles['scoreboard__card-counter']} ${styles['scoreboard__card-counter--scissors']}`}
          data-testid="counter-scissors"
        >
          <span className={styles['scoreboard__card-label']}>Scissors (Tijera)</span>
          <span className={styles['scoreboard__card-symbol']}>✌</span>
          <span className={styles['scoreboard__card-number']}>
            {circulation[CardType.SCISSORS]}
          </span>
        </div>
      </div>

      <div className={styles['scoreboard__discard-section']}>
        <span className={styles['scoreboard__discard-title']}>
          Burned / Discarded (焼却済み): {totalBurned}
        </span>
        <div className={styles['scoreboard__discard-items']}>
          <div className={styles['scoreboard__discard-item']}>
            <span>✊ Rock:</span>
            <span className={styles['scoreboard__discard-value']}>
              {discardPool[CardType.ROCK]}
            </span>
          </div>
          <div className={styles['scoreboard__discard-item']}>
            <span>✋ Paper:</span>
            <span className={styles['scoreboard__discard-value']}>
              {discardPool[CardType.PAPER]}
            </span>
          </div>
          <div className={styles['scoreboard__discard-item']}>
            <span>✌ Scissors:</span>
            <span className={styles['scoreboard__discard-value']}>
              {discardPool[CardType.SCISSORS]}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
