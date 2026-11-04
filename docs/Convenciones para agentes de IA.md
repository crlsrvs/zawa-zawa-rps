
Estas notas complementan [AGENTS.md](../AGENTS.md), la única autoridad operativa del proyecto. Los ejemplos de ADRs o contratos de API son opciones para futuras necesidades, no componentes ya implementados ni requisitos adicionales de la alfa.

A continuación, las convenciones más críticas para maximizar el rendimiento de un agente de IA:

## 1. Contexto y reglas en `AGENTS.md`

El archivo raíz `AGENTS.md` define las restricciones, la arquitectura, las convenciones y los comandos de verificación.

- **¿Qué incluir?** Comandos de tests y linter, reglas de estilo y patrones prohibidos. En este proyecto se usan TypeScript estricto y CSS Modules nativo con BEM; no se permite Tailwind ni bibliotecas de componentes de UI.
    
- **Fuente única:** mantener las reglas operativas en `AGENTS.md`, sin crear archivos o directorios de reglas específicos de un proveedor.
        

## 2. ADRs (Architectural Decision Records)

Los agentes son excelentes ejecutando tareas, pero no conocen el contexto histórico de por qué elegiste una tecnología sobre otra.

- **Por qué es clave:** Cuando le pides a una IA _"agrega autenticación"_, su tendencia por defecto es instalar la librería más popular del momento. Si tienes un ADR en `docs/adr/003-auth0.md`, la IA puede leerlo para alinearse con las decisiones de arquitectura previamente acordadas sin reescribir la lógica con tecnologías incompatibles.
    

## 3. OpenAPI / Schemas Fuertemente Tipados (TypeScript, Pydantic, Zod)

Los agentes funcionan exponencialmente mejor cuando el código tiene **contratos explícitos**.

- **Tipado estricto:** TypeScript o Type Hints en Python actúan como rieles para la IA. Si la IA genera un error de tipo, el propio linter le da feedback inmediato para auto-corregirse.
    
- **OpenAPI Specs:** Si la IA necesita consumir un backend o crear una integración, entregarle la especificación OpenAPI evita que adivine la estructura de las peticiones HTTP y las respuestas.
    

## 4. Estructura Feature-First y Co-location

Agrupar el código por funcionalidad en lugar de por capas técnicas ayuda enormemente a la **ventana de contexto** del agente.

- **Por qué ayuda:** Si una carpeta `/modules/users/` contiene la vista, el servicio, el modelo y las pruebas (`user.spec.ts`), el agente solo necesita analizar esa carpeta para resolver un bug o crear una feature, reduciendo el consumo de tokens y evitando que pierda el foco navegando entre archivos dispersos.
    

## 5. Pruebas Unitarias con Patrón AAA (Arrange-Act-Assert)

Los agentes modernos trabajan en bucles de retroalimentación: **escriben código -> corren tests -> corrigen**.

- **Tests legibles:** Si los tests siguen el patrón AAA y los archivos están co-localizados (`.spec.ts` junto al componente), el agente puede ejecutar la suite de pruebas localmente para verificar si su propuesta funciona antes de entregar la respuesta.

## 6. Loop de feedback determinista

Para validar de forma autónoma antes de dar por terminada la tarea, `AGENTS.md` define la fase de verificación determinista.

Las siguientes pautas remiten a los comandos y al flujo de `AGENTS.md`:

### 1. Comandos Rápidos de Verificación (Verification Commands)

Documenta los comandos exactos y atómicos. Es útil separar el chequeo rápido (estático) de la suite de pruebas completa.

```bash
## Verification Commands

- **Typecheck:** `npm run typecheck` (revisa las configuraciones de app y Node)
- **Lint:** `npm run lint`
- **Unit Tests:** `npm test`
- **Single Test File:** `npx vitest run path/to/file.spec.ts`
```

### 2. Protocolo de Definición de Terminado (Definition of Done / Workflow)

Indícale explícitamente al agente **cuándo y cómo** debe ejecutar esos comandos. Si no se le exige ejecutar la validación antes de finalizar, ignorará los comandos aunque estén listados.

```markdown
## Agent Workflow Guidelines

1. **Implement:** Escribe el código necesario para resolver el problema.
2. **Verify:** Antes de marcar la tarea como completada, ejecuta los siguientes comandos en orden:
   - Run `npm run typecheck`
   - Run `npm run lint`
   - Run tests relevant to the modified files
3. **Auto-fix:** Si alguno de los comandos anteriores falla con un código de salida diferente de 0, analiza el output, corrige el problema y vuelve a ejecutar la verificación.
4. **Complete:** No entregues el código ni solicites revisión humana hasta que todos los comandos de verificación pasen limpiamente.
```
