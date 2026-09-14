var peliculaActual = null;

$(document).ready(function () {

  cargarDetalle();

  $("#btnFavoritoDetalle").on("click", function () {
    if (!peliculaActual) return;
    alternarFavorito(peliculaActual);
    pintarBotonFavorito();
  });

  $(document).on("favoritosCambiaron", function () {
    pintarBotonFavorito();
  });

  $("#btnReintentar").on("click", function () {
    cargarDetalle();
  });
});

function obtenerIdDeLaUrl() {
  return new URLSearchParams(window.location.search).get("id");
}

function cargarDetalle() {
  var id = obtenerIdDeLaUrl();

  $("#detalle").addClass("d-none");
  $("#mensajeError").addClass("d-none");
  $("#spinner").show();

  if (!id) {
    mostrarError("No se indicó ninguna película en la dirección (?id=tt0111161).");
    return;
  }

  $.ajax({
    url: API_TITULO + id,
    method: "GET",
    headers: API_HEADERS,
    dataType: "json",
    timeout: 8000
  })
    .done(function (datos) {
      mostrarDetalle(datos);
    })
    .fail(function () {
      buscarEnArchivo(id);
    });
}

function buscarEnArchivo(id) {
  $.getJSON(ARCHIVO_JSON)
    .done(function (datos) {
      var encontrada = null;
      $.each(datos, function (indice, pelicula) {
        if (pelicula.id === id) {
          encontrada = pelicula;
          return false;
        }
      });

      if (encontrada) {
        mostrarDetalle(encontrada);
      } else {
        mostrarError("No se encontró información de la película solicitada.");
      }
    })
    .fail(function () {
      mostrarError("No se pudo obtener la información de la película.");
    });
}

function mostrarError(texto) {
  $("#spinner").hide();
  $("#textoError").text(texto);
  $("#mensajeError").removeClass("d-none").hide().fadeIn(400);
}

function mostrarDetalle(pelicula) {
  peliculaActual = pelicula;
  document.title = "MovieReviews · " + pelicula.primaryTitle;

  $("#imagen").attr("src", pelicula.primaryImage || SIN_IMAGEN).attr("alt", pelicula.primaryTitle);
  $("#titulo").text(pelicula.primaryTitle);

  $("#metaDatos").html(
    '<i class="bi bi-calendar3"></i> ' + oNA(pelicula.startYear) +
    ' &nbsp;|&nbsp; <i class="bi bi-clock"></i> ' + (pelicula.runtimeMinutes ? pelicula.runtimeMinutes + " min" : "N/A") +
    ' &nbsp;|&nbsp; <i class="bi bi-film"></i> ' + oNA(pelicula.contentRating)
  );

  $("#calificacion").html(
    '<span class="fs-3 fw-bold text-warning">' + (pelicula.averageRating ? pelicula.averageRating.toFixed(1) : "N/A") + "</span>" +
    pintarEstrellas(pelicula.averageRating) +
    '<span class="text-muted small">(' + formatearNumero(pelicula.numVotes) + " votos)</span>"
  );

  if (pelicula.metascore) {
    var color = "bg-danger";
    if (pelicula.metascore >= 70) {
      color = "bg-success";
    } else if (pelicula.metascore >= 50) {
      color = "bg-warning";
    }
    $("#metascoreValor").text(pelicula.metascore + " / 100");
    $("#metascoreBarra").removeClass("bg-success bg-warning bg-danger").addClass(color)
      .css("width", pelicula.metascore + "%");
    $("#bloqueMetascore").removeClass("d-none");
  } else {
    $("#bloqueMetascore").addClass("d-none");
  }

  $("#generos").html(pintarBadges(pelicula.genres, "text-bg-primary"));
  $("#intereses").html(pintarBadges(pelicula.interests, "text-bg-secondary"));

  $("#sinopsis").text('"' + (pelicula.description || "Sin sinopsis disponible.") + '"');

  var idiomas = listaLegible(pelicula.spokenLanguages, "language");
  var paises = listaLegible(pelicula.countriesOfOrigin, "region");
  var productoras = "N/A";
  if (pelicula.productionCompanies && pelicula.productionCompanies.length > 0) {
    productoras = $.map(pelicula.productionCompanies, function (empresa) {
      return empresa.name;
    }).join(", ");
  }

  var $datos = $("#datos").empty();
  $datos.append(crearDato("Idiomas", idiomas));
  $datos.append(crearDato("Países", paises));
  $datos.append(crearDato("Clasificación", oNA(pelicula.contentRating)));
  $datos.append(crearDato("Presupuesto", formatearDinero(pelicula.budget)));
  $datos.append(crearDato("Recaudación", formatearDinero(pelicula.grossWorldwide)));
  $datos.append(crearDato("Productoras", productoras));

  if (pelicula.trailer) {
    $("#btnTrailer").attr("href", pelicula.trailer).removeClass("d-none");
  } else {
    $("#btnTrailer").addClass("d-none");
  }

  var $enlaces = $("#enlaces").empty();
  if (pelicula.externalLinks && pelicula.externalLinks.length > 0) {
    $.each(pelicula.externalLinks, function (indice, enlace) {
      var dominio = enlace.replace(/^https?:\/\//, "").split("/")[0];
      $enlaces.append('<a href="' + enlace + '" target="_blank" rel="noopener"><i class="bi bi-box-arrow-up-right"></i> ' + dominio + "</a>");
    });
    $("#bloqueEnlaces").removeClass("d-none");
  } else {
    $("#bloqueEnlaces").addClass("d-none");
  }

  pintarBotonFavorito();

  $("#spinner").hide();
  $("#detalle").removeClass("d-none").hide().fadeIn(600);
}

function crearDato(etiqueta, valor) {
  return (
    '<div class="col-6 col-lg-4">' +
      '<p class="dato-titulo mb-0">' + etiqueta + "</p>" +
      '<p class="fw-semibold small mb-0">' + valor + "</p>" +
    "</div>"
  );
}

function pintarBadges(lista, clase) {
  if (!lista || lista.length === 0) return '<span class="text-muted small">N/A</span>';
  return $.map(lista, function (elemento) {
    return '<span class="badge rounded-pill ' + clase + ' me-1 mb-1">' + elemento + "</span>";
  }).join("");
}

function listaLegible(lista, tipo) {
  if (!lista || lista.length === 0) return "N/A";
  return $.map(lista, function (codigo) {
    return nombreLegible(codigo, tipo);
  }).join(", ");
}

function pintarBotonFavorito() {
  if (!peliculaActual) return;
  var $boton = $("#btnFavoritoDetalle");

  if (esFavorito(peliculaActual.id)) {
    $boton.removeClass("btn-outline-danger").addClass("btn-danger")
      .html('<i class="bi bi-heart-fill"></i> Favorito');
  } else {
    $boton.removeClass("btn-danger").addClass("btn-outline-danger")
      .html('<i class="bi bi-heart"></i> Favorito');
  }
}
