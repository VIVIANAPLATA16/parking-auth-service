import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
const spec = {"openapi":"3.0.0","components":{"schemas":{"RegisterRequest":{"type":"object","required":["email","password"],"properties":{"email":{"type":"string","format":"email","example":"usuario@parking.com"},"password":{"type":"string","minLength":6,"example":"123456"}}},"LoginRequest":{"type":"object","required":["email","password"],"properties":{"email":{"type":"string","format":"email","example":"usuario@parking.com"},"password":{"type":"string","example":"123456"}}},"RefreshRequest":{"type":"object","required":["refreshToken"],"properties":{"refreshToken":{"type":"string","example":"uuid-del-refresh-token"}}},"LogoutRequest":{"type":"object","required":["refreshToken"],"properties":{"refreshToken":{"type":"string","example":"uuid-del-refresh-token"}}}},"securitySchemes":{"BearerAuth":{"type":"http","scheme":"bearer","bearerFormat":"JWT","description":"Access token del /auth/login"}}},"info":{"title":"Parking Auth Service API","description":"Microservicio de autenticación centralizado — Parking International","version":"1.0.0"},"paths":{"/auth/register":{"post":{"summary":"Registrar usuario","description":"Crea un nuevo usuario con email y contraseña hasheada","operationId":"register","parameters":[],"tags":[],"requestBody":{"required":false,"description":"Credenciales del nuevo usuario","content":{"application/json":{"schema":{"$ref":"#/components/schemas/RegisterRequest"}}}},"responses":{"201":{"description":"Usuario creado exitosamente"},"409":{"description":"Email ya registrado"}}}},"/auth/login":{"post":{"summary":"Iniciar sesión","description":"Autentica un usuario y retorna access token (15 min) y refresh token (7 días)","operationId":"login","parameters":[],"tags":[],"requestBody":{"required":false,"description":"Credenciales del usuario","content":{"application/json":{"schema":{"$ref":"#/components/schemas/LoginRequest"}}}},"responses":{"200":{"description":"Tokens generados"},"401":{"description":"Credenciales inválidas"}}}},"/auth/refresh":{"post":{"summary":"Renovar access token","description":"Emite un nuevo access token usando el refresh token vigente","operationId":"refresh","parameters":[],"tags":[],"requestBody":{"required":false,"description":"Refresh token activo","content":{"application/json":{"schema":{"$ref":"#/components/schemas/RefreshRequest"}}}},"responses":{"200":{"description":"Nuevo access token"},"401":{"description":"Refresh token inválido o expirado"}}}},"/auth/logout":{"post":{"summary":"Cerrar sesión","description":"Invalida el refresh token activo del usuario","operationId":"logout","parameters":[],"tags":[],"requestBody":{"required":false,"description":"Refresh token a invalidar","content":{"application/json":{"schema":{"$ref":"#/components/schemas/LogoutRequest"}}}},"responses":{"200":{"description":"Sesión cerrada"},"404":{"description":"Token no encontrado"}}}},"/auth/me":{"get":{"summary":"Obtener perfil","description":"Retorna los datos del usuario autenticado. Requiere Authorization Bearer token","operationId":"me","parameters":[],"tags":[],"responses":{"200":{"description":"Datos del usuario"},"401":{"description":"Token inválido o no proporcionado"}},"security":[{"BearerAuth":[]}]}}},"servers":[{"url":"https://o4w7jpo7m4.execute-api.us-east-1.amazonaws.com","description":"AWS Lambda — dev"},{"url":"http://localhost:3001","description":"Local"}]};
export const swaggerUI = async (_event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  const html = `<!DOCTYPE html>
<html>
<head>
  <title>Parking Auth API — Docs</title>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui.min.css">
</head>
<body>
<div id="swagger-ui"></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui-bundle.min.js"></script>
<script>
  SwaggerUIBundle({
    spec: ${JSON.stringify(spec)},
    dom_id: '#swagger-ui',
    presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
    layout: "BaseLayout",
    deepLinking: true
  });
</script>
</body>
</html>`;
  return { statusCode: 200, headers: { 'Content-Type': 'text/html' }, body: html };
};