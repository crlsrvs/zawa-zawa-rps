import React, { useState } from 'react';
import { useGameEngine } from './hooks/useGameEngine';
import { Scoreboard } from './components/Scoreboard/Scoreboard';
import { PlayerHand } from './components/PlayerHand/PlayerHand';
import { LobbyGrid } from './components/LobbyGrid/LobbyGrid';
import { DuelModal } from './components/DuelModal/DuelModal';
import styles from './App.module.css';
import type { GameOverReason } from './types/game';

export const App: React.FC = () => {
  const [configuredBots, setConfiguredBots] = useState<number>(5);

  const {
    state,
    humanPlayer,
    activeOpponent,
    botList,
    circulation,
    totalActiveStars,
    initGame,
    selectOpponent,
    selectPlayerCard,
    cancelDuel,
    confirmDuelSelection,
    revealDuel,
    resolveRound,
    restartGame,
  } = useGameEngine(configuredBots);

  const isLobby = state.phase === 'LOBBY';
  const isSelection = state.phase === 'DUEL_SELECTION';
  const isGameOver = state.phase === 'GAME_OVER';

  const handleBotCountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const count = parseInt(e.target.value, 10);
    setConfiguredBots(count);
    initGame(count);
  };

  const isHumanQualified = humanPlayer.status === 'QUALIFIED';
  const remainingCards = Object.values(humanPlayer.cards).reduce((sum, count) => sum + count, 0);
  const gameOverMessages: Record<GameOverReason, { title: string; description: string }> = {
    QUALIFIED: {
      title: 'SURVIVOR OF THE ESPOIR',
      description: `You successfully burned all 12 cards while securing ${humanPlayer.stars} Stars! Your debts have been cleared.`,
    },
    NO_STARS: {
      title: 'CONSIGNED TO THE UNDERGROUND',
      description: 'All stars were seized by your opponents. You are sent to the Teiai subterranean labor camp.',
    },
    INSUFFICIENT_STARS: {
      title: 'CONSIGNED TO THE UNDERGROUND',
      description: 'You ran out of cards with fewer than 3 stars. You failed to qualify for freedom.',
    },
    NO_OPPONENTS: {
      title: 'NO OPPONENTS REMAIN',
      description: `No active opponents remain. You still hold ${remainingCards} cards and ${humanPlayer.stars} stars. You cannot burn your remaining cards, so the game ends without qualification.`,
    },
  };
  const gameOverMessage = state.gameOverReason ? gameOverMessages[state.gameOverReason] : null;

  return (
    <div className={styles.app}>
      <header className={styles.app__header}>
        <div className={styles.app__branding}>
          <h1 className={styles.app__title}>
            <span>Zawa Zawa</span>
            <span className={styles['app__title-accent']}>RPS</span>
          </h1>
          <span className={styles.app__subtitle}>
            ESPOIR RESTRICTED ROCK-PAPER-SCISSORS // 限定ジャンケン
          </span>
        </div>

        {isLobby && (
          <div className={styles['app__config-bar']}>
            <label htmlFor="bot-count-select" className={styles['app__config-label']}>
              AI Debtors:
            </label>
            <select
              id="bot-count-select"
              value={configuredBots}
              onChange={handleBotCountChange}
              className={styles['app__config-select']}
              aria-label="Configure AI debtors count"
            >
              <option value={1}>1 Opponent</option>
              <option value={3}>3 Opponents</option>
              <option value={5}>5 Opponents (Standard)</option>
              <option value={7}>7 Opponents (Maximum)</option>
            </select>

            <button
              type="button"
              className={styles['app__config-btn']}
              onClick={restartGame}
            >
              Reset Floor
            </button>
          </div>
        )}
      </header>

      <main className={styles.app__main}>
        <details className={styles.app__help}>
          <summary className={styles['app__help-summary']}>How to play · Espoir rules</summary>
          <div className={styles['app__help-content']}>
            <p>Start with 12 cards (4 Rock, 4 Paper, 4 Scissors) and 3 stars. Challenge an active opponent, choose a card, lock it in, then reveal.</p>
            <ul>
              <li>Rock beats Scissors, Scissors beats Paper, and Paper beats Rock. The winner takes 1 star; a tie transfers none. Both cards are burned, even on a tie.</li>
              <li>Qualify by burning all 12 cards while keeping at least 3 stars. Lose immediately at 0 stars, or finish without qualification if you run out of cards with fewer than 3 stars.</li>
              <li>If no active opponents remain while you still hold cards, the game ends without qualification. Plan your challenges carefully.</li>
              <li>The ledger counts cards held by active players. Bots only duel when challenged; trading is not available in this version.</li>
            </ul>
            <p>Changing the opponent count, using Reset Floor, or reloading starts a new game. Progress is not saved.</p>
          </div>
        </details>
        {/* Global Market Scoreboard */}
        <Scoreboard
          circulation={circulation}
          discardPool={state.discardPool}
          totalActiveStars={totalActiveStars}
          roundCount={state.roundCount}
        />

        {/* Human Player Hand & Assets */}
        <PlayerHand
          player={humanPlayer}
          selectedCard={state.activeDuel?.playerCard ?? null}
          isSelectionPhase={isSelection}
          onSelectCard={selectPlayerCard}
        />

        {/* Bot Opponents Roster */}
        <LobbyGrid
          bots={botList}
          isLobbyPhase={isLobby}
          activeOpponentId={state.activeDuel?.opponentId ?? null}
          onChallengeBot={selectOpponent}
        />
      </main>

      {/* Duel Arena Modal */}
      {activeOpponent && state.activeDuel && (isSelection || state.phase === 'DUEL_REVEAL' || state.phase === 'ROUND_RESOLVE') && (
        <DuelModal
          phase={state.phase}
          humanPlayer={humanPlayer}
          opponent={activeOpponent}
          activeDuel={state.activeDuel}
          onSelectCard={selectPlayerCard}
          onConfirmSelection={confirmDuelSelection}
          onRevealDuel={revealDuel}
          onResolveRound={resolveRound}
          onCancelDuel={cancelDuel}
        />
      )}

      {/* Game Over Screen */}
      {isGameOver && gameOverMessage && (
        <div className={styles['app__gameover-backdrop']} role="alertdialog" aria-modal="true" aria-labelledby="gameover-title" aria-describedby="gameover-description">
          <div
            className={`${styles['app__gameover-modal']} ${
              isHumanQualified
                ? styles['app__gameover-modal--qualified']
                : styles['app__gameover-modal--eliminated']
            }`}
          >
            <div
              className={`${styles['app__gameover-badge']} ${
                isHumanQualified
                  ? styles['app__gameover-badge--qualified']
                  : styles['app__gameover-badge--eliminated']
              }`}
            >
              {isHumanQualified ? 'MISSION COMPLETE // 生還' : state.gameOverReason === 'NO_OPPONENTS' ? 'FLOOR CLOSED // NOT QUALIFIED' : 'CONTRACT TERMINATED // 脱落'}
            </div>

            <h2 id="gameover-title" className={styles['app__gameover-title']}>
              {gameOverMessage.title}
            </h2>

            <p id="gameover-description" className={styles['app__gameover-desc']}>
              {gameOverMessage.description}
            </p>

            <button
              type="button"
              className={styles['app__gameover-btn']}
              onClick={restartGame}
            >
              Enter The Espoir Again ➔
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
