import { CardType, type CardInventory, type Participant, type DuelOutcome } from '../types/game';

/**
 * Returns the winning counter to a given card.
 */
export function getWinningCounter(card: CardType): CardType {
  switch (card) {
    case CardType.ROCK:
      return CardType.PAPER;
    case CardType.PAPER:
      return CardType.SCISSORS;
    case CardType.SCISSORS:
      return CardType.ROCK;
  }
}

/**
 * Returns the losing counter to a given card.
 */
export function getLosingCounter(card: CardType): CardType {
  switch (card) {
    case CardType.ROCK:
      return CardType.SCISSORS;
    case CardType.PAPER:
      return CardType.ROCK;
    case CardType.SCISSORS:
      return CardType.PAPER;
  }
}

/**
 * Computes remaining cards in circulation across all active participants.
 */
export function calculateRemainingCirculation(
  participants: Record<string, Participant>
): Record<CardType, number> {
  const circulation: Record<CardType, number> = {
    [CardType.ROCK]: 0,
    [CardType.PAPER]: 0,
    [CardType.SCISSORS]: 0,
  };

  for (const participant of Object.values(participants)) {
    if (participant.status === 'ACTIVE') {
      circulation[CardType.ROCK] += participant.cards[CardType.ROCK];
      circulation[CardType.PAPER] += participant.cards[CardType.PAPER];
      circulation[CardType.SCISSORS] += participant.cards[CardType.SCISSORS];
    }
  }

  return circulation;
}

/**
 * Returns an array of available card types in the inventory (count > 0).
 */
export function getAvailableCardTypes(cards: CardInventory): CardType[] {
  const available: CardType[] = [];
  if (cards[CardType.ROCK] > 0) available.push(CardType.ROCK);
  if (cards[CardType.PAPER] > 0) available.push(CardType.PAPER);
  if (cards[CardType.SCISSORS] > 0) available.push(CardType.SCISSORS);
  return available;
}

/**
 * RandomBot Strategy: Uniformly picks a card at random from available inventory.
 */
export function chooseRandomCard(
  cards: CardInventory,
  randomFn: () => number = Math.random
): CardType | null {
  const available = getAvailableCardTypes(cards);
  if (available.length === 0) return null;
  const index = Math.floor(randomFn() * available.length);
  return available[index] ?? available[0] ?? null;
}

/**
 * StrategicBot Strategy: Inspects global remaining card circulation
 * and selects the counter to the most abundant remaining card.
 */
export function chooseStrategicCard(
  cards: CardInventory,
  circulation: Record<CardType, number>,
  randomFn: () => number = Math.random
): CardType | null {
  const available = getAvailableCardTypes(cards);
  if (available.length === 0) return null;

  // Sort card types by abundance in circulation descending
  const sortedByCirculation = ([CardType.ROCK, CardType.PAPER, CardType.SCISSORS] as const)
    .slice()
    .sort((a, b) => circulation[b] - circulation[a]);

  // Find the counter to the most abundant card
  for (const dominantCard of sortedByCirculation) {
    const counterCard = getWinningCounter(dominantCard);
    if (cards[counterCard] > 0) {
      return counterCard;
    }
  }

  // Fallback: pick any available card
  return chooseRandomCard(cards, randomFn);
}

/**
 * HoarderBot Strategy: Retains the card type it has the most of (its hoard target),
 * playing non-target cards first to manipulate market probabilities.
 */
export function chooseHoarderCard(
  cards: CardInventory,
  randomFn: () => number = Math.random
): CardType | null {
  const available = getAvailableCardTypes(cards);
  if (available.length === 0) return null;

  // Determine hoard target: the card type with maximum count
  let maxCount = -1;
  let hoardTarget: CardType = available[0]!;

  for (const cardType of [CardType.ROCK, CardType.PAPER, CardType.SCISSORS] as const) {
    if (cards[cardType] > maxCount) {
      maxCount = cards[cardType];
      hoardTarget = cardType;
    }
  }

  // Find non-target cards available to burn
  const nonTargetCards = available.filter((card) => card !== hoardTarget);
  if (nonTargetCards.length > 0) {
    const index = Math.floor(randomFn() * nonTargetCards.length);
    return nonTargetCards[index] ?? nonTargetCards[0] ?? null;
  }

  // If only hoard target is left, must play it
  return hoardTarget;
}

/**
 * Selects a card for an AI bot based on its designated strategy.
 */
export function selectBotCard(
  bot: Participant,
  circulation: Record<CardType, number>,
  randomFn: () => number = Math.random
): CardType | null {
  const strategy = bot.botStrategy ?? 'RANDOM';
  switch (strategy) {
    case 'STRATEGIC':
      return chooseStrategicCard(bot.cards, circulation, randomFn);
    case 'HOARDER':
      return chooseHoarderCard(bot.cards, randomFn);
    case 'RANDOM':
    default:
      return chooseRandomCard(bot.cards, randomFn);
  }
}

export interface DuelResolutionResult {
  readonly winner: 'player' | 'bot' | 'tie';
  readonly stars: { player: number; bot: number };
  readonly outcome: DuelOutcome;
  readonly starsExchanged: number;
}

/**
 * Resolves duel outcome between player card and bot card, calculating star exchange.
 * Rules:
 * - Winner takes 1 star from loser.
 * - Loser stars cannot drop below 0.
 * - On tie, stars remain intact.
 */
export function resolveDuel(
  playerCard: CardType,
  botCard: CardType,
  initialStars: { player: number; bot: number }
): DuelResolutionResult {
  if (playerCard === botCard) {
    return {
      winner: 'tie',
      stars: { player: initialStars.player, bot: initialStars.bot },
      outcome: 'TIE',
      starsExchanged: 0,
    };
  }

  const isPlayerWinner =
    (playerCard === CardType.ROCK && botCard === CardType.SCISSORS) ||
    (playerCard === CardType.PAPER && botCard === CardType.ROCK) ||
    (playerCard === CardType.SCISSORS && botCard === CardType.PAPER);

  if (isPlayerWinner) {
    const starTransfer = Math.min(1, Math.max(0, initialStars.bot));
    return {
      winner: 'player',
      stars: {
        player: initialStars.player + starTransfer,
        bot: Math.max(0, initialStars.bot - starTransfer),
      },
      outcome: 'PLAYER_WIN',
      starsExchanged: starTransfer,
    };
  } else {
    const starTransfer = Math.min(1, Math.max(0, initialStars.player));
    return {
      winner: 'bot',
      stars: {
        player: Math.max(0, initialStars.player - starTransfer),
        bot: initialStars.bot + starTransfer,
      },
      outcome: 'BOT_WIN',
      starsExchanged: starTransfer,
    };
  }
}
