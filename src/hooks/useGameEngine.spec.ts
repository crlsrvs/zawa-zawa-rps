import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { CardType } from '../types/game';
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
