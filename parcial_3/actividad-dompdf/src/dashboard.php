<?php

/**
 * Lógica compartida del dashboard: lee data.json, calcula métricas y
 * genera las gráficas como SVG.
 *
 * DomPDF no ejecuta JavaScript, así que librerías como Chart.js o ApexCharts
 * no sirven para el PDF. Por eso las gráficas se dibujan en el servidor como
 * SVG: el navegador y DomPDF muestran exactamente la misma imagen.
 */

const CALIFICACION_APROBATORIA = 70;

const COLOR_SERIE = '#2a78d6';
const COLOR_TEXTO = '#0b0b0b';
const COLOR_TEXTO_2 = '#52514e';
const COLOR_GRID = '#e4e3df';
const FUENTE_SVG = 'DejaVu Sans, Helvetica, Arial, sans-serif';

function cargarDatos(string $ruta): array
{
    $datos = json_decode(file_get_contents($ruta), true, flags: JSON_THROW_ON_ERROR);

    return $datos;
}

function promedio(array $valores): float
{
    return count($valores) ? array_sum($valores) / count($valores) : 0.0;
}

function calcularMetricas(array $alumnos): array
{
    $totales = array_column($alumnos, 'total');
    $aprobados = count(array_filter($totales, fn ($t) => $t >= CALIFICACION_APROBATORIA));
    $entregadas = array_sum(array_column($alumnos, 'tareas_entregadas'));
    $asignadas = array_sum(array_column($alumnos, 'tareas_totales'));

    // Promedio por grupo
    $porGrupo = [];
    foreach ($alumnos as $a) {
        $porGrupo[$a['categoria']][] = $a['total'];
    }
    ksort($porGrupo);
    $promedioGrupo = array_map(fn ($v) => round(promedio($v), 1), $porGrupo);

    // Distribución de calificaciones en rangos
    $rangos = ['60–69' => 0, '70–79' => 0, '80–89' => 0, '90–100' => 0];
    foreach ($totales as $t) {
        $clave = match (true) {
            $t >= 90 => '90–100',
            $t >= 80 => '80–89',
            $t >= 70 => '70–79',
            default => '60–69',
        };
        $rangos[$clave]++;
    }

    // Alumnos registrados por mes
    $nombresMes = ['01' => 'Ene', '02' => 'Feb', '03' => 'Mar', '04' => 'Abr', '05' => 'May', '06' => 'Jun',
        '07' => 'Jul', '08' => 'Ago', '09' => 'Sep', '10' => 'Oct', '11' => 'Nov', '12' => 'Dic'];
    $porMes = [];
    foreach ($alumnos as $a) {
        $mes = substr($a['fecha_registro'], 0, 7);
        $porMes[$mes] = ($porMes[$mes] ?? 0) + 1;
    }
    ksort($porMes);
    $registrosMes = [];
    foreach ($porMes as $mes => $n) {
        $registrosMes[$nombresMes[substr($mes, 5, 2)] . ' ' . substr($mes, 0, 4)] = $n;
    }

    // Mejores alumnos
    $ranking = $alumnos;
    usort($ranking, fn ($a, $b) => [$b['total'], $b['asistencia']] <=> [$a['total'], $a['asistencia']]);

    return [
        'alumnos' => count($alumnos),
        'promedio' => round(promedio($totales), 1),
        'aprobados' => $aprobados,
        'tasaAprobacion' => round($aprobados / count($alumnos) * 100, 1),
        'asistencia' => round(promedio(array_column($alumnos, 'asistencia')), 1),
        'entregaTareas' => round($entregadas / $asignadas * 100, 1),
        'promedioGrupo' => $promedioGrupo,
        'rangos' => $rangos,
        'registrosMes' => $registrosMes,
        'dispersion' => array_map(fn ($a) => [$a['asistencia'], $a['total'], $a['etiqueta']], $alumnos),
        'top' => array_slice($ranking, 0, 10),
    ];
}

function e(string|int|float $texto): string
{
    return htmlspecialchars((string) $texto, ENT_QUOTES, 'UTF-8');
}

/** Texto SVG con los atributos comunes. */
function svgTexto(float $x, float $y, string $texto, string $anchor = 'start', string $color = COLOR_TEXTO_2, int $size = 10): string
{
    return sprintf(
        '<text x="%.1f" y="%.1f" font-family="%s" font-size="%d" fill="%s" text-anchor="%s">%s</text>',
        $x, $y, FUENTE_SVG, $size, $color, $anchor, e($texto)
    );
}

/** Barra con el extremo de datos redondeado (4px) y anclada a la línea base. */
function barraVertical(float $x, float $yBase, float $ancho, float $alto, string $titulo): string
{
    $r = min(4, $ancho / 2, $alto);
    $top = $yBase - $alto;
    $d = sprintf(
        'M%.1f %.1f L%.1f %.1f Q%.1f %.1f %.1f %.1f L%.1f %.1f Q%.1f %.1f %.1f %.1f L%.1f %.1f Z',
        $x, $yBase, $x, $top + $r, $x, $top, $x + $r, $top,
        $x + $ancho - $r, $top, $x + $ancho, $top, $x + $ancho, $top + $r, $x + $ancho, $yBase
    );

    return sprintf('<path d="%s" fill="%s"><title>%s</title></path>', $d, COLOR_SERIE, e($titulo));
}

function barraHorizontal(float $xBase, float $y, float $largo, float $alto, string $titulo): string
{
    $r = min(4, $alto / 2, $largo);
    $fin = $xBase + $largo;
    $d = sprintf(
        'M%.1f %.1f L%.1f %.1f Q%.1f %.1f %.1f %.1f L%.1f %.1f Q%.1f %.1f %.1f %.1f L%.1f %.1f Z',
        $xBase, $y, $fin - $r, $y, $fin, $y, $fin, $y + $r,
        $fin, $y + $alto - $r, $fin, $y + $alto, $fin - $r, $y + $alto, $xBase, $y + $alto
    );

    return sprintf('<path d="%s" fill="%s"><title>%s</title></path>', $d, COLOR_SERIE, e($titulo));
}

function envolverSvg(int $ancho, int $alto, string $contenido, string $descripcion): string
{
    return sprintf(
        '<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" viewBox="0 0 %d %d" role="img" aria-label="%s">%s</svg>',
        $ancho, $alto, $ancho, $alto, e($descripcion), $contenido
    );
}

/** Barras horizontales con escala fija 0–100. */
function graficaBarrasH(array $datos, string $descripcion, string $unidad = ''): string
{
    $ancho = 340; $alto = 180;
    $izq = 60; $der = 36; $arriba = 8; $abajo = 22;
    $areaAncho = $ancho - $izq - $der;
    $fila = ($alto - $arriba - $abajo) / count($datos);
    $grosor = min(18, $fila - 8);

    $svg = '';
    foreach ([0, 25, 50, 75, 100] as $tick) {
        $x = $izq + $areaAncho * $tick / 100;
        $svg .= sprintf('<line x1="%.1f" y1="%d" x2="%.1f" y2="%d" stroke="%s" stroke-width="1"/>', $x, $arriba, $x, $alto - $abajo, COLOR_GRID);
        $svg .= svgTexto($x, $alto - 6, (string) $tick, 'middle');
    }

    $i = 0;
    foreach ($datos as $etiqueta => $valor) {
        $y = $arriba + $fila * $i + ($fila - $grosor) / 2;
        $largo = $areaAncho * $valor / 100;
        $svg .= svgTexto($izq - 8, $y + $grosor / 2 + 3.5, $etiqueta, 'end');
        $svg .= barraHorizontal($izq, $y, $largo, $grosor, "$etiqueta: $valor$unidad");
        $svg .= svgTexto($izq + $largo + 5, $y + $grosor / 2 + 3.5, number_format($valor, 1), 'start', COLOR_TEXTO);
        $i++;
    }

    return envolverSvg($ancho, $alto, $svg, $descripcion);
}

/** Columnas verticales; la escala se ajusta al valor máximo. */
function graficaColumnas(array $datos, string $descripcion, string $unidad = ''): string
{
    $ancho = 340; $alto = 180;
    $izq = 30; $der = 8; $arriba = 16; $abajo = 24;
    $areaAncho = $ancho - $izq - $der;
    $areaAlto = $alto - $arriba - $abajo;
    $base = $alto - $abajo;

    $paso = max(5, (int) ceil(max($datos) / 4 / 5) * 5);
    $maximo = $paso * 4;

    $svg = '';
    for ($tick = 0; $tick <= $maximo; $tick += $paso) {
        $y = $base - $areaAlto * $tick / $maximo;
        $svg .= sprintf('<line x1="%d" y1="%.1f" x2="%d" y2="%.1f" stroke="%s" stroke-width="1"/>', $izq, $y, $ancho - $der, $y, COLOR_GRID);
        $svg .= svgTexto($izq - 6, $y + 3.5, (string) $tick, 'end');
    }

    $columna = $areaAncho / count($datos);
    $grosor = min(44, $columna * 0.55);
    $i = 0;
    foreach ($datos as $etiqueta => $valor) {
        $x = $izq + $columna * $i + ($columna - $grosor) / 2;
        $altoBarra = $areaAlto * $valor / $maximo;
        $svg .= barraVertical($x, $base, $grosor, $altoBarra, "$etiqueta: $valor$unidad");
        $svg .= svgTexto($x + $grosor / 2, $base - $altoBarra - 5, (string) $valor, 'middle', COLOR_TEXTO);
        $svg .= svgTexto($x + $grosor / 2, $alto - 8, $etiqueta, 'middle');
        $i++;
    }

    return envolverSvg($ancho, $alto, $svg, $descripcion);
}

/** Dispersión: asistencia (x) contra calificación (y). */
function graficaDispersion(array $puntos, string $descripcion): string
{
    $ancho = 340; $alto = 180;
    $izq = 30; $der = 18; $arriba = 10; $abajo = 34;
    $areaAncho = $ancho - $izq - $der;
    $areaAlto = $alto - $arriba - $abajo;
    $base = $alto - $abajo;

    $xs = array_column($puntos, 0);
    $xMin = (int) floor(min($xs) / 10) * 10;
    $xMax = (int) ceil(max($xs) / 10) * 10;
    $yMin = 50; $yMax = 100;

    $px = fn ($v) => $izq + $areaAncho * ($v - $xMin) / ($xMax - $xMin);
    $py = fn ($v) => $base - $areaAlto * ($v - $yMin) / ($yMax - $yMin);

    $svg = '';
    for ($t = $yMin; $t <= $yMax; $t += 10) {
        $svg .= sprintf('<line x1="%d" y1="%.1f" x2="%d" y2="%.1f" stroke="%s" stroke-width="1"/>', $izq, $py($t), $ancho - $der, $py($t), COLOR_GRID);
        $svg .= svgTexto($izq - 6, $py($t) + 3.5, (string) $t, 'end');
    }
    for ($t = $xMin; $t <= $xMax; $t += 10) {
        $svg .= svgTexto($px($t), $base + 14, "$t%", 'middle');
    }
    $svg .= svgTexto($izq + $areaAncho / 2, $alto - 4, 'Asistencia', 'middle');

    // Línea de calificación aprobatoria
    $yAprob = $py(CALIFICACION_APROBATORIA);
    $svg .= sprintf('<line x1="%d" y1="%.1f" x2="%d" y2="%.1f" stroke="%s" stroke-width="1.5"/>', $izq, $yAprob, $ancho - $der, $yAprob, COLOR_TEXTO_2);

    foreach ($puntos as [$x, $y, $nombre]) {
        $svg .= sprintf(
            '<circle cx="%.1f" cy="%.1f" r="4" fill="%s" fill-opacity="0.55" stroke="#ffffff" stroke-width="1"><title>%s</title></circle>',
            $px($x), $py($y), COLOR_SERIE, e("$nombre: asistencia $x%, calificación $y")
        );
    }

    return envolverSvg($ancho, $alto, $svg, $descripcion);
}

/**
 * En el navegador el SVG va en línea (los <title> funcionan como tooltip).
 * En el PDF se inserta como imagen data-URI, que es la forma más confiable en DomPDF.
 */
function mostrarGrafica(string $svg, bool $paraPdf): string
{
    if (! $paraPdf) {
        return $svg;
    }

    return sprintf('<img src="data:image/svg+xml;base64,%s" alt="" style="width:100%%">', base64_encode($svg));
}

function renderizarDashboard(array $datos, bool $paraPdf): string
{
    $m = calcularMetricas($datos['puntos']);
    $graficas = [
        'grupos' => graficaBarrasH($m['promedioGrupo'], 'Calificación promedio por grupo', ' pts'),
        'rangos' => graficaColumnas($m['rangos'], 'Alumnos por rango de calificación', ' alumnos'),
        'dispersion' => graficaDispersion($m['dispersion'], 'Asistencia contra calificación final'),
        'meses' => graficaColumnas($m['registrosMes'], 'Alumnos registrados por mes', ' alumnos'),
    ];
    $titulo = $datos['titulo'];
    $unidad = $datos['unidad'];
    $generado = date('d/m/Y H:i');

    ob_start();
    require __DIR__ . '/../views/dashboard.php';

    return ob_get_clean();
}
