# zawa-zawa-rps
Juego de "Piedra, Papel o Tijera Restringido" inspirado en el juego del barco Espoir del anime Kaiji.

La versión preliminar **0.1.0 (alfa)** está terminada dentro del alcance de duelos locales contra bots. El [estado de la versión](docs/STATUS.md) recoge las verificaciones realizadas y los pendientes para próximas iteraciones.

## Reglas de esta versión preliminar

- Cada participante empieza con 12 cartas (4 de cada tipo) y 3 estrellas.
- El ganador de un duelo recibe una estrella del perdedor. En empate no se transfieren estrellas. Siempre se queman ambas cartas.
- Para clasificar hay que quedarse sin cartas y conservar al menos 3 estrellas.
- Llegar a 0 estrellas, o terminar sin cartas con menos de 3 estrellas, elimina al participante.
- Si no quedan rivales activos y el humano aún tiene cartas, la partida termina sin clasificación. Este cierre tiene un motivo propio; no significa que el humano haya perdido sus cartas o estrellas.
- Los bots solo juegan cuando los retas. El comercio queda fuera de esta versión.
- Las partidas no se guardan: recargar, reiniciar o cambiar el número de bots inicia una nueva partida.

La ayuda «How to play» también está disponible dentro de la app.

## Desarrollo y verificación

```bash
npm ci
npm run dev
```

Se recomienda Node.js 22, la versión utilizada por CI y el despliegue. La interfaz permite elegir 1, 3, 5 o 7 oponentes; el motor admite de 1 a 7.

Antes de publicar:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

El chequeo de tipos revisa tanto `tsconfig.app.json` como `tsconfig.node.json`. CI y el flujo de despliegue ejecutan los controles antes de publicar en GitHub Pages.

Los cambios se integran mediante PR hacia `main`, con el control obligatorio `build` aprobado. Al fusionar se ejecuta el despliegue. `AGENTS.md` contiene las reglas operativas del repositorio; el PRD conserva el planteamiento inicial y sus ajustes de alcance.
