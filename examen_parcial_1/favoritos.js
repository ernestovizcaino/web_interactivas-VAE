var API_HOST = "imdb236.p.rapidapi.com";
var API_KEY = "bf13e103cemshe26d2b64ff4d1fep10ada2jsne3108a453dc0";
var API_TOP = "https://" + API_HOST + "/api/imdb/top250-movies";
var API_TITULO = "https://" + API_HOST + "/api/imdb/";
var API_HEADERS = { "x-rapidapi-key": API_KEY, "x-rapidapi-host": API_HOST };

var ARCHIVO_JSON = "PELICULAS.json";
var SIN_IMAGEN = "https://placehold.co/300x450?text=Sin+imagen";
var CLAVE_FAVORITOS = "movieReviewsFavoritos";

function pintarEstrellas(calificacion) {
  var llenas = Math.round(calificacion || 0);
  var html = "";
  for (var i = 1; i <= 10; i++) {
    html += '<i class="bi ' + (i <= llenas ? "bi-star-fill" : "bi-star") + '"></i>';
  }
  return '<span class="estrellas">' + html + "</span>";
}

function formatearDinero(cantidad) {
  if (!cantidad) return "N/A";
  if (cantidad >= 1000000000) return "$" + (cantidad / 1000000000).toFixed(1) + "B";
  if (cantidad >= 1000000) return "$" + (cantidad / 1000000).toFixed(1) + "M";
  if (cantidad >= 1000) return "$" + Math.round(cantidad / 1000) + "K";
  return "$" + cantidad;
}

function formatearNumero(numero) {
  if (!numero) return "N/A";
  return numero.toLocaleString("en-US");
}

function oNA(valor) {
  if (valor === null || valor === undefined || valor === "") return "N/A";
  if ($.isArray(valor) && valor.length === 0) return "N/A";
  return valor;
}

function nombreLegible(codigo, tipo) {
  try {
    var traductor = new Intl.DisplayNames(["es"], { type: tipo });
    var nombre = traductor.of(codigo);
    return nombre.charAt(0).toUpperCase() + nombre.slice(1);
  } catch (e) {
    return codigo;
  }
}

function obtenerFavoritos() {
  var guardados = localStorage.getItem(CLAVE_FAVORITOS);
  return guardados ? JSON.parse(guardados) : [];
}

function guardarFavoritos(favoritos) {
  localStorage.setItem(CLAVE_FAVORITOS, JSON.stringify(favoritos));
}

function esFavorito(id) {
  var favoritos = obtenerFavoritos();
  for (var i = 0; i < favoritos.length; i++) {
    if (favoritos[i].id === id) return true;
  }
  return false;
}

function alternarFavorito(pelicula) {
  var favoritos = obtenerFavoritos();
  var quedaComoFavorito = true;
  var restantes = [];

  $.each(favoritos, function (indice, favorito) {
    if (favorito.id === pelicula.id) {
      quedaComoFavorito = false;
    } else {
      restantes.push(favorito);
    }
  });

  if (quedaComoFavorito) {
    restantes.push({
      id: pelicula.id,
      primaryTitle: pelicula.primaryTitle,
      startYear: pelicula.startYear,
      averageRating: pelicula.averageRating,
      primaryImage: pelicula.primaryImage
    });
  }

  guardarFavoritos(restantes);
  actualizarContador();
  pintarModalFavoritos();
  return quedaComoFavorito;
}

function eliminarFavorito(id) {
  var restantes = [];
  $.each(obtenerFavoritos(), function (indice, favorito) {
    if (favorito.id !== id) restantes.push(favorito);
  });
  guardarFavoritos(restantes);
  actualizarContador();
  pintarModalFavoritos();
}

function actualizarContador() {
  $(".contador-favoritos").text(obtenerFavoritos().length);
}

function pintarModalFavoritos() {
  var favoritos = obtenerFavoritos();
  var $grid = $("#gridFavoritos");
  $grid.empty();

  if (favoritos.length === 0) {
    $grid.html(
      '<div class="col-12 text-center text-muted py-5">' +
        '<i class="bi bi-heart fs-1 d-block mb-3"></i>' +
        '<p class="mb-1">No tienes películas favoritas</p>' +
        '<p class="small mb-0">Agrega algunas desde la página de inicio</p>' +
      "</div>"
    );
    return;
  }

  $.each(favoritos, function (indice, pelicula) {
    var tarjeta =
      '<div class="col-12 col-sm-6 col-lg-4">' +
        '<div class="card h-100 border-0 shadow-sm">' +
          '<img src="' + (pelicula.primaryImage || SIN_IMAGEN) + '" class="card-img-top poster-favorito" alt="' + pelicula.primaryTitle + '">' +
          '<div class="card-body p-2">' +
            '<h6 class="fw-bold text-truncate mb-1" title="' + pelicula.primaryTitle + '">' + pelicula.primaryTitle + "</h6>" +
            '<div class="d-flex justify-content-between align-items-center mb-2">' +
              '<span class="text-muted small">' + oNA(pelicula.startYear) + "</span>" +
              '<span class="fw-bold small text-warning">' + oNA(pelicula.averageRating) + ' <i class="bi bi-star-fill"></i></span>' +
            "</div>" +
            '<div class="d-flex gap-2">' +
              '<a href="reseña.html?id=' + pelicula.id + '" class="btn btn-primary btn-sm flex-grow-1"><i class="bi bi-eye"></i> Ver</a>' +
              '<button type="button" class="btn btn-outline-danger btn-sm btn-quitar-favorito" data-id="' + pelicula.id + '" title="Eliminar de favoritos"><i class="bi bi-x-lg"></i></button>' +
            "</div>" +
          "</div>" +
        "</div>" +
      "</div>";
    $grid.append(tarjeta);
  });
}

$(document).ready(function () {
  actualizarContador();
  pintarModalFavoritos();

  $("#gridFavoritos").on("click", ".btn-quitar-favorito", function () {
    var id = $(this).data("id");
    eliminarFavorito(id);
    $(document).trigger("favoritosCambiaron", [id]);
  });

  $("#btnEliminarTodos").on("click", function () {
    if (obtenerFavoritos().length === 0) return;
    if (confirm("¿Deseas eliminar todas las películas favoritas?")) {
      guardarFavoritos([]);
      actualizarContador();
      pintarModalFavoritos();
      $(document).trigger("favoritosCambiaron");
    }
  });
});
