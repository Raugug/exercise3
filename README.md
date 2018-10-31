# Ejercicio 1

## Introducción

A lo largo del bootcamp vamos a ir trabajando en un proyecto que iremos extendiendo a medida que vayamos aprendiendo cosas.
El proyecto consiste en un montar un sencillo sistema de envío de mensajes.
Como toda la logística que implica realmente _entregar_ los mensajes es compleja y queda fuera del ámbito de este bootcamp,
haremos uso de un servicio externo, `messageapp`, que nos abstraerá de toda esta complejidad.

En este primer ejercicio montaremos un API muy sencilla que interactúe con este servicio externo, que tenemos disponible como una image de docker.

###  1 - Clonar el repo y levantar messageapp

Como podemos ver en el repo, además de las instrucciones del ejercicio, tenemos un fichero `docker-compose.yml`.
Este fichero contiene las instrucciones para poder montar el sistema distribuído que necesitamos para el ejercicio.

Si nos fijamos en el fichero, tiene una parte comentada (las líneas que comienzan con `#`),
estas líneas las descomentaremos más adelante, inicialmente vamos a levantar solo el servicio `messageapp`.

Para ello, basta con ejecutar:

```sh
$ docker-compose up
```

Veremos cómo se descarga la imagen y se lanza el contenedor con el servicio.
Cuando el servicio esté arrancado, podremos ver que el servicio funciona realizando una petición con POSTMAN o cURL con las siguientes opciones:

```
HOST 'localhost'
PORT 3000
POST '/message'
'Content-Type': 'application/json',
{
  "destination": "STRING"
  "body": "STRING"
}
```

### 2 - Crear el servicio

Queremos crear un nuevo servicio que, internamente, hará uso de `messageapp`.
Inicialmente la funcionalidad será muy parecida a la que ya ofrece el servicio externo, pero iremos añadiendo más complejidad a lo largo del bootcamp.

En este apartado, vamos simplemente a construir un _hola, mundo_ para comprobar que todo funciona.
Los pasos a seguir son:

- Implementar servicio en JavaScript, con NodeJS y Express. El servicio debe escuchar en el puerto 9001 y responder a un endpoint con "Hola, mundo".
- Definir el servicio para poder ejecutarlo como un contenedor, para lo que habrá que crear un `Dockerfile` con la descripción de la imagen.
- Descomentar las líneas comentadas en el [docker-compose.yml](docker-compose.yml), y validar que podemos levantar el sistema con docker compose y todo funciona.

Es conveniente separar la parte de construir el sistema (`docker-compose build`) de la parte de levantarlo (`docker-compose up`)


### 3 - Crear el módulo cliente

En este apartado vamos a construir un módulo de NodeJS que nos encapsule las peticiones al servicio `messageapp`.
Esto nos facilitará mantener el código en el futuro, ya que si cambia el API de `messageapp` solo habrá que actualizar este módulo.

Este módulo recibirá a la entrada un destino y un cliente, llamará al API de `messageapp` y devolverá el resultado de la petición.
El tipo de interfaz que debe ofrecer el módulo no está definido, cada cuál puede diseñar la interfaz como prefiera.

Se puede escribir también un pequeño programa cliente que haga uso de este módulo, para validar su funcionamiento, o añadirle tests, a criterio del implementador.

### 4 - Exponer el api de forma pública

En este apartado queremos ofrecer a nuestros clientes la capacidad de enviar mensajes.
Para esto necesitaremos crear con express un nuevo endpoint donde ellos puedan decirnos qué mensaje y a quién va a enviarse.

Este endpoint de nuestro servicio tendrá la siguiente forma:

```
HOST 'localhost'
PORT 9001
POST '/messages'
'Content-Type': 'application/json'
{
  "destination": "STRING"
  "message": "STRING"
}
```

Como se puede observar, se trata del mismo API que ofrece `messageapp`, de momento hemos construído, simplemente un proxy del servicio externo.

### 5 - Control de errores

No todo funciona siempre bien. A lo largo del ejercicio habréis podido comprobar que a veces el servicio de mensajería tarda bastante, y a veces devuelve un error.
Nunca sabremos si los servicio externos van a funcionar como esperamos, o van a estar activos al 100%.
Por esta razón debemos de tener un control de errores y saber cómo actuar.

En este apartado vamos a empezar a gestionar estos errores, de manera muy sencilla de momento.
Actualmente tenemos 2 componentes en el sistema, y cualquiera de los 2 puede fallar (sí, también nuestro servicio puede fallar, por errores de programación, inconsistencias de datos, etc.)
Para indicar los errores utilizaremos los códigos de estado, por lo que debemos asegurarnos que nuestro servicio devuelve:

- HTTP status 200 cuando todo ha sido correcto, y el mensaje se ha enviado correctamente
- HTTP status 500 si bien la llamada al servicio externo `messageapp` o nuestro propio servicio ha fallado.

Opcionalmente, podemos devolver un mensaje de error en la respuesta, indicando el tipode fallo que se ha producido.
