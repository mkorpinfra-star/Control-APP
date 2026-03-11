# FIX CRÍTICO: Error 500 en my-obras.php

## Problema identificado

El error 500 en `my-obras.php` se debía a **2 problemas**:

1. **Función faltante**: `authMiddleware()` no existía en `backend/includes/auth.php`
2. **Base URL incorrecta**: Vite estaba configurado con `base: '/login/'` causando URLs incorrectas

## Archivos modificados

### 1. `backend/includes/auth.php` ✅
**Agregadas 2 funciones nuevas:**

```php
/**
 * Middleware de autenticación - valida token y retorna usuário ou encerra com erro 401
 */
function authMiddleware() {
    $user = validateToken();

    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized', 'message' => 'Token inválido ou ausente']);
        exit;
    }

    return $user;
}

/**
 * Middleware que exige role específica
 */
function requireRole($requiredRoles) {
    $user = authMiddleware();

    $roles = is_array($requiredRoles) ? $requiredRoles : [$requiredRoles];

    if (!in_array($user['tipo'], $roles)) {
        http_response_code(403);
        echo json_encode(['error' => 'Forbidden', 'message' => 'Acesso negado']);
        exit;
    }

    return $user;
}
```

### 2. `vite.config.js` ✅
**Corregido el base URL:**

```javascript
export default defineConfig({
  base: '/',  // Cambiado de '/login/' a '/'
  plugins: [react(), tailwindcss()],
})
```

## Archivos para subir al servidor

### 📁 BACKEND (subir a raíz del servidor)

```
backend/includes/auth.php  → Reemplazar archivo existente
```

### 📁 FRONTEND (subir a /login/)

**IMPORTANTE:** Reemplazar TODO el contenido de `/login/` con:

```
dist/index.html
dist/assets/index-BNLXlbq_.js
dist/assets/index-VvxatnZD.css
```

## Verificación

Después de subir los archivos:

1. **Vaciar cache del navegador** (Ctrl+Shift+Del)
2. **Probar en navegador privado/incógnito**
3. **Acceder a:** `https://j2s.ad/login/timesheet`
4. **Verificar que carga las obras** en el dropdown

## URLs correctas ahora

✅ **CORRECTO:**
- `https://j2s.ad/backend/api/obras/my-obras.php`
- `https://j2s.ad/backend/api/apontamentos/my-week.php`

❌ **INCORRECTO (antes):**
- ~~`https://j2s.ad/login/backend/api/obras/my-obras.php`~~

## Causa raíz

El archivo `vite.config.js` tenía `base: '/login/'` lo que hacía que Vite generara todos los assets con prefijo `/login/`. Esto causaba que cuando el usuario accedía desde `https://j2s.ad/login/`, los URLs relativos como `/backend/api` se resolvían como `/login/backend/api`.

**Solución:** Cambiar a `base: '/'` para que todos los URLs se resuelvan desde la raíz del dominio.
