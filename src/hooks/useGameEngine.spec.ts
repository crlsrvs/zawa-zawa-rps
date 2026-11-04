import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { CardType, type GameState } from '../types/game';
import {
  useGameEngine,
  gameReducer,
  createInitialGameState,
  evaluateParticipantStatus,
} from './useGameEngine';

describe('evaluateParticipantStatus', () => {
  it('returns ELIMINATED when stars reach 0', () => {
    // Arrange
    const cards = { [CardType.ROCK]: 2, [CardType.PAPER]: 2, [CardType.SCISSORS]: 2 };
    const stars = 0;

    // Act
    const status = evaluateParticipantStatus(cards, stars);

    // Assert
    expect(status).toBe('ELIMINATED');
  });

  it('returns QUALIFIED when cards reach 0 and stars are >= 3', () => {
    // Arrange
    const cards = { [CardType.ROCK]: 0, [CardType.PAPER]: 0, [CardType.SCISSORS]: 0 };
    const stars = 3;

    // Act
    const status = evaluateParticipantStatus(cards, stars);

    // Assert
    expect(status).toBe('QUALIFIED');
  });

  it('returns ELIMINATED when cards reach 0 and stars are < 3', () => {
    // Arrange
    const cards = { [CardType.ROCK]: 0, [CardType.PAPER]: 0, [CardType.SCISSORS]: 0 };
    const stars = 2;

    // Act
    const status = evaluateParticipantStatus(cards, stars);

    // Assert
    expect(status).toBe('ELIMINATED');
  });

  it('returns ACTIVE when participant has cards and stars > 0', () => {
    // Arrange
    const cards = { [CardType.ROCK]: 1, [CardType.PAPER]: 0, [CardType.SCISSORS]: 0 };
    const stars = 1;

    // Act
    const status = evaluateParticipantStatus(cards, stars);

    // Assert
    expect(status).toBe('ACTIVE');
  });
});

describe('gameReducer FSM lifecycle', () => {
  it('flows through LOBBY -> DUEL_SELECTION -> DUEL_REVEAL -> ROUND_RESOLVE -> LOBBY', () => {
    // Arrange
    let state = createInitialGameState(2);
    expect(state.phase).toBe('LOBBY');
    expect(state.discardPool.ROCK).toBe(0);

    // Act 1: Select opponent
    state = gameReducer(state, {
      type: 'SELECT_OPPONENT',
      payload: { opponentId: 'bot-1' },
    });

    // Assert 1
    expect(state.phase).toBe('DUEL_SELECTION');
    expect(state.activeDuel?.opponentId).toBe('bot-1');

    // Act 2: Select card
    state = gameReducer(state, {
      type: 'SELECT_PLAYER_CARD',
      payload: { card: CardType.ROCK },
    });

    // Assert 2
    expect(state.activeDuel?.playerCard).toBe(CardType.ROCK);

    // Act 3: Confirm duel selection
    state = gameReducer(state, { type: 'CONFIRM_DUEL_SELECTION' });

    // Assert 3
    expect(state.phase).toBe('DUEL_REVEAL');
    expect(state.activeDuel?.opponentCard).not.toBeNull();

    // Act 4: Reveal duel
    state = gameReducer(state, { type: 'REVEAL_DUEL' });

    // Assert 4
    expect(state.phase).toBe('ROUND_RESOLVE');
    expect(state.activeDuel?.outcome).toBeDefined();
    // 2 cards must have been burned into discard pool
    const totalDiscarded =
      state.discardPool.ROCK + state.discardPool.PAPER + state.discardPool.SCISSORS;
    expect(totalDiscarded).toBe(2);

    // Act 5: Resolve round
    state = gameReducer(state, { type: 'RESOLVE_ROUND' });

    // Assert 5: transitions back to LOBBY for next round
    expect(state.phase).toBe('LOBBY');
    expect(state.activeDuel).toBeNull();
    expect(state.roundCount).toBe(2);
  });

  it('cancels duel back to LOBBY during DUEL_SELECTION', () => {
    // Arrange
    let state = createInitialGameState(2);
    state = gameReducer(state, {
      type: 'SELECT_OPPONENT',
      payload: { opponentId: 'bot-1' },
    });

    // Act
    state = gameReducer(state, { type: 'CANCEL_DUEL' });

    // Assert
    expect(state.phase).toBe('LOBBY');
    expect(state.activeDuel).toBeNull();
  });
});

describe('card conservation and game endings', () => {
  it.each([CardType.ROCK, CardType.PAPER, CardType.SCISSORS])('burns both %s cards on a tie exactly once', (card) => {
    // Arrange
    const initial = createInitialGameState(1);
    const before: GameState = {
      ...initial,
      phase: 'DUEL_REVEAL',
      discardPool: { ROCK: 2, PAPER: 2, SCISSORS: 2 },
      participants: Object.fromEntries(Object.entries(initial.participants).map(([id, participant]) => [
        id, { ...participant, cards: { ROCK: 3, PAPER: 3, SCISSORS: 3 } },
      ])),
      activeDuel: { opponentId: 'bot-1', playerCard: card, opponentCard: card, outcome: null, starsExchanged: 0 },
    };

    // Act
    const after = gameReducer(before, { type: 'REVEAL_DUEL' });
    const duplicate = gameReducer(after, { type: 'REVEAL_DUEL' });

    // Assert
    expect(after.discardPool[card]).toBe(4);
    expect(after.participants['human-player']?.cards[card]).toBe(2);
    expect(after.participants['bot-1']?.cards[card]).toBe(2);
    expect(Object.values(after.discardPool).reduce((sum, count) => sum + count, 0)).toBe(8);
    const totalCards = (state: GameState) => Object.values(state.participants)
      .reduce((sum, participant) => sum + Object.values(participant.cards).reduce((total, count) => total + count, 0), 0)
      + Object.values(state.discardPool).reduce((sum, count) => sum + count, 0);
    expect(totalCards(after)).toBe(totalCards(before));
    expect(totalCards(after)).toBe(24);
    expect(after.participants['human-player']?.stars).toBe(3);
    expect(after.participants['bot-1']?.stars).toBe(3);
    expect(duplicate).toBe(after);
    expect(before.discardPool[card]).toBe(2);
  });

  it.each([
    { reason: 'QUALIFIED', humanStars: 3, humanRock: 1, botStars: 3, botCards: { ROCK: 1, PAPER: 0, SCISSORS: 0 }, botCard: CardType.ROCK, status: 'QUALIFIED' },
    { reason: 'NO_STARS', humanStars: 1, humanRock: 4, botStars: 3, botCards: { ROCK: 0, PAPER: 4, SCISSORS: 0 }, botCard: CardType.PAPER, status: 'ELIMINATED' },
    { reason: 'INSUFFICIENT_STARS', humanStars: 2, humanRock: 1, botStars: 3, botCards: { ROCK: 1, PAPER: 0, SCISSORS: 0 }, botCard: CardType.ROCK, status: 'ELIMINATED' },
    { reason: 'NO_OPPONENTS', humanStars: 5, humanRock: 4, botStars: 1, botCards: { ROCK: 0, PAPER: 0, SCISSORS: 4 }, botCard: CardType.SCISSORS, status: 'ACTIVE' },
  ])('records $reason after the final duel and clears it on restart', ({ reason, humanStars, humanRock, botStars, botCards, botCard, status }) => {
    // Arrange
    const initial = createInitialGameState(1);
    const human = initial.participants['human-player']!;
    const bot = initial.participants['bot-1']!;
    const before: GameState = {
      ...initial,
      phase: 'DUEL_REVEAL',
      participants: {
        [human.id]: { ...human, stars: humanStars, cards: { ROCK: humanRock, PAPER: 0, SCISSORS: 0 } },
        [bot.id]: { ...bot, stars: botStars, cards: botCards },
      },
      activeDuel: { opponentId: bot.id, playerCard: CardType.ROCK, opponentCard: botCard, outcome: null, starsExchanged: 0 },
    };

    // Act
    const revealed = gameReducer(before, { type: 'REVEAL_DUEL' });
    const finished = gameReducer(revealed, { type: 'RESOLVE_ROUND' });

    // Assert
    expect(revealed.phase).toBe('ROUND_RESOLVE');
    expect(finished.phase).toBe('GAME_OVER');
    expect(finished.gameOverReason).toBe(reason);
    expect(finished.participants[human.id]?.status).toBe(status);
    expect(finished.activeDuel).toBeNull();
    expect(gameReducer(finished, { type: 'SELECT_OPPONENT', payload: { opponentId: bot.id } })).toBe(finished);

    // Act
    const restarted = gameReducer(finished, { type: 'RESTART_GAME' });

    // Assert
    expect(restarted).toEqual(createInitialGameState(1));
    expect(restarted.gameOverReason).toBeNull();
  });
});

describe('useGameEngine Hook', () => {
  it('initializes with default participants and provides state and action helpers', () => {
    // Arrange & Act
    const { result } = renderHook(() => useGameEngine(3));

    // Assert
    expect(result.current.state.phase).toBe('LOBBY');
    expect(result.current.humanPlayer.isHuman).toBe(true);
    expect(result.current.humanPlayer.stars).toBe(3);
    expect(result.current.botList.length).toBe(3);
    expect(result.current.totalBurnedCards).toBe(0);

    // Act: Initiate duel
    act(() => {
      result.current.selectOpponent('bot-1');
    });

    // Assert
    expect(result.current.state.phase).toBe('DUEL_SELECTION');
    expect(result.current.activeOpponent?.id).toBe('bot-1');
  });
});
