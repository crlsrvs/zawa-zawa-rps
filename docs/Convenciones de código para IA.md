
## Definidas

Notas de referencia. [AGENTS.md](../AGENTS.md) contiene las convenciones obligatorias; [STATUS.md](STATUS.md) describe el estado real de la alfa.

- Conventional Commits
	- https://www.conventionalcommits.org/en/v1.0.0/

- Semver
	- https://semver.org/lang/es/

- GitHub flow
	- https://docs.github.com/en/get-started/using-github/github-flow

- Changelog
	- https://keepachangelog.com/es-ES/1.0.0/

- EditorConfig
	- Buscar el mejor https://github.com/editorconfig/editorconfig/wiki/Projects-Using-EditorConfig

- Naming Conventions:
	- **camelCase:** Variables, funciones y métodos (`getUserProfile`).
    
	- **PascalCase:** Clases, interfaces, componentes (React/Vue/Angular) y tipos (`UserProfileCard`).
	    
	- **snake_case:** Columnas de base de datos o claves de API (`user_profile_id`).
			    
	- **SCREAMING_SNAKE_CASE:** Constantes globales y variables de entorno (`MAX_RETRY_COUNT`).

- Archivos de documentación de referencia (solo `README.md` existe actualmente entre los siguientes; los demás son propuestas para futuras necesidades):
	- `README.md`: Setup inicial, arquitectura básica y comandos principales.
	    
	- `CONTRIBUTING.md`: Guías para enviar PRs, ejecutar tests y seguir las convenciones.
	    
	- `ARCHITECTURE.md` : Diagramas o explicaciones del diseño del sistema.
	    
	- `SECURITY.md`: Protocolo para reporte responsable de vulnerabilidades.

- Usar en el código JSDoc / TSDoc exclusivamente para documentar intención de negocio o efectos secundarios.

- **Nomenclatura de Archivos de Test:** Usar sufijos consistentes como `.spec.ts` o `.test.js` colocados junto al código que prueban (_co-location_) en lugar de carpetas separadas lejanas.








