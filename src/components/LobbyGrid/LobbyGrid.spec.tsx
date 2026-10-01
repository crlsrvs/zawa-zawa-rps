import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LobbyGrid } from './LobbyGrid';
import { CardType, type Participant } from '../../types/game';

describe('LobbyGrid', () => {
  const bots: Participant[] = [
    {
      id: 'bot-1',
      name: 'Funai (The Trickster)',
      isHuman: false,
      stars: 3,
      cards: { [CardType.ROCK]: 2, [CardType.PAPER]: 2, [CardType.SCISSORS]: 2 },
      status: 'ACTIVE',
      botStrategy: 'HOARDER',
    },
    {
      id: 'bot-2',
      name: 'Ando (The Desperate)',
      isHuman: false,
      stars: 0,
      cards: { [CardType.ROCK]: 0, [CardType.PAPER]: 0, [CardType.SCISSORS]: 0 },
      status: 'ELIMINATED',
      botStrategy: 'RANDOM',
    },
  ];

  it('renders bot roster and handles challenge action', () => {
    // Arrange
    const onChallenge = vi.fn();
    render(
      <LobbyGrid
        bots={bots}
        isLobbyPhase={true}
        activeOpponentId={null}
        onChallengeBot={onChallenge}
      />
    );

    // Assert
    expect(screen.getByText('Funai (The Trickster)')).toBeInTheDocument();
    expect(screen.getByText('Ando (The Desperate)')).toBeInTheDocument();
    expect(screen.getByTestId('challenge-btn-bot-2')).toBeDisabled(); // Eliminated

    // Act
    fireEvent.click(screen.getByTestId('challenge-btn-bot-1'));

    // Assert
    expect(onChallenge).toHaveBeenCalledWith('bot-1');
  });
});
