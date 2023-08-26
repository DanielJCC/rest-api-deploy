const z = require('zod')
// ZOD: Es una manera más rápida y eficaz de validar los tipos de datos del body

const movieSchema = z.object({
  title: z.string({
    invalid_type_error: 'Movie title must be a string',
    required_error: 'Movie title is required'
  }),
  year: z.number().int()/* .positive() */.min(1900).max(2024),
  duration: z.number().int().positive(),
  rate: z.number().min(0).max(10),
  poster: z.string().url({
    message: 'Poster must be a valid URL'
  })/* .endsWith('.jpg') */,
  genre: z.array(
    z.enum(['Action', 'Adventure', 'Comedy', 'Romance', 'Drama', 'Fantasy', 'Horror', 'Thriller', 'Sci-Fi']),
    {
      required_error: 'Movie genre is required',
      invalid_type_error: 'Movie genre must be an array of enum Genre'
    }
  )
})

function validateMovie (object) {
  return movieSchema.safeParse(object)
}

function validatePartialMovie (object) {
  return movieSchema.partial().safeParse(object)
  // partial(): Esto va a ser que las propiedades sean opcionales, pero si está la valida
}

module.exports = {
  validateMovie,
  validatePartialMovie
}
