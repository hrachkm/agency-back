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
