var peliculas = [];
var filtroDesde = 0;
var filtroHasta = 9999;

$(document).ready(function () {

  cargarPeliculas();

  $(".filtro").on("click", function () {
    $(".filtro").removeClass("btn-primary activo").addClass("btn-outline-secondary");
    $(this).removeClass("btn-outline-secondary").addClass("btn-primary activo");

    filtroDesde = parseInt($(this).data("desde"), 10);
    filtroHasta = parseInt($(this).data("hasta"), 10);
    mostrarPeliculas();
  });

  $("#inputBuscar").on("keyup", function () {
    mostrarPeliculas(false);
  });

  $("#btnReintentar").on("click", function () {
    cargarPeliculas();
  });

  $("#gridPeliculas").on("click", ".btn-favorito", function (evento) {
    evento.preventDefault();
    var id = $(this).data("id");
    var pelicula = buscarPelicula(id);
    if (pelicula) {
      alternarFavorito(pelicula);
      sincronizarCorazones();
    }
  });

  $(document).on("favoritosCambiaron", function () {
    sincronizarCorazones();
  });
});

function cargarPeliculas() {
  $("#mensajeError").addClass("d-none");
  $("#sinResultados").addClass("d-none");
  $("#gridPeliculas").empty();
  $("#spinner").show();

  $.ajax({
    url: API_TOP,
    method: "GET",
    headers: API_HEADERS,
    dataType: "json",
    timeout: 8000
  })
    .done(function (datos) {
      peliculas = datos;
      $("#spinner").hide();
      mostrarPeliculas();
    })
    .fail(function () {
      cargarDesdeArchivo();
    });
}

function cargarDesdeArchivo() {
  $.getJSON(ARCHIVO_JSON)
    .done(function (datos) {
      peliculas = datos;
      $("#spinner").hide();
      mostrarPeliculas();
    })
    .fail(function () {
      $("#spinner").hide();
      $("#mensajeError").removeClass("d-none").hide().fadeIn(400);
    });
}

function mostrarPeliculas(conEfecto) {
  var texto = $("#inputBuscar").val().toLowerCase().trim();
  var $grid = $("#gridPeliculas");
  var encontradas = 0;

  $grid.empty();

  $.each(peliculas, function (indice, pelicula) {
    var anio = pelicula.startYear || 0;
    var titulo = (pelicula.primaryTitle || "").toLowerCase();

    var pasaDecada = anio >= filtroDesde && anio <= filtroHasta;
    var pasaBusqueda = texto === "" || titulo.indexOf(texto) !== -1;

    if (pasaDecada && pasaBusqueda) {
      $grid.append(crearTarjeta(pelicula));
      encontradas++;
    }
  });

  if (encontradas === 0) {
    $("#sinResultados").removeClass("d-none");
  } else {
    $("#sinResultados").addClass("d-none");
  }

  if (conEfecto !== false) {
    $grid.hide().fadeIn(400);
  }
  aplicarEfectoHover();
}

function crearTarjeta(pelicula) {
  var favorito = esFavorito(pelicula.id);
  var imagen = pelicula.primaryImage || SIN_IMAGEN;
  var calificacion = pelicula.averageRating ? pelicula.averageRating.toFixed(1) : "N/A";

  return (
    '<div class="col-12 col-md-6 col-lg-3">' +
      '<div class="card h-100 border-0 shadow-sm movie-card">' +
        '<img src="' + imagen + '" class="card-img-top poster" alt="' + pelicula.primaryTitle + '">' +
        '<div class="card-body d-flex flex-column">' +
          '<div class="d-flex justify-content-between align-items-start">' +
            '<h6 class="card-title fw-bold text-truncate mb-2" title="' + pelicula.primaryTitle + '">' + pelicula.primaryTitle + "</h6>" +
            '<button type="button" class="btn btn-sm btn-link p-0 ms-2 btn-favorito" data-id="' + pelicula.id + '" title="Agregar a favoritos">' +
              '<i class="bi ' + (favorito ? "bi-heart-fill text-danger" : "bi-heart text-secondary") + '"></i>' +
            "</button>" +
          "</div>" +
          '<div class="d-flex justify-content-between align-items-center">' +
            '<span class="text-muted small">' + oNA(pelicula.startYear) + "</span>" +
            '<span class="fw-bold small text-warning">' + calificacion + ' <i class="bi bi-star-fill"></i></span>' +
          "</div>" +
          '<div class="mb-3 small">' + pintarEstrellas(pelicula.averageRating) + "</div>" +
          '<a href="reseña.html?id=' + pelicula.id + '" class="btn btn-primary btn-sm w-100 mt-auto">' +
            '<i class="bi bi-eye"></i> Ver reseña' +
          "</a>" +
        "</div>" +
      "</div>" +
    "</div>"
  );
}

function aplicarEfectoHover() {
  $(".movie-card").hover(
    function () {
      $(this).addClass("elevada");
    },
    function () {
      $(this).removeClass("elevada");
    }
  );
}

function sincronizarCorazones() {
  $(".btn-favorito").each(function () {
    var $icono = $(this).find("i");
    if (esFavorito($(this).data("id"))) {
      $icono.removeClass("bi-heart text-secondary").addClass("bi-heart-fill text-danger");
    } else {
      $icono.removeClass("bi-heart-fill text-danger").addClass("bi-heart text-secondary");
    }
  });
}

function buscarPelicula(id) {
  var encontrada = null;
  $.each(peliculas, function (indice, pelicula) {
    if (pelicula.id === id) {
      encontrada = pelicula;
      return false;
    }
  });
  return encontrada;
}
