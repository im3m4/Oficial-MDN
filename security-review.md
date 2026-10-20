# Revisión privada de seguridad — 14 de octubre de 2026

Proyecto: xmedyna.com. Base revisada: 9d51ab7d6b767bacfc73d9c2a06a1e112999e8e7 (versión 55).

## Correcciones

- Notificaciones: restringir destinos a servicios push conocidos, validar claves, impedir redirecciones y limitar esperas. La comprobación también se aplica a suscripciones guardadas antes de esta revisión.
- Respuestas: política CSP con bloqueo de incrustación, objetos, bases y destinos de formulario ajenos; X-Frame-Options; mantener HTTPS, nosniff y protección de referencias. La política cubre las respuestas de aplicación, biografía e imágenes.
- APIs: impedir almacenamiento en caché de todas las respuestas API, incluidos errores de autorización. Límite de 64 KiB para operaciones editoriales y límites por IP para preferencias y medición de visitas.
- Sesiones: cookie __Host- con Secure, HttpOnly y SameSite=Strict; validar tipos, caducidad y tamaño; rechazar sesiones si falta el secreto. Las sesiones anteriores necesitan volver a autenticarse.
- Dependencias: actualizaciones parcheadas de React y sus funciones de servidor, Vinext, Vite y herramientas Workers. Overrides específicos para esbuild y fflate. Declaraciones oficiales de Workers para comprobación de tipos.

## Resultado de auditoría de paquetes

npm audit pasa de 30 paquetes afectados (23 altos, 6 moderados, 1 bajo) a 7 altos. Los siete provienen del mismo aviso de braces <=3.0.3: GHSA-vfj7-8cjw-p6xm. No existe versión parcheada publicada de braces en el registro consultado. Sus consumidores son herramientas de análisis de archivos y compilación (fast-glob, micromatch, los plugins CommonJS y el plugin de ESLint); no se debe equiparar este recuento con siete vulnerabilidades explotables en producción. Se conserva el aviso y no se degradan herramientas para ocultarlo.

## Alcance y límites

Pruebas de firmas y caducidad, destinos SSRF, límites de cuerpos, origen de solicitudes, acceso administrativo anónimo y renderizado de rutas existentes. Las pruebas de renderizado en Node usan un adaptador explícito sin base de datos ni secretos; no prueban un acceso administrativo real ni el envío efectivo de push.

La CSP permite scripts y estilos inline por compatibilidad con el renderizador actual. No equivale a protección completa ante XSS. No se ha realizado una prueba de penetración exhaustiva ni se ha auditado toda la infraestructura del proveedor. Esta nota permanece en el repositorio privado y no añade detalles internos a las páginas públicas.
