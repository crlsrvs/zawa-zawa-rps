# Estado de Zawa Zawa RPS

Actualizado: 4 de noviembre de 2026.

## Versión preliminar 0.1.0 (alfa)

Terminada para compartir y recoger comentarios dentro del alcance de juego local de un humano contra bots. Las correcciones funcionales se integraron en `main` mediante el [PR #3](https://github.com/crlsrvs/zawa-zawa-rps/pull/3).

### Funcionalidad incluida

- Ciclo de selección, confirmación, revelación, resolución y fin de partida mediante FSM.
- Inventario inicial de 12 cartas y 3 estrellas por participante, transferencia de estrellas y descarte permanente de ambas cartas, también en empates.
- Tres estrategias de bots, marcador global y estados de participantes.
- Cuatro motivos de cierre: clasificación, pérdida de estrellas, cartas agotadas con estrellas insuficientes y falta de rivales con cartas pendientes.
- Reinicio, ayuda breve dentro del juego y modales con desplazamiento en pantallas pequeñas.

### Verificación de cierre

- `npm run typecheck`: revisa las configuraciones de la app y Node.
- `npm run lint`: aprobado.
- `npm test`: 40 pruebas aprobadas en 7 archivos. Incluyen los cuatro finales, el reinicio y la conservación de cartas en empates.
- `npm run build`: aprobado.
- Revisión en navegador del duelo a 360 × 640 y en escritorio; se comprobó que el botón de continuar fuera accesible al desplazar el modal y que un empate descartara dos cartas.
- El commit de integración `95a8c29` obtuvo [CI aprobado](https://github.com/crlsrvs/zawa-zawa-rps/actions/runs/41846034954) y [despliegue aprobado](https://github.com/crlsrvs/zawa-zawa-rps/actions/runs/41846034864).

### Límites y siguientes iteraciones

- Sin comercio, guardado de partidas, cuentas o multijugador. Los bots juegan cuando el humano los reta.
- La interfaz ofrece 1, 3, 5 o 7 oponentes. Cambiar esa selección, reiniciar o recargar empieza una nueva partida.
- Pendientes de pulido: gestión completa del foco y teclado en los modales, prevención de reinicios accidentales y evaluación del equilibrio con jugadores.
- La revisión visual fue puntual; queda ampliar las comprobaciones de accesibilidad y compatibilidad entre navegadores.

Los pendientes anteriores quedan fuera del cierre de esta alfa. Para cada cambio posterior, seguir la verificación y el flujo de PR definidos en [AGENTS.md](../AGENTS.md).
