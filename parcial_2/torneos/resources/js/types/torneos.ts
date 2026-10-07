export type EstadoVisible = 'abierto' | 'lleno' | 'cerrado' | 'finalizado';

export type Torneo = {
    id: number;
    nombre: string;
    juego: string;
    fecha: string;
    fecha_local: string;
    cupo: number;
    descripcion: string | null;
    estado: 'abierto' | 'cerrado';
    estado_visible: EstadoVisible;
    inscritos: number;
    plazas_libres: number;
    inscrito: boolean;
    participantes?: string[];
};

export type Participante = {
    id: number;
    nombre: string;
    fecha: string | null;
};

export type InscripcionAdmin = {
    id: number;
    nombre: string;
    email: string;
    fecha: string | null;
};

export type MiInscripcion = {
    id: number;
    fecha_inscripcion: string | null;
    puede_cancelar: boolean;
    torneo: Torneo;
};

export type JuegoConTotal = {
    nombre: string;
    total: number;
};
