<?php

// Genera el PDF del dashboard con DomPDF a partir del mismo HTML.
// En el navegador: exportar.php descarga el PDF.
// En la terminal:  php exportar.php  guarda dashboard.pdf en esta carpeta.

require __DIR__ . '/vendor/autoload.php';
require __DIR__ . '/src/dashboard.php';

use Dompdf\Dompdf;
use Dompdf\Options;

date_default_timezone_set('America/Mexico_City');

$html = renderizarDashboard(cargarDatos(__DIR__ . '/data.json'), paraPdf: true);

$opciones = new Options();
$opciones->set('defaultFont', 'DejaVu Sans'); // incluye acentos y la ñ
$opciones->set('isRemoteEnabled', false);     // no hace falta cargar recursos externos
$opciones->setChroot(__DIR__);

$dompdf = new Dompdf($opciones);
$dompdf->loadHtml($html, 'UTF-8');
$dompdf->setPaper('A4', 'portrait');
$dompdf->render();

$nombre = 'dashboard-calificaciones-' . date('Y-m-d') . '.pdf';

if (PHP_SAPI === 'cli') {
    file_put_contents(__DIR__ . '/dashboard.pdf', $dompdf->output());
    echo "PDF guardado en dashboard.pdf\n";
} else {
    // Attachment => true fuerza la descarga; con false se abre en el navegador.
    $dompdf->stream($nombre, ['Attachment' => true]);
}
