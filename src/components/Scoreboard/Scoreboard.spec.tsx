import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Scoreboard } from './Scoreboard';
import { CardType } from '../../types/game';

describe('Scoreboard', () => {
  it('renders circulation counts and discard pool correctly', () => {
    // Arrange
    const circulation = {
      [CardType.ROCK]: 12,
      [CardType.PAPER]: 8,
      [CardType.SCISSORS]: 14,
    };
    const discardPool = {
      [CardType.ROCK]: 4,
      [CardType.PAPER]: 2,
      [CardType.SCISSORS]: 6,
    };
    const totalActiveStars = 15;
    const roundCount = 3;

    // Act
    render(
      <Scoreboard
        circulation={circulation}
        discardPool={discardPool}
        totalActiveStars={totalActiveStars}
        roundCount={roundCount}
      />
    );

    // Assert
    expect(screen.getByTestId('counter-rock')).toHaveTextContent('12');
    expect(screen.getByTestId('counter-paper')).toHaveTextContent('8');
    expect(screen.getByTestId('counter-scissors')).toHaveTextContent('14');
    expect(screen.getByText(/ROUND #3/i)).toBeInTheDocument();
    expect(screen.getByText(/15 STARS IN PLAY/i)).toBeInTheDocument();
    expect(screen.getByText(/Burned \/ Discarded.*12/i)).toBeInTheDocument();
  });
});
