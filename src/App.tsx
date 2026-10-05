import React, { useState } from 'react';
import { useGameEngine } from './hooks/useGameEngine';
import { Scoreboard } from './components/Scoreboard/Scoreboard';
import { PlayerHand } from './components/PlayerHand/PlayerHand';
import { LobbyGrid } from './components/LobbyGrid/LobbyGrid';
import { DuelModal } from './components/DuelModal/DuelModal';
import styles from './App.module.css';

export const App: React.FC = () => {
  const intentionalLintError = 'intentional lint error';
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
      {isGameOver && (
        <div className={styles['app__gameover-backdrop']} role="alertdialog" aria-modal="true">
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
              {isHumanQualified ? 'MISSION COMPLETE // 生還' : 'CONTRACT TERMINATED // 脱落'}
            </div>

            <h2 className={styles['app__gameover-title']}>
              {isHumanQualified ? 'SURVIVOR OF THE ESPOIR' : 'CONSIGNED TO THE UNDERGROUND'}
            </h2>

            <p className={styles['app__gameover-desc']}>
              {isHumanQualified
                ? `You successfully burned all 12 cards while securing ${humanPlayer.stars} Stars! Your debts have been cleared.`
                : humanPlayer.stars <= 0
                  ? 'All stars were seized by your opponents. You are sent to the Teiai subterranean labor camp.'
                  : 'You ran out of cards with fewer than 3 stars. You failed to qualify for freedom.'}
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
