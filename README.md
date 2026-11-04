# zawa-zawa-rps
Juego de "Piedra, Papel o Tijera Restringido" inspirado en el juego del barco Espoir del anime Kaiji.

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

Antes de publicar:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

El chequeo de tipos revisa tanto `tsconfig.app.json` como `tsconfig.node.json`. CI y el flujo de despliegue ejecutan los controles antes de publicar en GitHub Pages.
