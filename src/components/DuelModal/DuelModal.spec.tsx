import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DuelModal } from './DuelModal';
import { CardType, type Participant, type DuelState } from '../../types/game';

describe('DuelModal', () => {
  const human: Participant = {
    id: 'human-1',
    name: 'Kaiji (You)',
    isHuman: true,
    stars: 3,
    cards: { [CardType.ROCK]: 4, [CardType.PAPER]: 4, [CardType.SCISSORS]: 4 },
    status: 'ACTIVE',
  };

  const opponent: Participant = {
    id: 'bot-1',
    name: 'Kitami',
    isHuman: false,
    stars: 3,
    cards: { [CardType.ROCK]: 4, [CardType.PAPER]: 4, [CardType.SCISSORS]: 4 },
    status: 'ACTIVE',
  };

  it('renders face-down card and handles confirm selection', () => {
    // Arrange
    const activeDuel: DuelState = {
      opponentId: 'bot-1',
      playerCard: CardType.ROCK,
      opponentCard: null,
      outcome: null,
      starsExchanged: 0,
    };
    const onConfirm = vi.fn();

    // Act
    render(
      <DuelModal
        phase="DUEL_SELECTION"
        humanPlayer={human}
        opponent={opponent}
        activeDuel={activeDuel}
        onConfirmSelection={onConfirm}
        onRevealDuel={() => {}}
        onResolveRound={() => {}}
        onCancelDuel={() => {}}
      />
    );

    // Assert
    expect(screen.getByTestId('opponent-slot-facedown')).toBeInTheDocument();
    expect(screen.getByTestId('player-slot-card')).toHaveTextContent('ROCK');

    fireEvent.click(screen.getByTestId('confirm-duel-btn'));
    expect(onConfirm).toHaveBeenCalled();
  });

  it('renders reveal button and handles reveal in DUEL_REVEAL phase', () => {
    // Arrange
    const activeDuel: DuelState = {
      opponentId: 'bot-1',
      playerCard: CardType.ROCK,
      opponentCard: CardType.SCISSORS,
      outcome: null,
      starsExchanged: 0,
    };
    const onReveal = vi.fn();

    // Act
    render(
      <DuelModal
        phase="DUEL_REVEAL"
        humanPlayer={human}
        opponent={opponent}
        activeDuel={activeDuel}
        onConfirmSelection={() => {}}
        onRevealDuel={onReveal}
        onResolveRound={() => {}}
        onCancelDuel={() => {}}
      />
    );

    // Assert
    const openBtn = screen.getByTestId('open-cards-btn');
    expect(openBtn).toBeInTheDocument();

    fireEvent.click(openBtn);
    expect(onReveal).toHaveBeenCalled();
  });

  it('renders outcome banner and proceed button in ROUND_RESOLVE phase', () => {
    // Arrange
    const activeDuel: DuelState = {
      opponentId: 'bot-1',
      playerCard: CardType.ROCK,
      opponentCard: CardType.SCISSORS,
      outcome: 'PLAYER_WIN',
      starsExchanged: 1,
    };
    const onResolve = vi.fn();

    // Act
    render(
      <DuelModal
        phase="ROUND_RESOLVE"
        humanPlayer={{ ...human, stars: 4 }}
        opponent={{ ...opponent, stars: 2 }}
        activeDuel={activeDuel}
        onConfirmSelection={() => {}}
        onRevealDuel={() => {}}
        onResolveRound={onResolve}
        onCancelDuel={() => {}}
      />
    );

    // Assert
    expect(screen.getByTestId('outcome-banner')).toBeInTheDocument();
    expect(screen.getByTestId('opponent-slot-revealed')).toHaveTextContent('SCISSORS');
    const continueBtn = screen.getByTestId('continue-btn');
    expect(continueBtn).toBeInTheDocument();

    fireEvent.click(continueBtn);
    expect(onResolve).toHaveBeenCalled();
  });
});
