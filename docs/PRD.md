# Zawa Zawa RPS - Project Prompt

Crea una aplicación web interactiva en React + TypeScript estructurada con Vite, llamada "Zawa Zawa RPS" (Piedra, Papel o Tijera Restringido), inspirada en el juego del barco Espoir del anime Kaiji.

### 1. Stack, Restricciones y Estilos
- Stack: React 19, TypeScript (modo strict) y Vite.
- Estilos: CSS Modules nativo (`.module.css`) aplicando convención BEM para nomenclatura de clases.
  - Prohibido instalar Tailwind CSS, Sass o librerías de UI de terceros. Solo CSS nativo moderno.
- Estética: Dark Industrial Kaiji. Paleta: fondos gris asfalto/negro, acento rojo alarma, dorado para estrellas y amarillo/verde neón para el marcador digital.
- Alcance: Partida local (1 jugador humano vs 1 a 7 bots configurables).

### 2. Arquitectura de Estado (MANDATORIO: Finite State Machine)
Prohibido el uso de múltiples booleanos sueltos (`isDueling`, `isTrading`, etc.). La lógica debe estructurarse mediante una Máquina de Estados Finitos (FSM) usando `useReducer` en `src/hooks/useGameEngine.ts`:
- Fases explícitas:
  `LOBBY` ➔ `DUEL_SELECTION` ➔ `DUEL_REVEAL` ➔ `ROUND_RESOLVE` ➔ `GAME_OVER`
- Parámetros por participante:
  - 12 cartas iniciales: 4 Piedra, 4 Papel, 4 Tijera.
  - 3 estrellas iniciales.
- Condiciones de fin de partida (Reglas Espoir):
  - Calificado (Victoria): 0 cartas en mano Y al menos 3 estrellas.
  - Eliminado (Derrota): 0 estrellas en cualquier momento, o 0 cartas con menos de 3 estrellas.

### 3. Mecánicas Centrales del Juego
1. Marcador Global LED (`Scoreboard`):
   - Muestra en tiempo real la cantidad total acumulada de cartas de Piedra, Papel y Tijera que quedan en manos de todos los jugadores activos.
   - Conteo de cartas descartadas permanentemente.
2. Sistema de Duelos (`DuelModal`):
   - El jugador selecciona a un bot del `LobbyGrid` para retarlo.
   - Fase oculta: Ambos eligen carta en secreto.
   - Revelación:
     * Ganador roba 1 estrella al perdedor. Empate: estrellas intactas.
     * Ambas cartas se eliminan permanentemente de las manos y se suman al descarte global.
3. IA de Bots (en `src/logic/botStrategy.ts`):
   - `RandomBot`: Elige al azar entre sus cartas disponibles.
   - `StrategicBot`: Consulta el marcador global y juega la carta que vence a la más abundante del mercado.
   - `HoarderBot`: Intenta acumular un único tipo de carta para manipular las probabilidades del tablero.

### 4. Estructura de Componentes
- `Scoreboard.tsx`: Marcador global de cartas restantes y estrellas en juego.
- `PlayerHand.tsx`: Mano del jugador, selección de carta activa y contador de estrellas.
- `LobbyGrid.tsx`: Grilla de bots con estrellas visibles, cartas restantes ocultas y estado (Activo / Calificado / Eliminado).
- `DuelModal.tsx`: Mesa de enfrentamiento con cartas boca abajo, animación de revelación y feedback del resultado.

### 5. Plan de Ejecución
Procede de forma modular:
1. Define los tipos de dominio en `src/types/game.ts` y la FSM en `src/hooks/useGameEngine.ts`.
2. Implementa las estrategias de bots en `src/logic/botStrategy.ts`.
3. Construye los componentes con sus respectivos `.module.css`.
4. Entrega el juego 100% funcional y testeable con `npm run dev`.
*(Nota: La fase de comercio/mercado se implementará en una segunda iteración una vez consolidado el loop de duelos).*
