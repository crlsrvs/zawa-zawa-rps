import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { App } from './App';

describe('App Integration', () => {
  it('renders application and allows full duel interaction loop', () => {
    // Arrange & Act
    render(<App />);

    // Assert: Main elements render
    expect(screen.getByRole('heading', { level: 1, name: /Zawa Zawa RPS/i })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /Espoir Central Scoreboard/i })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /Player Hand and Assets/i })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /Espoir Bot Roster/i })).toBeInTheDocument();

    // Act 1: Challenge first bot
    const challengeButtons = screen.getAllByRole('button', { name: /Challenge/i });
    expect(challengeButtons.length).toBeGreaterThan(0);
    fireEvent.click(challengeButtons[0]!);

    // Assert 1: Duel Modal opens in selection phase
    expect(screen.getByRole('dialog', { name: /Duel Arena/i })).toBeInTheDocument();
    const confirmBtn = screen.getByTestId('confirm-duel-btn');
    expect(confirmBtn).toBeDisabled();

    // Act 2: Select a card from player hand
    const rockBtn = screen.getByTestId('player-card-rock');
    fireEvent.click(rockBtn);

    // Assert 2: Confirm button is now enabled
    expect(confirmBtn).not.toBeDisabled();

    // Act 3: Confirm selection
    fireEvent.click(confirmBtn);

    // Assert 3: Reveal button appears
    const openBtn = screen.getByTestId('open-cards-btn');
    expect(openBtn).toBeInTheDocument();

    // Act 4: Reveal duel
    fireEvent.click(openBtn);

    // Assert 4: Outcome banner is displayed
    expect(screen.getByTestId('outcome-banner')).toBeInTheDocument();
    const continueBtn = screen.getByTestId('continue-btn');
    expect(continueBtn).toBeInTheDocument();

    // Act 5: Proceed to next round
    fireEvent.click(continueBtn);

    // Assert 5: Modal closed, back to lobby
    expect(screen.queryByRole('dialog', { name: /Duel Arena/i })).not.toBeInTheDocument();
  });
});
