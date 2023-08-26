# Curso de Midu parte 3
En esta parte se habla del error CORS y sobre REST API

## Rest API
Representational State Transfer (REST), es una arquitectura de software. Se ha utilizado mayormente para desarrollar APIs. Los principios en que se basan REST son los siguientes:
* Escalabilidad
* Portabilidad
* Simplicidad
* Visibilidad
* Modificalidad
* Fiabilidad
### Fundamentos de Rest
Se debe tener en cuenta que Recursos son colecciones de entidades, entidades, listas, entre otros.
* **Recursos**: Cada recurso se identifica con una URL
* **Verbos HTTP**: Para definir las operaciones que se pueden realizar con los recursos
* **Representaciones**: JSON, XML, HTML, etc. El cliente debería poder recibir la representación del recurso. 
* **Stateless**: Que cada solicitud que se hace al servidor debe contener toda la info necesaria para entender esa solicitud. El cliente debe enviar toda la información necesaria para procesar la request
* **Interfaz uniforme**: Que las URLs siempre tienen que hacer lo mismo y se tienen que llamar igual
* **Separación de conceptos**: Los componentes del cliente y servidor están separados entre si. Permiten que cliente y servidor evolucionen de manera separada. 

### POST, PUT y PATCH
* **POST**: Crear un nuevo elemento/recurso en el servidor. NO ES IDEMPOTENTE porque creas siempre un nuevo recurso
* **PUT**: Actualizar totalmente un elemento ya existente o crearlo si no existe. SI ES IDEMPOTENTE, el resultado siempre será el mismo
* **PATCH**: Actualizar parcialmente un elemento/recurso. Normalmente ES IDEMPOTENTE, PERO puede depender, si tienes un updateAt 

## CORS y ERROR DE CORS
Cross Origin Resource Sharing
Es un mecanismo importante que solo funciona en el navegador. Es un mecanismo que restrige si ese recurso lo puedes utilizar en un origen y es algo que hacen los navegadores. Es un mecanismo que te permite que un recurso sea restringido en una página web para evitar que un origen o un dominio fuera de otro dominio desde el cual se sirvio ese recurso pueda acceder.  
Este error se tiene que arreglar en la parte del backend. Lo que hay que añadir es una cabecera para poder permitir esto y que se solucione el error de CORS
### Soluciones
* ***res.header('Access-Control-Allow-Origin', '*')***: Permite que todos los origenes que no sean el propio origen, están permitidos.
* ***res.header('Access-Control-Allow-Origin', 'http://localhost:port')***
### CORS-Preflight
Es el error cuando se utilizan los métodos HTTP complejos, los cuales son PUT/PATCH/DELETE.
Cuando se realizan estos métodos HTTP complejos, el backend requiere una petición especial llamada OPTIONS, por lo que se necesita realizar lo siguiente:
```javascript
app.options('/movies/:id', (req, res) => {
  const origin = req.header('origin') // Recuperar Origin
  // Si la petición es del mismo origin, el navegador no te manda esta header
  if (ACCEPTED_ORIGINS.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin)
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE') // Métodos que puede utilizar
  }
  res.send()
})
```
En este caso el Origin es el link el lugar desde el cual estás realizando el método HTTP

### Middelware CORS
Para utilizar este middelware se necesita instalarlo a través de ***npm*** de la siguiente manera:
*npm install cors -E* 
Esto lo arregla, llamando al paquete en el código de la siguiente manera: 
```javascript
app.use(cors())
```
Pero hay que tener cuidado, ya que esto lo que hace es que soluciona **PERO** coloca el asterisco a la cabecera de ***Access-Control-Allow-Origin***. Permite que puedan hacer todo desde cualquier lugar, no es lo que se quiere. 
Por lo que hay que hacer lo siguiente:
```javascript
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
```

## Despligue de la API (Deploy)
Este es el repositorio de despligue de la API que se realizó en la clase 3. Datos importantes:
* Tener como puerto ***process.env.PORT***
* Crear el archivo ***.gitignore*** y en este escribimos que git va a ignorar la carpeta node_modules

## NOTAS DE LA CLASE
*Anotación: todas las APIs no tienen que ser JSON*
*Endpoint: es un path en donde tenemos un recurso*
*En express se pueden colocar rutas que sean Expresiones regulares*
*UUID: Identificador Unico Universal*
*Idempotencia: Propiedad de realizar una acción determinada varias veces y aún así conseguir siempre el mismo resultado que se obtendría al hacerlo una vez