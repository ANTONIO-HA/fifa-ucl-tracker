import { registrarPartido, escucharCambios, reiniciarTemporada } from './database.js';
import { calcularEstadisticas, obtenerGoleadores, obtenerGolesEnContra, obtenerEstadisticasEquipos } from './logic.js';

let estadisticasActuales = null;
let goleadoresActuales = null;

// ==========================================
// CONFIGURACIÓN DE EQUIPOS Y AUTOCOMPLETADO
// ==========================================
const equiposUCL = [
    // Grupo A
    "Bayern Munich", "Manchester United", "FC Copenhagen", "Galatasaray",
    // Grupo B
    "Sevilla", "Arsenal", "PSV", "Lens",
    // Grupo C
    "Napoli", "Real Madrid", "Braga", "Union Berlin",
    // Grupo D
    "Benfica", "Inter Milan", "Red Bull Salzburg", "Real Sociedad",
    // Grupo E
    "Feyenoord", "Atletico Madrid", "Lazio", "Celtic",
    // Grupo F
    "PSG", "Borussia Dortmund", "AC Milan", "Newcastle",
    // Grupo G
    "Manchester City", "RB Leipzig", "Estrella Roja", "Young Boys",
    // Grupo H
    "FC Barcelona", "Porto", "Shakhtar Donetsk", "Antwerp",
    // Otros Gigantes Comunes
    "Liverpool", "Chelsea", "Tottenham", "Aston Villa", 
    "Juventus", "AS Roma", "Bayer Leverkusen", "Ajax", "Sporting CP"
];

const obtenerRutaLogo = (nombreEquipo) => {
    if (!nombreEquipo) return 'img/equipos/default.png';
    const filename = nombreEquipo.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                                .toLowerCase().replace(/[^a-z0-9]/g, '-');
    return `img/equipos/${filename}.png`;
};

const configurarAutocompletado = (inputId, sugerenciasId) => {
    const input = document.getElementById(inputId);
    const sugerencias = document.getElementById(sugerenciasId);

    input.addEventListener('input', () => {
        const val = input.value.toLowerCase();
        sugerencias.innerHTML = '';
        if (!val) {
            sugerencias.style.display = 'none'; return;
        }
        
        const filtrados = equiposUCL.filter(e => e.toLowerCase().includes(val));
        if (filtrados.length > 0) {
            sugerencias.style.display = 'block';
            filtrados.forEach(equipo => {
                const li = document.createElement('li');
                li.className = 'list-group-item bg-dark text-white border-secondary cursor-pointer d-flex align-items-center gap-3 py-2';
                li.innerHTML = `<img src="${obtenerRutaLogo(equipo)}" class="team-logo-sm" onerror="this.src='img/equipos/default.png'"> <span>${equipo}</span>`;
                
                li.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    input.value = equipo;
                    sugerencias.style.display = 'none';
                });
                sugerencias.appendChild(li);
            });
        } else {
            sugerencias.style.display = 'none';
        }
    });

    input.addEventListener('blur', () => sugerencias.style.display = 'none');
};

configurarAutocompletado('equipo1', 'sugerencias1');
configurarAutocompletado('equipo2', 'sugerencias2');

// ==========================================
// INTERFAZ DE USUARIO PRINCIPAL
// ==========================================

const form = document.getElementById('form-resultado');
const tablaBody = document.getElementById('tabla-posiciones-body');
const listaGoleadores = document.getElementById('lista-goleadores');
const listaGolesContra = document.getElementById('lista-goles-contra');
const historialDiv = document.getElementById('historial-partidos');
const btnTerminar = document.getElementById('btn-terminar-temporada');
const btnNuevaTemporada = document.getElementById('btn-nueva-temporada');

// Lógica Penales
document.getElementById('hubo-penales').addEventListener('change', (e) => {
    const container = document.getElementById('contenedor-penales');
    const inputP1 = document.getElementById('penales1');
    const inputP2 = document.getElementById('penales2');
    
    if (e.target.checked) {
        container.classList.remove('d-none');
        inputP1.required = true; inputP2.required = true;
    } else {
        container.classList.add('d-none');
        inputP1.required = false; inputP2.required = false;
        inputP1.value = ''; inputP2.value = '';
    }
});

// Guardar Partido
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const huboPenales = document.getElementById('hubo-penales').checked;
    
    const datos = {
        j1: document.getElementById('jugador1').value,
        eq1: document.getElementById('equipo1').value.trim(),
        g1: parseInt(document.getElementById('goles1').value),
        j2: document.getElementById('jugador2').value,
        eq2: document.getElementById('equipo2').value.trim(),
        g2: parseInt(document.getElementById('goles2').value),
        penales: huboPenales,
        p1: huboPenales ? parseInt(document.getElementById('penales1').value) : 0,
        p2: huboPenales ? parseInt(document.getElementById('penales2').value) : 0
    };

    if (datos.j1 === datos.j2) return alert("No puedes jugar contra ti mismo");

    await registrarPartido(datos);
    
    form.reset();
    document.getElementById('hubo-penales').checked = false;
    document.getElementById('contenedor-penales').classList.add('d-none');
    
    const tabPosiciones = new bootstrap.Tab(document.querySelector('#trackerTabs button[data-bs-target="#posiciones"]'));
    tabPosiciones.show();
});

// Actualizar Interfaz (Escuchar Firebase)
escucharCambios((partidos) => {
    const stats = calcularEstadisticas(partidos);
    estadisticasActuales = stats;
    goleadoresActuales = obtenerGoleadores(partidos);
    const golesContra = obtenerGolesEnContra(partidos);
    const statsEquipos = obtenerEstadisticasEquipos(partidos);

    // 1. Tabla de Posiciones
    tablaBody.innerHTML = Object.entries(stats)
        .sort((a, b) => b[1].pts - a[1].pts || (b[1].gf - b[1].gc) - (a[1].gf - a[1].gc))
        .map(([name, s], i) => `
            <tr>
                <td>${i + 1}</td>
                <td class="fw-bold">${name}</td>
                <td>${s.pj}</td><td>${s.g}</td><td>${s.e}</td><td>${s.p}</td>
                <td>${s.gf}</td><td>${s.gc}</td><td>${s.gf - s.gc}</td>
                <td class="text-primary fw-bold fs-5">${s.pts}</td>
            </tr>
        `).join('');

    // 2. Historial de Partidos con Escudos
    if (partidos.length === 0) {
        historialDiv.innerHTML = '<p class="text-center text-muted">Aún no hay partidos registrados en esta temporada.</p>';
    } else {
        historialDiv.innerHTML = [...partidos].reverse().map(p => {
            const marcador = p.penales 
                ? `${p.g1} <span class="text-warning fs-6">(${p.p1})</span> - <span class="text-warning fs-6">(${p.p2})</span> ${p.g2}`
                : `${p.g1} - ${p.g2}`;

            return `
            <div class="card bg-dark border-secondary shadow-sm">
                <div class="card-body py-3 px-3 d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center gap-3 text-start" style="width: 35%;">
                        <img src="${obtenerRutaLogo(p.eq1)}" class="team-logo-md" onerror="this.src='img/equipos/default.png'">
                        <div>
                            <span class="fw-bold d-block text-primary">${p.j1}</span>
                            <small class="text-light" style="font-size: 0.8rem;">${p.eq1}</small>
                        </div>
                    </div>
                    
                    <div class="text-center fw-bold fs-5 bg-secondary bg-opacity-25 px-3 py-2 rounded" style="width: 25%;">
                        ${marcador}
                    </div>
                    
                    <div class="d-flex align-items-center justify-content-end gap-3 text-end" style="width: 35%;">
                        <div>
                            <span class="fw-bold d-block text-primary">${p.j2}</span>
                            <small class="text-light" style="font-size: 0.8rem;">${p.eq2}</small>
                        </div>
                        <img src="${obtenerRutaLogo(p.eq2)}" class="team-logo-md" onerror="this.src='img/equipos/default.png'">
                    </div>
                </div>
            </div>
            `;
        }).join('');
    }

    // 3. Goleadores y Goles Contra
    listaGoleadores.innerHTML = goleadoresActuales.map(([name, goles]) => `
        <li class="list-group-item bg-dark text-white d-flex justify-content-between align-items-center border-secondary">
            <span class="fs-5">${name}</span><span class="badge bg-info text-dark rounded-pill fs-6">${goles} ⚽</span>
        </li>`).join('');

    listaGolesContra.innerHTML = golesContra.map(([name, goles]) => `
        <li class="list-group-item bg-dark text-white d-flex justify-content-between align-items-center border-secondary">
            <span class="fs-5">${name}</span><span class="badge bg-danger text-white rounded-pill fs-6">${goles} 🥅</span>
        </li>`).join('');

    // 4. Equipos Top y Flop
    if (statsEquipos.length > 0) {
        const masGanador = statsEquipos[0];
        const menosGanador = statsEquipos[statsEquipos.length - 1];
        
        document.getElementById('equipo-mas-victorias').innerText = masGanador.nombre;
        document.getElementById('stats-mas-victorias').innerText = `${masGanador.victorias} Victorias en ${masGanador.pj} PJ`;
        document.getElementById('img-mas-victorias').src = obtenerRutaLogo(masGanador.nombre);
        
        document.getElementById('equipo-menos-victorias').innerText = menosGanador.nombre;
        document.getElementById('stats-menos-victorias').innerText = `${menosGanador.victorias} Victorias en ${menosGanador.pj} PJ`;
        document.getElementById('img-menos-victorias').src = obtenerRutaLogo(menosGanador.nombre);
    } else {
        document.getElementById('equipo-mas-victorias').innerText = "-";
        document.getElementById('stats-mas-victorias').innerText = "";
        document.getElementById('img-mas-victorias').src = "img/equipos/default.png";
        
        document.getElementById('equipo-menos-victorias').innerText = "-";
        document.getElementById('stats-menos-victorias').innerText = "";
        document.getElementById('img-menos-victorias').src = "img/equipos/default.png";
    }

    // 5. Validar Botón Finalizar
    if (partidos.length > 0) {
        const pjs = Object.values(stats).map(s => s.pj);
        const listos = pjs.every(p => p === pjs[0] && p > 0);
        btnTerminar.disabled = !listos;
    } else {
        btnTerminar.disabled = true;
    }
});

// Acción Botón Terminar
btnTerminar.addEventListener('click', () => {
    if (!estadisticasActuales || !goleadoresActuales) return;
    const tablaOrdenada = Object.entries(estadisticasActuales).sort((a, b) => b[1].pts - a[1].pts || (b[1].gf - b[1].gc) - (a[1].gf - a[1].gc));
    document.getElementById('campeon-nombre').innerText = tablaOrdenada[0][0];
    document.getElementById('campeon-pts').innerText = tablaOrdenada[0][1].pts;
    document.getElementById('pichichi-nombre').innerText = goleadoresActuales[0][0];
    document.getElementById('pichichi-goles').innerText = goleadoresActuales[0][1];
    
    // Mostramos el modal
    const modalResumen = new bootstrap.Modal(document.getElementById('modalResumen'));
    modalResumen.show();
});

// Acción Botón NUEVA TEMPORADA (Borrar todo)
btnNuevaTemporada.addEventListener('click', async () => {
    const confirmar = confirm("🚨 ¿Están seguros de que quieren reiniciar todo? Esto borrará permanentemente TODO el historial de la temporada actual.");
    
    if (confirmar) {
        // Ejecutamos la limpieza en Firebase
        await reiniciarTemporada();
        
        // Escondemos el modal
        const modalElement = document.getElementById('modalResumen');
        const modalInstancia = bootstrap.Modal.getInstance(modalElement);
        modalInstancia.hide();
        
        alert("🔄 ¡La nueva temporada ha comenzado! Todos los marcadores están en cero.");
    }
});