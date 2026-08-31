# Arquitectura
- Se utilizo la arquitectura tipo monolito y la programacion modular para separar las responsabilidades donde:
    - Los controladores se encargan de implementar los endpoint para comunicarse con una aplicacion externa
    - Los guardianes se encargan de validar la estrategia de token, validar que un usuario no inicie sesion varias veces seguidas y restringir el acceso a los endpoints.
    - Decoradores personalizados que se usan para extraer la informacion del token de acceso e indicar al guardian si la ruta es publica.
    - Se implementaron DTO para definir el modelo de datos que debe recibirse para su procesamiento, de lo contrario devolveran excepciones 404 indicando los errores cometidos.
    - Los servicios se encargan de hacer validaciones de seguridad para evitar la insercion innecesaria o la modificacion de datos no autorizada
- Se utilizo type orm para manipular la base de datos de postgres ya que es compatible con la sintaxis de typescript y ofrece metodos eficaces para realizar muchas consultas de utilidad.

# Importante
- Se implemento CORS estricto, por lo tanto es importante que se indique el origen de los datos para que este sea autorizado.

# Validacion de reglas de estado

Algunas se colocaron a nivel de servicio como por ejemplo que un usuario no pueda manipular un registro que no es suyo, tambien un conflicto con el cambio de estado o validar la existencia del registro ya que es lo mas ideal al tener comunicacion directa con la base de datos, esto es eficaz ya que facilita la deteccion y correccion de errores.

Otras se agregaron a nivel del DTO ya que es responsabilidad de este validar que los datos que entren al servidor sean correctos.

Otras se agregaron a nivel de guardianes como es la validacion del token de acceso.

# Garantia de privacidad

Al momento de modificar o eliminar datos, primero se valida que el usuario tenga el mismo id que aparece en el registro, en el caso de usuarios se valida el id y en el caso de inmuebles o propiedades se valida el sellerId, si este es diferente, entonces lanza una excepcion y se aborta la operacion.

# Token

Actualmente el token se guarda en una cookie CSRF con la finalidad de que no se pueda acceder directamente desde javascript, ademas esta forma tiene una modalidad eficaz de proteger los datos de usuario al requerir un token CSRF para poder hacer cualquier peticion y ademas solicita un access token y un refresh token para garantizar el acceso.

# Deuda tecnica

Debido al limite de tiempo no agregue la funcionalidad de carga de imagenes tanto para usuarios como para inmuebles ya que si lo hago directamente en el servidor, esto puede disminuir el rendimiento de la app y tendria que configurar una cuenta en firebase o cualquier almacenamiento en la nube para imagenes que no tenga costo alguno.
