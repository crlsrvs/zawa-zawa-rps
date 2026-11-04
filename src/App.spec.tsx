import { afterEach, describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { App } from './App';
import { CardType } from './types/game';
import * as botStrategy from './logic/botStrategy';

afterEach(() => vi.restoreAllMocks());

function playDuel(card: CardType, opponentName: string) {
  fireEvent.click(screen.getByRole('button', { name: `Challenge ${opponentName} to duel` }));
  fireEvent.click(screen.getByTestId(`modal-card-${card.toLowerCase()}`));
  fireEvent.click(screen.getByTestId('confirm-duel-btn'));
  fireEvent.click(screen.getByTestId('open-cards-btn'));
  fireEvent.click(screen.getByTestId('continue-btn'));
}

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
    const rockBtn = screen.getByTestId('modal-card-rock');
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

describe('Complete games', () => {
  const fullHand = [
    ...Array<CardType>(4).fill(CardType.ROCK),
    ...Array<CardType>(4).fill(CardType.PAPER),
    ...Array<CardType>(4).fill(CardType.SCISSORS),
  ];

  it.each([
    {
      name: 'qualifies after burning all cards with three stars',
      playerCards: fullHand,
      botCards: fullHand,
      alternateOpponents: false,
      title: 'SURVIVOR OF THE ESPOIR',
      description: /burned all 12 cards while securing 3 Stars/,
    },
    {
      name: 'loses immediately when stars reach zero',
      playerCards: [CardType.ROCK, CardType.ROCK, CardType.ROCK],
      botCards: [CardType.PAPER, CardType.PAPER, CardType.PAPER],
      alternateOpponents: false,
      title: 'CONSIGNED TO THE UNDERGROUND',
      description: /All stars were seized/,
    },
    {
      name: 'does not qualify after burning all cards with two stars',
      playerCards: fullHand,
      botCards: [CardType.PAPER, ...fullHand.slice(1)],
      alternateOpponents: true,
      title: 'CONSIGNED TO THE UNDERGROUND',
      description: /ran out of cards with fewer than 3 stars/,
    },
    {
      name: 'explains exhausting opponents while cards remain',
      playerCards: [CardType.ROCK, CardType.ROCK, CardType.ROCK],
      botCards: [CardType.SCISSORS, CardType.SCISSORS, CardType.SCISSORS],
      alternateOpponents: false,
      title: 'NO OPPONENTS REMAIN',
      description: /still hold 9 cards and 6 stars/,
    },
  ])('$name and supports restarting', ({ playerCards, botCards, alternateOpponents, title, description }) => {
    // Arrange
    const choices = [...botCards];
    vi.spyOn(botStrategy, 'selectBotCard').mockImplementation((bot) => {
      const card = choices.shift();
      if (!card || bot.cards[card] <= 0) throw new Error('Invalid test bot inventory');
      return card;
    });
    render(<App />);
    fireEvent.change(screen.getByLabelText('Configure AI debtors count'), { target: { value: '1' } });
    if (alternateOpponents) {
      fireEvent.change(screen.getByLabelText('Configure AI debtors count'), { target: { value: '3' } });
    }

    // Act
    playerCards.forEach((card, index) => {
      playDuel(card, alternateOpponents && index % 2 === 1 ? 'Ando (The Desperate)' : 'Funai (The Trickster)');
    });

    // Assert
    const ending = screen.getByRole('alertdialog', { name: title });
    expect(within(ending).getByText(description)).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: 'Duel Arena' })).not.toBeInTheDocument();
    expect(choices).toHaveLength(0);

    // Act
    fireEvent.click(within(ending).getByRole('button', { name: /Enter The Espoir Again/ }));

    // Assert
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(screen.getByLabelText('3 Stars')).toBeInTheDocument();
    expect(screen.getByText('Cards in Hand:', { exact: false })).toHaveTextContent('12');
    expect(screen.getByRole('button', { name: 'Challenge Funai (The Trickster) to duel' })).toBeEnabled();
  });

  it('offers the qualification and no-opponents rules in the brief help', () => {
    // Arrange
    render(<App />);

    // Act
    fireEvent.click(screen.getByText('How to play · Espoir rules'));

    // Assert
    expect(screen.getByText(/Qualify by burning all 12 cards/)).toBeVisible();
    expect(screen.getByText(/If no active opponents remain/)).toBeVisible();
    expect(screen.getByText(/Progress is not saved/)).toBeVisible();
  });
});
