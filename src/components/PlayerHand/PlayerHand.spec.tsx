import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PlayerHand } from './PlayerHand';
import { CardType, type Participant } from '../../types/game';

describe('PlayerHand', () => {
  const basePlayer: Participant = {
    id: 'human-1',
    name: 'Kaiji (You)',
    isHuman: true,
    stars: 3,
    cards: {
      [CardType.ROCK]: 4,
      [CardType.PAPER]: 0,
      [CardType.SCISSORS]: 2,
    },
    status: 'ACTIVE',
  };

  it('renders player identity, stars, and card counts', () => {
    // Arrange & Act
    render(
      <PlayerHand
        player={basePlayer}
        selectedCard={null}
        isSelectionPhase={false}
        onSelectCard={() => {}}
      />
    );

    // Assert
    expect(screen.getByText('Kaiji (You)')).toBeInTheDocument();
    expect(screen.getByText(/3 Stars/i)).toBeInTheDocument();
    expect(screen.getByTestId('player-card-rock')).toBeInTheDocument();
    expect(screen.getByTestId('player-card-paper')).toBeDisabled(); // 0 paper cards
  });

  it('calls onSelectCard when available card is clicked in selection phase', () => {
    // Arrange
    const onSelectCard = vi.fn();
    render(
      <PlayerHand
        player={basePlayer}
        selectedCard={null}
        isSelectionPhase={true}
        onSelectCard={onSelectCard}
      />
    );

    // Act
    fireEvent.click(screen.getByTestId('player-card-rock'));

    // Assert
    expect(onSelectCard).toHaveBeenCalledWith(CardType.ROCK);
  });
});
