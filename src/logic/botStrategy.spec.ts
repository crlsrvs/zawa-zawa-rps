import { describe, it, expect } from 'vitest';
import { CardType, type CardInventory, type Participant } from '../types/game';
import {
  resolveDuel,
  chooseRandomCard,
  chooseStrategicCard,
  chooseHoarderCard,
  selectBotCard,
  calculateRemainingCirculation,
  getWinningCounter,
  getLosingCounter,
} from './botStrategy';

describe('resolveDuel', () => {
  it('transfers one star from loser to winner on non-tie', () => {
    // Arrange
    const playerCard = CardType.ROCK;
    const botCard = CardType.SCISSORS;
    const initialStars = { player: 3, bot: 3 };

    // Act
    const result = resolveDuel(playerCard, botCard, initialStars);

    // Assert
    expect(result.winner).toBe('player');
    expect(result.stars.player).toBe(4);
    expect(result.stars.bot).toBe(2);
    expect(result.outcome).toBe('PLAYER_WIN');
    expect(result.starsExchanged).toBe(1);
  });

  it('transfers star to bot when bot wins', () => {
    // Arrange
    const playerCard = CardType.SCISSORS;
    const botCard = CardType.ROCK;
    const initialStars = { player: 3, bot: 3 };

    // Act
    const result = resolveDuel(playerCard, botCard, initialStars);

    // Assert
    expect(result.winner).toBe('bot');
    expect(result.stars.player).toBe(2);
    expect(result.stars.bot).toBe(4);
    expect(result.outcome).toBe('BOT_WIN');
  });

  it('leaves stars unchanged on tie', () => {
    // Arrange
    const playerCard = CardType.PAPER;
    const botCard = CardType.PAPER;
    const initialStars = { player: 3, bot: 3 };

    // Act
    const result = resolveDuel(playerCard, botCard, initialStars);

    // Assert
    expect(result.winner).toBe('tie');
    expect(result.stars.player).toBe(3);
    expect(result.stars.bot).toBe(3);
    expect(result.outcome).toBe('TIE');
    expect(result.starsExchanged).toBe(0);
  });
});

describe('getWinningCounter and getLosingCounter', () => {
  it('returns appropriate counter cards', () => {
    // Arrange & Act & Assert
    expect(getWinningCounter(CardType.ROCK)).toBe(CardType.PAPER);
    expect(getWinningCounter(CardType.PAPER)).toBe(CardType.SCISSORS);
    expect(getWinningCounter(CardType.SCISSORS)).toBe(CardType.ROCK);

    expect(getLosingCounter(CardType.ROCK)).toBe(CardType.SCISSORS);
    expect(getLosingCounter(CardType.PAPER)).toBe(CardType.ROCK);
    expect(getLosingCounter(CardType.SCISSORS)).toBe(CardType.PAPER);
  });
});

describe('RandomBot', () => {
  it('picks a card available in hand', () => {
    // Arrange
    const cards: CardInventory = {
      [CardType.ROCK]: 2,
      [CardType.PAPER]: 0,
      [CardType.SCISSORS]: 0,
    };

    // Act
    const choice = chooseRandomCard(cards);

    // Assert
    expect(choice).toBe(CardType.ROCK);
  });

  it('returns null when hand is empty', () => {
    // Arrange
    const cards: CardInventory = {
      [CardType.ROCK]: 0,
      [CardType.PAPER]: 0,
      [CardType.SCISSORS]: 0,
    };

    // Act
    const choice = chooseRandomCard(cards);

    // Assert
    expect(choice).toBeNull();
  });
});

describe('StrategicBot', () => {
  it('picks the counter to the most abundant card in circulation', () => {
    // Arrange
    const cards: CardInventory = {
      [CardType.ROCK]: 2,
      [CardType.PAPER]: 2,
      [CardType.SCISSORS]: 2,
    };
    // Rock is dominant in market (10 vs 2 vs 2) -> counter is PAPER
    const circulation = {
      [CardType.ROCK]: 10,
      [CardType.PAPER]: 2,
      [CardType.SCISSORS]: 2,
    };

    // Act
    const choice = chooseStrategicCard(cards, circulation);

    // Assert
    expect(choice).toBe(CardType.PAPER);
  });

  it('falls back to available counter if first choice is not in hand', () => {
    // Arrange: Rock is dominant, but bot has 0 Paper
    const cards: CardInventory = {
      [CardType.ROCK]: 1,
      [CardType.PAPER]: 0,
      [CardType.SCISSORS]: 2,
    };
    const circulation = {
      [CardType.ROCK]: 10,
      [CardType.PAPER]: 5,
      [CardType.SCISSORS]: 1,
    };

    // Act
    const choice = chooseStrategicCard(cards, circulation);

    // Assert (counter to second dominant PAPER is SCISSORS, which bot has)
    expect(choice).toBe(CardType.SCISSORS);
  });
});

describe('HoarderBot', () => {
  it('retains dominant card and burns non-target cards', () => {
    // Arrange: Bot hoards ROCK (has 4 Rocks, 1 Paper, 0 Scissors)
    const cards: CardInventory = {
      [CardType.ROCK]: 4,
      [CardType.PAPER]: 1,
      [CardType.SCISSORS]: 0,
    };

    // Act
    const choice = chooseHoarderCard(cards);

    // Assert
    expect(choice).toBe(CardType.PAPER);
  });

  it('plays hoard target only when no other cards remain', () => {
    // Arrange: Bot only has ROCK left
    const cards: CardInventory = {
      [CardType.ROCK]: 3,
      [CardType.PAPER]: 0,
      [CardType.SCISSORS]: 0,
    };

    // Act
    const choice = chooseHoarderCard(cards);

    // Assert
    expect(choice).toBe(CardType.ROCK);
  });
});

describe('selectBotCard & calculateRemainingCirculation', () => {
  it('calculates active player circulation and delegates to correct strategy', () => {
    // Arrange
    const participants: Record<string, Participant> = {
      p1: {
        id: 'p1',
        name: 'Player',
        isHuman: true,
        stars: 3,
        cards: { ROCK: 4, PAPER: 4, SCISSORS: 4 },
        status: 'ACTIVE',
      },
      b1: {
        id: 'b1',
        name: 'Tonegawa Bot',
        isHuman: false,
        stars: 3,
        cards: { ROCK: 2, PAPER: 0, SCISSORS: 0 },
        status: 'ACTIVE',
        botStrategy: 'HOARDER',
      },
      b2: {
        id: 'b2',
        name: 'Eliminated Bot',
        isHuman: false,
        stars: 0,
        cards: { ROCK: 10, PAPER: 10, SCISSORS: 10 },
        status: 'ELIMINATED',
      },
    };

    // Act
    const circulation = calculateRemainingCirculation(participants);
    const botChoice = selectBotCard(participants.b1!, circulation);

    // Assert
    expect(circulation.ROCK).toBe(6); // 4 + 2, b2 ignored
    expect(circulation.PAPER).toBe(4);
    expect(circulation.SCISSORS).toBe(4);
    expect(botChoice).toBe(CardType.ROCK);
  });
});
