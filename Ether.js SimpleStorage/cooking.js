//! Preparar la noche de películas

//* Cocinar palomitas
//* Servir palomitas
//* Empezar película

async function setupMovieNight() {
  await cookPopcorn();
  await pourDrinks();
  startMovie();
}

function cookPopcorn() {
  return Promise();
}
