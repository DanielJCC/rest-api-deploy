const express = require('express')
const crypto = require('node:crypto')
const movies = require('./movies.json')
const cors = require('cors')
const { validateMovie, validatePartialMovie } = require('./schemas/movies')

const app = express()
app.use(cors({
  origin: (origin, callback) => {
    const ACCEPTED_ORIGINS = [
      'http://localhost:8000',
      'http://localhost:5500',
      'http://127.0.0.1:5500',
      'https://rutago.netlify.app',
      'https://midu.dev'
    ]

    if (ACCEPTED_ORIGINS.includes(origin)) {
      return callback(null, true)
    } if (!origin) {
      return callback(null, true)
    }
    return callback(new Error('Not allowed by CORS'))
  }
}))
app.disable('x-powered-by')
app.use(express.json())

// métodos normales: GET/HEAD/POST
// métodos complejos: PUT/PATCH/DELETE

// En los métodos complejos existe lo siguiente
// CORS PRE-Flight
// Cuando haces una petición utilizando los métodos complejos, requiere una petición especial llamada
// OPTIONS

// Todos los recursos que sean movies se identifican con /movies
app.get('/movies', (req, res) => {
  // const origin = req.header('origin') // Recuperar Origin
  // // Si la petición es del mismo origin, el navegador no te manda esta header
  // if (ACCEPTED_ORIGINS.includes(origin)) {
  //   res.header('Access-Control-Allow-Origin', origin)
  // }

  const { genre } = req.query
  if (genre) {
    const filteredMovies = movies.filter(
      //  movie => movie.genre.includes(genre)
      // Para evitar ser Case Sensitive
      movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
    )
    return res.json(filteredMovies)
  }
  res.json(movies)
})
app.get('/movies/:id', (req, res) => { // path to regexp
  const { id } = req.params
  const movie = movies.find(movie => movie.id === id)
  if (movie) return res.json(movie)
  res.status(404).json({ message: 'Movie not found' })
})

app.post('/movies', (req, res) => {
  const result = validateMovie(req.body)
  // También se puede colocar el código 422 Unprocessable Entity
  if (result.error) {
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }
  const newMovie = {
    id: crypto.randomUUID(), // Creación de un UUID aleatorio a través de modulo nativo de Node
    ...result.data
  }
  // Esto no sería REST, porque estamos guardando el estado de la app en memoria
  movies.push(newMovie)
  res.status(201).json(newMovie) // actualizar la cache del cliente
})

app.delete('/movies/:id', (req, res) => {
  // const origin = req.header('origin') // Recuperar Origin
  // // Si la petición es del mismo origin, el navegador no te manda esta header
  // if (ACCEPTED_ORIGINS.includes(origin)) {
  //   res.header('Access-Control-Allow-Origin', origin)
  // }
  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id)

  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Movie not found' })
  }

  const movieDeleted = movies.splice(movieIndex, 1)

  return res.json(movieDeleted)
})

app.patch('/movies/:id', (req, res) => {
  const result = validatePartialMovie(req.body)
  if (!result.success) return res.status(400).json({ error: JSON.parse(result.error.message) })

  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id)

  if (movieIndex < 0) return res.status(404).json({ message: 'Movie not found' })

  const updateMovie = {
    ...movies[movieIndex], // todo lo que tenemos en la movie con indice movieIndex ej: director, year, etc
    ...result.data // todo lo que tenemos en result.data. Si tiene year, lo reemplaza
  }
  movies[movieIndex] = updateMovie

  return res.json(updateMovie)
})
// app.options('/movies/:id', (req, res) => {
//   const origin = req.header('origin') // Recuperar Origin
//   // Si la petición es del mismo origin, el navegador no te manda esta header
//   if (ACCEPTED_ORIGINS.includes(origin)) {
//     res.header('Access-Control-Allow-Origin', origin)
//     res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE') // Métodos que puede utilizar
//   }
//   res.send()
// })

const PORT = process.env.PORT ?? 3000

app.listen(PORT, () => {
  console.log(`server listaning on port http://localhost:${PORT}`)
})
