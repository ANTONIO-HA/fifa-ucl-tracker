export const calcularEstadisticas = (partidos) => {
    const inicial = { pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, pts: 0 };
    const tabla = {
        'Huerta': { ...inicial },
        'Addi': { ...inicial },
        'Marcelo': { ...inicial }
    };

    partidos.forEach(partido => {
        const { j1, g1, j2, g2, penales, p1, p2 } = partido;

        tabla[j1].pj++; tabla[j2].pj++;
        tabla[j1].gf += g1; tabla[j1].gc += g2;
        tabla[j2].gf += g2; tabla[j2].gc += g1;

        if (g1 > g2) {
            tabla[j1].g++; tabla[j1].pts += 3; tabla[j2].p++;
        } else if (g2 > g1) {
            tabla[j2].g++; tabla[j2].pts += 3; tabla[j1].p++;
        } else {
            if (penales) {
                if (p1 > p2) { tabla[j1].g++; tabla[j1].pts += 3; tabla[j2].p++; } 
                else { tabla[j2].g++; tabla[j2].pts += 3; tabla[j1].p++; }
            } else {
                tabla[j1].e++; tabla[j1].pts += 1;
                tabla[j2].e++; tabla[j2].pts += 1;
            }
        }
    });

    return tabla;
};

export const obtenerGoleadores = (partidos) => {
    const goles = { 'Huerta': 0, 'Addi': 0, 'Marcelo': 0 };
    partidos.forEach(p => { goles[p.j1] += p.g1; goles[p.j2] += p.g2; });
    return Object.entries(goles).sort((a, b) => b[1] - a[1]);
};

export const obtenerGolesEnContra = (partidos) => {
    const gc = { 'Huerta': 0, 'Addi': 0, 'Marcelo': 0 };
    partidos.forEach(p => { gc[p.j1] += p.g2; gc[p.j2] += p.g1; });
    return Object.entries(gc).sort((a, b) => b[1] - a[1]);
};

export const obtenerEstadisticasEquipos = (partidos) => {
    const equipos = {};

    partidos.forEach(p => {
        const eq1 = p.eq1 || 'Desconocido';
        const eq2 = p.eq2 || 'Desconocido';

        if (!equipos[eq1]) equipos[eq1] = { nombre: eq1, victorias: 0, pj: 0 };
        if (!equipos[eq2]) equipos[eq2] = { nombre: eq2, victorias: 0, pj: 0 };

        equipos[eq1].pj++;
        equipos[eq2].pj++;

        if (p.g1 > p.g2) equipos[eq1].victorias++;
        else if (p.g2 > p.g1) equipos[eq2].victorias++;
        else if (p.penales) {
            if (p.p1 > p.p2) equipos[eq1].victorias++;
            else equipos[eq2].victorias++;
        }
    });

    // Ordenar por victorias. Desempate: El que tenga menos partidos jugados (más efectivo)
    return Object.values(equipos).sort((a, b) => {
        if (b.victorias !== a.victorias) return b.victorias - a.victorias;
        return a.pj - b.pj;
    });
};