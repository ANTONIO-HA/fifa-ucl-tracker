# 🏆 UCL FIFA 24 Tracker

Una aplicación web dinámica y moderna diseñada para gestionar y visualizar los resultados de las temporadas de FIFA 24 en modo "Champions League" entre amigos. Este proyecto permite llevar un control en tiempo real de la tabla de posiciones, estadísticas individuales y el historial detallado de encuentros.

# Desarrollado por: José Antonio Huerta Aguilar

# Colaboradores: Addi y Marcelo

## 🚀 Características

-   **Tabla de Posiciones Dinámica:** Cálculo automático de puntos (3 por victoria, 1 por empate), Diferencia de Goles (DG), Goles a Favor (GF) y Goles en Contra (GC).
-   **Registro de Partidos Inteligente:**
    -   Autocompletado con sugerencias visuales de todos los equipos de la UCL.
    -   Soporte para definición por penales con marcador independiente.
    -   Redirección automática tras guardar.
-   **Historial Visual:** Lista de encuentros recientes con escudos de los equipos y diseño de tarjetas modernas.
-   **Estadísticas Avanzadas:** -   Tabla de Goleo (Pichichi).
    -   Ranking de "Más Goles en Contra".
    -   Equipo más ganador y equipo con menos victorias (basado en efectividad).
-   **Gestión de Temporada:**
    -   Botón "Terminar Temporada" habilitado solo cuando los jugadores tienen partidos parejos.
    -   Resumen de campeón y goleador en un modal épico.
    -   Opción de "Nueva Temporada" para reiniciar la base de datos de Firebase.

## 🛠️ Tecnologías

-   **Frontend:** HTML5, CSS3 (Custom Styles), Bootstrap 5.
-   **Backend:** Firebase Firestore (Base de datos NoSQL en tiempo real).
-   **Lógica:** JavaScript Moderno (ES6 Modules).
-   **Hosting:** GitHub Pages.

## 📂 Estructura del Proyecto

```text
/
├── index.html          # Estructura principal y Modales
├── css/
│   └── styles.css      # Personalización visual (Dark Mode UCL)
├── js/
│   ├── config.js       # Credenciales de Firebase
│   ├── database.js     # Funciones CRUD (Guardar, Escuchar, Borrar)
│   ├── logic.js        # Cálculos de liga y estadísticas
│   └── ui.js           # Manejo del DOM y autocompletado
└── img/
    ├── icono/          # Favicon de la app
    └── equipos/        # Escudos de los equipos (PNG)

