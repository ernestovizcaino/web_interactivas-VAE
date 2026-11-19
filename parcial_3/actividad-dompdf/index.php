<?php

// Vista del dashboard en el navegador.

require __DIR__ . '/src/dashboard.php';

date_default_timezone_set('America/Mexico_City');

echo renderizarDashboard(cargarDatos(__DIR__ . '/data.json'), paraPdf: false);
