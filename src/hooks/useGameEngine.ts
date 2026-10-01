import { useReducer, useMemo } from 'react';
import {
  CardType,
  INITIAL_STARS_PER_PLAYER,
  INITIAL_CARDS_PER_TYPE,
  DEFAULT_BOT_COUNT,
  MIN_BOTS,
  MAX_BOTS,
  type GameState,
  type GameAction,
  type Participant,
  type CardInventory,
  type DiscardPool,
  type BotStrategyType,
  type ParticipantStatus,
} from '../types/game';
import {
  calculateRemainingCirculation,
  selectBotCard,
  resolveDuel,
} from '../logic/botStrategy';

export const BOT_PROFILES: ReadonlyArray<{ name: string; strategy: BotStrategyType }> = [
  { name: 'Funai (The Trickster)', strategy: 'HOARDER' },
  { name: 'Ando (The Desperate)', strategy: 'RANDOM' },
  { name: 'Kitami (The Cartel)', strategy: 'STRATEGIC' },
  { name: 'Ishida (The Debtor)', strategy: 'RANDOM' },
  { name: 'Tonegawa (The Executive)', strategy: 'STRATEGIC' },
  { name: 'Oki (The Survivor)', strategy: 'HOARDER' },
  { name: 'Hyodo (The Chairman)', strategy: 'STRATEGIC' },
];

/**
 * Creates standard initial card inventory (4 Rock, 4 Paper, 4 Scissors).
 */
export function createInitialInventory(): CardInventory {
  return {
    [CardType.ROCK]: INITIAL_CARDS_PER_TYPE,
    [CardType.PAPER]: INITIAL_CARDS_PER_TYPE,
    [CardType.SCISSORS]: INITIAL_CARDS_PER_TYPE,
  };
}

/**
 * Evaluates participant status according to Kaiji Espoir rules:
 * - QUALIFIED: 0 cards remaining AND at least 3 stars.
 * - ELIMINATED: 0 stars at any moment OR (0 cards remaining AND fewer than 3 stars).
 * - ACTIVE: has remaining cards and at least 1 star.
 */
export function evaluateParticipantStatus(
  cards: CardInventory,
  stars: number
): ParticipantStatus {
  const totalCards = cards[CardType.ROCK] + cards[CardType.PAPER] + cards[CardType.SCISSORS];

  if (stars <= 0) {
    return 'ELIMINATED';
  }

  if (totalCards === 0) {
    return stars >= INITIAL_STARS_PER_PLAYER ? 'QUALIFIED' : 'ELIMINATED';
  }

  return 'ACTIVE';
}

/**
 * Initializes a fresh game state.
 */
export function createInitialGameState(botCount: number = DEFAULT_BOT_COUNT): GameState {
  const clampedBots = Math.min(MAX_BOTS, Math.max(MIN_BOTS, botCount));
  const humanPlayerId = 'human-player';

  const humanPlayer: Participant = {
    id: humanPlayerId,
    name: 'Kaiji Itou (You)',
    isHuman: true,
    stars: INITIAL_STARS_PER_PLAYER,
    cards: createInitialInventory(),
    status: 'ACTIVE',
  };

  const participants: Record<string, Participant> = {
    [humanPlayerId]: humanPlayer,
  };
  const participantOrder: string[] = [humanPlayerId];

  for (let i = 0; i < clampedBots; i++) {
    const profile = BOT_PROFILES[i % BOT_PROFILES.length]!;
    const botId = `bot-${i + 1}`;
    participants[botId] = {
      id: botId,
      name: profile.name,
      isHuman: false,
      stars: INITIAL_STARS_PER_PLAYER,
      cards: createInitialInventory(),
      status: 'ACTIVE',
      botStrategy: profile.strategy,
    };
    participantOrder.push(botId);
  }

  const discardPool: DiscardPool = {
    [CardType.ROCK]: 0,
    [CardType.PAPER]: 0,
    [CardType.SCISSORS]: 0,
  };

  return {
    phase: 'LOBBY',
    humanPlayerId,
    participants,
    participantOrder,
    discardPool,
    activeDuel: null,
    roundCount: 1,
  };
}

/**
 * Pure reducer driving the Game Finite State Machine (FSM).
 * Strictly transitions between phases:
 * [LOBBY] -> [DUEL_SELECTION] -> [DUEL_REVEAL] -> [ROUND_RESOLVE] -> [GAME_OVER]
 */
export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'INIT_GAME': {
      return createInitialGameState(action.payload?.botCount ?? DEFAULT_BOT_COUNT);
    }

    case 'SELECT_OPPONENT': {
      if (state.phase !== 'LOBBY') return state;

      const opponent = state.participants[action.payload.opponentId];
      if (!opponent || opponent.isHuman || opponent.status !== 'ACTIVE') {
        return state;
      }

      return {
        ...state,
        phase: 'DUEL_SELECTION',
        activeDuel: {
          opponentId: opponent.id,
          playerCard: null,
          opponentCard: null,
          outcome: null,
          starsExchanged: 0,
        },
      };
    }

    case 'CANCEL_DUEL': {
      if (state.phase !== 'DUEL_SELECTION') return state;
      return {
        ...state,
        phase: 'LOBBY',
        activeDuel: null,
      };
    }

    case 'SELECT_PLAYER_CARD': {
      if (state.phase !== 'DUEL_SELECTION' || !state.activeDuel) return state;

      const human = state.participants[state.humanPlayerId];
      if (!human || human.cards[action.payload.card] <= 0) {
        return state;
      }

      return {
        ...state,
        activeDuel: {
          ...state.activeDuel,
          playerCard: action.payload.card,
        },
      };
    }

    case 'CONFIRM_DUEL_SELECTION': {
      if (
        state.phase !== 'DUEL_SELECTION' ||
        !state.activeDuel ||
        !state.activeDuel.playerCard
      ) {
        return state;
      }

      const opponent = state.participants[state.activeDuel.opponentId];
      if (!opponent) return state;

      const circulation = calculateRemainingCirculation(state.participants);
      const botCard = selectBotCard(opponent, circulation);

      if (!botCard) {
        // Fallback: If bot somehow has no cards, abort to lobby
        return {
          ...state,
          phase: 'LOBBY',
          activeDuel: null,
        };
      }

      return {
        ...state,
        phase: 'DUEL_REVEAL',
        activeDuel: {
          ...state.activeDuel,
          opponentCard: botCard,
        },
      };
    }

    case 'REVEAL_DUEL': {
      if (
        state.phase !== 'DUEL_REVEAL' ||
        !state.activeDuel ||
        !state.activeDuel.playerCard ||
        !state.activeDuel.opponentCard
      ) {
        return state;
      }

      const human = state.participants[state.humanPlayerId];
      const opponent = state.participants[state.activeDuel.opponentId];
      if (!human || !opponent) return state;

      const playerCard = state.activeDuel.playerCard;
      const botCard = state.activeDuel.opponentCard;

      const duelResult = resolveDuel(playerCard, botCard, {
        player: human.stars,
        bot: opponent.stars,
      });

      // Burn cards: decrement from hands, add to discard pool
      const updatedHumanCards: CardInventory = {
        ...human.cards,
        [playerCard]: Math.max(0, human.cards[playerCard] - 1),
      };

      const updatedBotCards: CardInventory = {
        ...opponent.cards,
        [botCard]: Math.max(0, opponent.cards[botCard] - 1),
      };

      const updatedDiscardPool: DiscardPool = {
        ...state.discardPool,
        [playerCard]: state.discardPool[playerCard] + 1,
        [botCard]: state.discardPool[botCard] + 1,
      };

      const updatedHuman: Participant = {
        ...human,
        stars: duelResult.stars.player,
        cards: updatedHumanCards,
        status: evaluateParticipantStatus(updatedHumanCards, duelResult.stars.player),
      };

      const updatedBot: Participant = {
        ...opponent,
        stars: duelResult.stars.bot,
        cards: updatedBotCards,
        status: evaluateParticipantStatus(updatedBotCards, duelResult.stars.bot),
      };

      const updatedParticipants: Record<string, Participant> = {
        ...state.participants,
        [human.id]: updatedHuman,
        [opponent.id]: updatedBot,
      };

      return {
        ...state,
        phase: 'ROUND_RESOLVE',
        participants: updatedParticipants,
        discardPool: updatedDiscardPool,
        activeDuel: {
          ...state.activeDuel,
          outcome: duelResult.outcome,
          starsExchanged: duelResult.starsExchanged,
        },
      };
    }

    case 'RESOLVE_ROUND': {
      if (state.phase !== 'ROUND_RESOLVE') return state;

      const human = state.participants[state.humanPlayerId];
      if (!human) return state;

      // Check if human player is already done (QUALIFIED or ELIMINATED)
      const isHumanFinished = human.status === 'QUALIFIED' || human.status === 'ELIMINATED';

      // Check if any active bots remain with both cards and stars
      const activeBotsCount = Object.values(state.participants).filter(
        (p) => !p.isHuman && p.status === 'ACTIVE'
      ).length;

      const shouldEndGame = isHumanFinished || activeBotsCount === 0;

      return {
        ...state,
        phase: shouldEndGame ? 'GAME_OVER' : 'LOBBY',
        activeDuel: null,
        roundCount: state.roundCount + 1,
      };
    }

    case 'RESTART_GAME': {
      const currentBotCount = state.participantOrder.length - 1;
      return createInitialGameState(currentBotCount);
    }

    default:
      return state;
  }
}

/**
 * Custom hook encapsulating the Zawa Zawa RPS Game Engine.
 */
export function useGameEngine(initialBotCount: number = DEFAULT_BOT_COUNT) {
  const [state, dispatch] = useReducer(
    gameReducer,
    initialBotCount,
    createInitialGameState
  );

  const humanPlayer = state.participants[state.humanPlayerId]!;

  const activeOpponent = useMemo(() => {
    if (!state.activeDuel) return null;
    return state.participants[state.activeDuel.opponentId] ?? null;
  }, [state.activeDuel, state.participants]);

  const circulation = useMemo(() => {
    return calculateRemainingCirculation(state.participants);
  }, [state.participants]);

  const activeBots = useMemo(() => {
    return Object.values(state.participants).filter(
      (p) => !p.isHuman && p.status === 'ACTIVE'
    );
  }, [state.participants]);

  const botList = useMemo(() => {
    return state.participantOrder
      .filter((id) => id !== state.humanPlayerId)
      .map((id) => state.participants[id]!);
  }, [state.participantOrder, state.participants, state.humanPlayerId]);

  const totalActiveStars = useMemo(() => {
    return Object.values(state.participants).reduce((sum, p) => sum + p.stars, 0);
  }, [state.participants]);

  const totalRemainingCards = useMemo(() => {
    return circulation.ROCK + circulation.PAPER + circulation.SCISSORS;
  }, [circulation]);

  const totalBurnedCards = useMemo(() => {
    return (
      state.discardPool.ROCK +
      state.discardPool.PAPER +
      state.discardPool.SCISSORS
    );
  }, [state.discardPool]);

  return {
    state,
    humanPlayer,
    activeOpponent,
    botList,
    activeBots,
    circulation,
    totalActiveStars,
    totalRemainingCards,
    totalBurnedCards,
    // Action creators
    initGame: (botCount?: number) => dispatch({ type: 'INIT_GAME', payload: { botCount } }),
    selectOpponent: (opponentId: string) =>
      dispatch({ type: 'SELECT_OPPONENT', payload: { opponentId } }),
    selectPlayerCard: (card: CardType) =>
      dispatch({ type: 'SELECT_PLAYER_CARD', payload: { card } }),
    cancelDuel: () => dispatch({ type: 'CANCEL_DUEL' }),
    confirmDuelSelection: () => dispatch({ type: 'CONFIRM_DUEL_SELECTION' }),
    revealDuel: () => dispatch({ type: 'REVEAL_DUEL' }),
    resolveRound: () => dispatch({ type: 'RESOLVE_ROUND' }),
    restartGame: () => dispatch({ type: 'RESTART_GAME' }),
  };
}
