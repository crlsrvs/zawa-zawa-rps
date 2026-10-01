/**
 * Domain types for Zawa Zawa RPS (Restricted Rock-Paper-Scissors).
 * Adheres to Kaiji Espoir gambling ship rules and AGENTS.md specifications.
 */

export const CardType = {
  ROCK: 'ROCK',
  PAPER: 'PAPER',
  SCISSORS: 'SCISSORS',
} as const;

export type CardType = (typeof CardType)[keyof typeof CardType];

export type BotStrategyType = 'RANDOM' | 'STRATEGIC' | 'HOARDER';

export type ParticipantStatus = 'ACTIVE' | 'QUALIFIED' | 'ELIMINATED';

export type CardInventory = Record<CardType, number>;

export interface Participant {
  readonly id: string;
  readonly name: string;
  readonly isHuman: boolean;
  readonly stars: number;
  readonly cards: CardInventory;
  readonly status: ParticipantStatus;
  readonly botStrategy?: BotStrategyType;
}

export type GamePhase =
  | 'LOBBY'
  | 'DUEL_SELECTION'
  | 'DUEL_REVEAL'
  | 'ROUND_RESOLVE'
  | 'GAME_OVER';

export type DuelOutcome = 'PLAYER_WIN' | 'BOT_WIN' | 'TIE';

export interface DuelState {
  readonly opponentId: string;
  readonly playerCard: CardType | null;
  readonly opponentCard: CardType | null;
  readonly outcome: DuelOutcome | null;
  readonly starsExchanged: number;
}

export interface DiscardPool {
  readonly [CardType.ROCK]: number;
  readonly [CardType.PAPER]: number;
  readonly [CardType.SCISSORS]: number;
}

export interface GameState {
  readonly phase: GamePhase;
  readonly humanPlayerId: string;
  readonly participants: Record<string, Participant>;
  readonly participantOrder: string[];
  readonly discardPool: DiscardPool;
  readonly activeDuel: DuelState | null;
  readonly roundCount: number;
}

export type GameAction =
  | { type: 'INIT_GAME'; payload?: { botCount?: number } }
  | { type: 'SELECT_OPPONENT'; payload: { opponentId: string } }
  | { type: 'SELECT_PLAYER_CARD'; payload: { card: CardType } }
  | { type: 'CONFIRM_DUEL_SELECTION' }
  | { type: 'REVEAL_DUEL' }
  | { type: 'RESOLVE_ROUND' }
  | { type: 'CANCEL_DUEL' }
  | { type: 'RESTART_GAME' };

export const INITIAL_STARS_PER_PLAYER = 3;
export const INITIAL_CARDS_PER_TYPE = 4; // 4 Rock, 4 Paper, 4 Scissors = 12 total
export const MIN_BOTS = 1;
export const MAX_BOTS = 7;
export const DEFAULT_BOT_COUNT = 5;
