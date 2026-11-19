<?php
/**
 * Plantilla del dashboard. La usa tanto index.php (navegador) como exportar.php (PDF).
 * El maquetado usa tablas en vez de flexbox/grid porque DomPDF solo soporta CSS 2.1
 * (más algunas propiedades de CSS3).
 *
 * @var array $m          Métricas calculadas
 * @var array $graficas   SVG de cada gráfica
 * @var bool  $paraPdf
 * @var string $titulo, $unidad, $generado
 */
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard · <?= e($titulo) ?></title>
    <style>
        @page { margin: 14mm 12mm; }

        * { box-sizing: border-box; }
        body {
            margin: 0;
            font-family: 'DejaVu Sans', Helvetica, Arial, sans-serif;
            font-size: 10px;
            color: #0b0b0b;
            background: <?= $paraPdf ? '#ffffff' : '#f3f2ef' ?>;
        }
        .pagina {
            max-width: <?= $paraPdf ? 'none' : '820px' ?>;
            margin: 0 auto;
            padding: <?= $paraPdf ? '0' : '32px 20px 48px' ?>;
        }

        .encabezado { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
        .encabezado td { vertical-align: bottom; padding: 0; }
        .eyebrow { font-size: 9px; letter-spacing: 1px; text-transform: uppercase; color: #52514e; margin: 0 0 4px; }
        h1 { font-size: 18px; margin: 0; }
        .subtitulo { color: #52514e; margin: 4px 0 0; }
        .acciones { text-align: right; }
        .boton {
            display: inline-block;
            padding: 9px 16px;
            border-radius: 8px;
            background: #0b0b0b;
            color: #ffffff;
            font-size: 12px;
            font-weight: bold;
            text-decoration: none;
        }
        .boton:hover { background: #2a78d6; }

        /* Tarjetas KPI */
        .kpis, .rejilla { width: 100%; border-collapse: collapse; }
        .kpis { margin-bottom: 10px; }
        .kpis > tbody > tr > td, .kpis > tr > td { width: 20%; padding: 0 4px; vertical-align: top; }
        .rejilla > tbody > tr > td, .rejilla > tr > td { width: 50%; padding: 0 4px 8px; vertical-align: top; }
        .kpis td:first-child, .rejilla td:first-child { padding-left: 0; }
        .kpis td:last-child, .rejilla td:last-child { padding-right: 0; }
        .kpi {
            background: #ffffff;
            border: 1px solid #e4e3df;
            border-radius: 8px;
            padding: 10px 12px;
        }
        .kpi-etiqueta { color: #52514e; font-size: 9px; margin: 0 0 6px; }
        .kpi-valor { font-size: 20px; font-weight: bold; margin: 0; }
        .kpi-detalle { color: #52514e; font-size: 8.5px; margin: 4px 0 0; }

        /* Tarjetas de gráficas */
        .tarjeta {
            background: #ffffff;
            border: 1px solid #e4e3df;
            border-radius: 8px;
            padding: 12px;
        }
        .tarjeta h2 { font-size: 11px; margin: 0 0 2px; }
        .tarjeta .nota { color: #52514e; font-size: 8.5px; margin: 0 0 8px; }
        .tarjeta svg { width: 100%; height: auto; display: block; }
        .tarjeta svg path:hover, .tarjeta svg circle:hover { fill: #184f95; }

        /* Tabla de mejores alumnos */
        .tabla-tarjeta {
            background: #ffffff;
            border: 1px solid #e4e3df;
            border-radius: 8px;
            padding: 12px;
            page-break-inside: avoid;
        }
        .tabla-tarjeta h2 { font-size: 11px; margin: 0 0 8px; }
        .tabla { width: 100%; border-collapse: collapse; }
        .tabla th {
            text-align: left;
            font-size: 8.5px;
            color: #52514e;
            font-weight: normal;
            border-bottom: 1px solid #e4e3df;
            padding: 0 6px 6px;
        }
        .tabla td { padding: 3px 6px; border-bottom: 1px solid #f0efec; }
        .tabla .num { text-align: right; }

        .pie { color: #52514e; font-size: 8.5px; margin-top: 12px; }
    </style>
</head>
<body>
<div class="pagina">
    <table class="encabezado">
        <tr>
            <td>
                <p class="eyebrow">Reporte académico</p>
                <h1><?= e($titulo) ?></h1>
                <p class="subtitulo"><?= $m['alumnos'] ?> alumnos · <?= count($m['promedioGrupo']) ?> grupos · <?= e($unidad) ?></p>
            </td>
            <?php if (! $paraPdf): ?>
                <td class="acciones">
                    <a class="boton" href="exportar.php">Exportar PDF</a>
                </td>
            <?php endif; ?>
        </tr>
    </table>

    <table class="kpis">
        <tr>
            <td><div class="kpi">
                <p class="kpi-etiqueta">Alumnos</p>
                <p class="kpi-valor"><?= $m['alumnos'] ?></p>
                <p class="kpi-detalle">registrados</p>
            </div></td>
            <td><div class="kpi">
                <p class="kpi-etiqueta">Promedio general</p>
                <p class="kpi-valor"><?= number_format($m['promedio'], 1) ?></p>
                <p class="kpi-detalle">de 100 puntos</p>
            </div></td>
            <td><div class="kpi">
                <p class="kpi-etiqueta">Aprobación</p>
                <p class="kpi-valor"><?= number_format($m['tasaAprobacion'], 1) ?>%</p>
                <p class="kpi-detalle"><?= $m['aprobados'] ?> con <?= CALIFICACION_APROBATORIA ?> o más</p>
            </div></td>
            <td><div class="kpi">
                <p class="kpi-etiqueta">Asistencia promedio</p>
                <p class="kpi-valor"><?= number_format($m['asistencia'], 1) ?>%</p>
                <p class="kpi-detalle">de las clases</p>
            </div></td>
            <td><div class="kpi">
                <p class="kpi-etiqueta">Tareas entregadas</p>
                <p class="kpi-valor"><?= number_format($m['entregaTareas'], 1) ?>%</p>
                <p class="kpi-detalle">del total asignado</p>
            </div></td>
        </tr>
    </table>

    <table class="rejilla">
        <tr>
            <td><div class="tarjeta">
                <h2>Calificación promedio por grupo</h2>
                <p class="nota">Puntos, escala 0–100</p>
                <?= mostrarGrafica($graficas['grupos'], $paraPdf) ?>
            </div></td>
            <td><div class="tarjeta">
                <h2>Distribución de calificaciones</h2>
                <p class="nota">Número de alumnos por rango</p>
                <?= mostrarGrafica($graficas['rangos'], $paraPdf) ?>
            </div></td>
        </tr>
        <tr>
            <td><div class="tarjeta">
                <h2>Asistencia contra calificación</h2>
                <p class="nota">Cada punto es un alumno · la línea marca la calificación aprobatoria (<?= CALIFICACION_APROBATORIA ?>)</p>
                <?= mostrarGrafica($graficas['dispersion'], $paraPdf) ?>
            </div></td>
            <td><div class="tarjeta">
                <h2>Registros por mes</h2>
                <p class="nota">Alumnos según su fecha de registro</p>
                <?= mostrarGrafica($graficas['meses'], $paraPdf) ?>
            </div></td>
        </tr>
    </table>

    <div class="tabla-tarjeta">
        <h2>Los 10 mejores alumnos</h2>
        <table class="tabla">
            <thead>
            <tr>
                <th>#</th>
                <th>Alumno</th>
                <th>Grupo</th>
                <th class="num">Calificación</th>
                <th class="num">Asistencia</th>
                <th class="num">Tareas</th>
            </tr>
            </thead>
            <tbody>
            <?php foreach ($m['top'] as $i => $a): ?>
                <tr>
                    <td><?= $i + 1 ?></td>
                    <td><?= e($a['etiqueta']) ?></td>
                    <td><?= e($a['categoria']) ?></td>
                    <td class="num"><strong><?= $a['total'] ?></strong></td>
                    <td class="num"><?= $a['asistencia'] ?>%</td>
                    <td class="num"><?= $a['tareas_entregadas'] ?>/<?= $a['tareas_totales'] ?></td>
                </tr>
            <?php endforeach; ?>
            </tbody>
        </table>
    </div>

    <p class="pie">Generado el <?= e($generado) ?> a partir de data.json<?= $paraPdf ? ' · PDF creado con DomPDF' : '' ?></p>
</div>
</body>
</html>
