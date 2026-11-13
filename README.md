# TalentMatch AI — Frontend

> Proyecto desarrollado para el bootcamp **AI For Devs** de Kodigo.

TalentMatch AI es una plataforma de *job matching* asistida por IA. Conecta a reclutadores y candidatos mediante análisis semántico de currículums y vacantes. Este repositorio contiene la aplicación cliente multiplataforma (Android, iOS y web), construida con Expo y React Native.

La aplicación tiene dos espacios de trabajo:

| Espacio | ¿Requiere cuenta? | Qué permite |
| --- | --- | --- |
| **Portal Candidato** | No | Subir un CV y una vacante, recibir una puntuación de compatibilidad y sugerencias para optimizar el currículum. |
| **Portal Reclutador** | Sí | Panel de resumen, ranking y pipeline de candidatos, análisis profundo de cada match y calibración de los pesos del modelo. |

---

## Índice

- [Especificaciones](#especificaciones)
- [Stack y librerías](#stack-y-librerías)
- [Arquitectura](#arquitectura)
- [Instalación](#instalación)
- [Variables de entorno](#variables-de-entorno)
- [Scripts disponibles](#scripts-disponibles)
- [Autenticación](#autenticación)
- [Sistema de diseño](#sistema-de-diseño)
- [Convenciones de contribución](#convenciones-de-contribución)

---

## Especificaciones

### Funcionalidades

- **Panel candidato** (`/match`): carga de CV, descripción de la vacante, puntuación global de compatibilidad, desglose por competencias y recomendaciones.
- **Panel reclutador** (`/portal`): métricas de vacantes, candidatos, entrevistas y tiempo de cobertura, actividad reciente e historial de CVs.
- **Ranking & Pipeline** (`/pipeline`): listado de candidatos ordenado por compatibilidad y estado del proceso.
- **Análisis profundo Match** (`/review`): explicación detallada de por qué un candidato encaja con la vacante y qué le falta.
- **Ajustes y preferencias** (`/settings`): pesos del algoritmo, umbral de corte, políticas de anonimización y apariencia (sistema, claro u oscuro).
- **Autenticación de reclutadores** (`/sign-in`, `/sign-up`): inicio de sesión y registro con Better Auth.

Todos los datos vienen del [backend](https://github.com/Kodis-AI/job-match-platform-backend): la API FastAPI (análisis con IA, vacantes, ranking y ajustes) y el servidor Better Auth (cuentas de reclutador).

### Requisitos no funcionales

- **Multiplataforma**: el mismo código corre en Android, iOS y web.
- **Totalmente adaptable** (*responsive*), verificado de 320 px a 1440 px:
  - `< 560 px`: diseño compacto, con barra de pestañas inferior y títulos cortos.
  - `≥ 900 px`: diseño ancho; el login muestra dos columnas.
  - `≥ 1200 px`: diseño de escritorio, con barra de navegación lateral.
- **Tema claro y oscuro**: por defecto sigue el modo del sistema; se puede cambiar desde Ajustes.
- **Accesibilidad**:
  - Contraste de texto de al menos 4.5:1 y áreas táctiles de 44 px o más.
  - Etiquetas visibles en los formularios y errores anunciados a los lectores de pantalla.
  - Foco visible en todos los controles.
- **Seguridad**:
  - Las rutas del reclutador están protegidas en el cliente, y la API valida el JWT de la sesión en cada endpoint del reclutador.
  - En nativo, la sesión se guarda en `expo-secure-store`.

---

## Stack y librerías

| Categoría | Librería | Versión | Uso |
| --- | --- | --- | --- |
| Framework | [Expo](https://docs.expo.dev/) | SDK 58 | Toolchain, módulos nativos y build |
| UI | [React Native](https://reactnative.dev/) | 0.88 | Componentes nativos |
| UI | [React](https://react.dev/) | 19.3 | Librería de UI (React Compiler activo vía lint) |
| Web | `react-native-web`, `react-dom` | 0.21 / 19.3 | Render en navegador |
| Navegación | [Expo Router](https://docs.expo.dev/router/introduction/) | 58 | Enrutado basado en archivos, pestañas y rutas protegidas |
| Navegación | `react-native-screens`, `react-native-safe-area-context` | — | Pantallas nativas y áreas seguras |
| Autenticación | [Better Auth](https://www.better-auth.com/) + `@better-auth/expo` | 1.7 | Cliente de autenticación (email y contraseña) |
| Datos | [TanStack Query](https://tanstack.com/query) | 5 | Peticiones a la API, caché, estados de carga y sondeo del análisis |
| Archivos | `expo-document-picker` | 58 | Selección de currículums (PDF, DOCX, TXT) |
| Portapapeles | `expo-clipboard` | 58 | Copiar sugerencias y preguntas de entrevista |
| Almacenamiento | `expo-secure-store` | 58 | Sesión cifrada en el dispositivo |
| Red | `expo-network` | 58 | Requerido por el cliente Expo de Better Auth |
| Tipografía | `@expo-google-fonts/poppins`, `@expo-google-fonts/open-sans` | 0.4 | Títulos (Poppins) y cuerpo (Open Sans) |
| Iconos | `@react-native-vector-icons/lucide` | 14 | Iconografía Lucide |
| Gráficos | `react-native-svg` | 15 | Anillos de progreso y gráficos vectoriales |
| Sistema | `expo-font`, `expo-splash-screen`, `expo-status-bar`, `expo-linking`, `expo-constants` | 58 | Fuentes, splash, barra de estado y deep links |
| Calidad | ESLint + `eslint-config-expo` | 9 / 58 | Linting y reglas del React Compiler |

---

## Arquitectura

### Estructura de carpetas

```
job-match-platform-frontend/
├── app.json                  # Configuración de Expo (scheme "matchai", plugins)
├── .env.example              # Plantilla de variables de entorno
├── design-system/matchai/
│   └── MASTER.md             # Fuente de verdad del sistema de diseño
└── src/
    ├── app/                  # Rutas (Expo Router): cada archivo es una pantalla
    │   ├── _layout.js        # Raíz: fuentes, tema, AuthProvider y Stack
    │   ├── index.js          # Redirige a /portal o /sign-in según la sesión
    │   ├── (auth)/           # Grupo público de autenticación
    │   │   ├── sign-in.js
    │   │   └── sign-up.js
    │   └── (tabs)/           # Navegador de pestañas (inferior o lateral)
    │       ├── _layout.js    # Pestañas + Tabs.Protected para el reclutador
    │       ├── match.js      # Candidato (público)
    │       ├── portal.js     # Reclutador (protegido)
    │       ├── pipeline.js   # Reclutador (protegido)
    │       ├── review.js     # Reclutador (protegido)
    │       └── settings.js
    ├── screens/              # Implementación de cada pantalla
    │   └── auth/             # SignInScreen, SignUpScreen
    ├── components/           # Componentes reutilizables (Button, TextField, Badge…)
    │   └── auth/             # AuthLayout, AuthLink
    ├── context/              # AuthContext (sesión) y PortalContext (espacio activo)
    ├── lib/
    │   ├── api/              # Capa de datos
    │   │   ├── client.js     # fetch con el JWT de la sesión y errores en español (ApiError)
    │   │   ├── queries.js    # Hooks de TanStack Query: un hook por recurso o acción
    │   │   └── files.js      # Selector de currículums y armado del multipart
    │   ├── auth/             # Capa de autenticación
    │   │   ├── index.js
    │   │   ├── betterAuthClient.js
    │   │   ├── errors.js     # Códigos de Better Auth → mensajes en español
    │   │   ├── validation.js # Validación de formularios
    │   │   └── redirect.js   # Lista blanca de rutas de retorno
    │   └── applicationStatus.js  # Estado visible de una candidatura
    ├── theme/                # Tokens de color, tipografía, espaciado y ThemeProvider
    └── utils/                # Avisos multiplataforma y formato (fechas, tamaños, iniciales)
```

Los archivos de `src/app/` solo reexportan pantallas de `src/screens/`. Así la lógica de UI queda separada del enrutado, y el código que no es una ruta nunca vive dentro de `src/app/`.

> El punto de entrada es `expo-router/entry` (campo `main` de `package.json`); no hay `App.js`.

### Navegación y protección de rutas

```
                     ┌──────────────┐
                     │  / (index)   │
                     └──────┬───────┘
              con sesión    │    sin sesión
          ┌─────────────────┴────────────────┐
          ▼                                  ▼
 ┌──────────────────┐               ┌──────────────────┐
 │ (tabs)           │               │ (auth)           │
 │  /match  público │◀──"continuar──│  /sign-in        │
 │  /portal    🔒   │   sin cuenta" │  /sign-up        │
 │  /pipeline  🔒   │               └──────────────────┘
 │  /review    🔒   │──── sin sesión: redirectTo="/sign-in"
 │  /settings       │
 └──────────────────┘
```

- `Tabs.Protected guard={isAuthenticated} redirectTo="/sign-in"` oculta las pestañas del reclutador y bloquea sus rutas cuando no hay sesión.
- Si el usuario ya tiene sesión, las pantallas de login y registro lo redirigen al destino indicado en el parámetro `redirect`. Ese destino se valida contra la lista blanca de `lib/auth/redirect.js` para evitar redirecciones abiertas.
- El selector **Portal Reclutador / Portal Candidato** lleva al login si se elige el modo reclutador sin sesión.

> La protección de rutas del cliente es solo una ayuda de navegación. Quien decide el acceso es la API, que exige un JWT válido y solo devuelve los datos del reclutador que lo presenta.

### Flujo de autenticación y datos

```
Pantalla (SignIn / SignUp)
        │  signIn / signUp / signOut
        ▼
AuthContext  ──  useSession() ──▶  isAuthenticated, user, isPending
        │
        ▼
lib/auth  ──▶  servidor Better Auth (EXPO_PUBLIC_AUTH_URL)
                      │
                      │  authClient.token()  →  JWT de vida corta
                      ▼
lib/api/client.js  ──  Authorization: Bearer <JWT>  ──▶  API FastAPI (EXPO_PUBLIC_API_URL)
        ▲
        │  useDashboard, useJobs, useRankedApplications, useApplication…
Pantallas (lib/api/queries.js)
```

- La sesión la gestiona Better Auth (cookie en web, `expo-secure-store` en nativo).
- Para llamar a la API, `client.js` pide a Better Auth un JWT firmado y lo envía como `Bearer`. La API lo valida contra las claves públicas del servidor de autenticación. El token se guarda en memoria hasta poco antes de caducar y se descarta al cambiar de usuario.
- Las pantallas no hacen `fetch` directamente: usan los hooks de `lib/api/queries.js`, que exponen `data`, `isPending` y `error`. Los mensajes de `error.message` ya están en español.
- El portal del candidato es público: su análisis no envía token ni guarda nada en el servidor.

### Tema y estilos

- `ThemeProvider` construye el tema (colores, tipografía, espaciado, radios y sombras) según el modo claro u oscuro.
- `makeStyles((t) => ({ ... }))` crea hooks de estilos que dependen del tema. Los componentes nunca usan colores hex directos, solo tokens `t.colors.*`.
- `useWorkspaceLayout()` expone `isCompact`, `isWide` e `isDesktop` para adaptar cada pantalla.

---

## Instalación

### Requisitos previos

- **Node.js** 22.13 o superior (o 24.3+), según lo que exigen Expo SDK 58 y React Native 0.88.
- **npm**, incluido con Node.
- Para probar en un dispositivo, una de estas opciones:
  - la app **Expo Go** (Android o iOS);
  - un emulador de Android Studio o un simulador de Xcode;
  - un *development build* propio (ver más abajo).

- El **backend** en marcha (API en el puerto 8000 y servidor de autenticación en el 3000). Sigue el README de [job-match-platform-backend](https://github.com/Kodis-AI/job-match-platform-backend): `docker compose up --build --watch`.

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/Kodis-AI/job-match-platform-frontend.git
cd job-match-platform-frontend

# 2. Instalar dependencias
npm install

# 3. Crear el archivo de entorno a partir de la plantilla
cp .env.example .env

# 4. Iniciar el servidor de desarrollo
npx expo start
```

Las variables `EXPO_PUBLIC_*` se leen al arrancar: si cambias `.env`, reinicia Expo con `npx expo start --clear`.

Desde la terminal de Expo:

- pulsa `w` para abrir la versión web;
- pulsa `a` para Android o `i` para iOS;
- o escanea el QR con Expo Go.

### Development build (opcional)

El proyecto usa `expo-secure-store`, un módulo con código nativo que ya viene incluido en Expo Go. Si añades librerías nativas que Expo Go no trae, genera un build de desarrollo:

```bash
npx expo run:android      # o: npx expo run:ios
# o en la nube con EAS:
npx eas-cli@latest build --profile development
```

> Las carpetas `android/` e `ios/` se generan automáticamente (Continuous Native Generation). No se editan a mano; la configuración nativa va en `app.json`.

### Añadir dependencias

Usa siempre `npx expo install <paquete>` en lugar de `npm install`. Así se resuelven versiones compatibles con el SDK.

---

## Variables de entorno

| Variable | Valor en local | Descripción |
| --- | --- | --- |
| `EXPO_PUBLIC_AUTH_URL` | `http://localhost:3000` | URL base del servidor Better Auth (servicio `auth` del backend). |
| `EXPO_PUBLIC_API_URL` | `http://localhost:8000` | URL base de la API FastAPI (servicio `api` del backend). |

Las dos son obligatorias: la app falla al arrancar si falta alguna. `.env` está en `.gitignore`; en el repositorio solo se versiona `.env.example`.

Para probar en un dispositivo físico, `localhost` no sirve: usa la IP de tu equipo en la red local en ambas variables y sigue la nota del README del backend para exponer los puertos.

---

## Scripts disponibles

| Comando | Descripción |
| --- | --- |
| `npm start` | Inicia el servidor de desarrollo de Expo |
| `npm run web` | Abre la app en el navegador |
| `npm run android` | Abre la app en Android |
| `npm run ios` | Abre la app en iOS |
| `npm run lint` | Ejecuta ESLint (`expo lint`) |
| `npx expo-doctor` | Diagnostica problemas de dependencias y configuración |
| `npx expo install --fix` | Alinea las dependencias con el SDK instalado |

---

## Autenticación

La app usa el servidor Better Auth del backend (`auth-server/`), configurado con correo y contraseña y los plugins `expo()` y `jwt()`. No hay modo simulado ni cuenta demo: crea una cuenta desde **Crear cuenta**. La contraseña debe tener al menos 8 caracteres, una letra y un número.

El cliente está en `src/lib/auth/betterAuthClient.js`:

- `expoClient` guarda la sesión en `expo-secure-store` en nativo; en web usa la cookie del navegador.
- `jwtClient` añade `authClient.token()`, que la capa de API usa para obtener el JWT que valida FastAPI.

En web, el origen de la app (`http://localhost:8081` en desarrollo) debe estar en `TRUSTED_ORIGINS` del servidor de autenticación y en `CORS_ORIGINS` de la API; el `docker-compose.yml` del backend ya lo incluye.

---

## Sistema de diseño

La guía completa está en [`design-system/matchai/MASTER.md`](design-system/matchai/MASTER.md). Su implementación vive en [`src/theme/`](src/theme/).

- **Estilo**: minimalismo / Swiss Style, limpio, con mucho espacio en blanco y jerarquía tipográfica clara.
- **Colores**:
  - primario índigo `#4F46E5` para marca y acciones principales;
  - secundario azul `#0284C7` para enlaces y progreso;
  - verde reservado a estados de éxito.
- **Tipografía**: Poppins para los títulos y Open Sans para el cuerpo. Tamaño mínimo de 12 px.
- **Iconos**: solo Lucide (nunca emojis), a través del componente `<Icon />`.

---

## Convenciones de contribución

- **Commits**: [Conventional Commits](https://www.conventionalcommits.org/es/v1.0.0/) (`feat:`, `fix:`, `docs:`, `refactor:`…). Por ejemplo, `feat(auth): add recruiter sign-in screen`.
- **Ramas**: trabaja en ramas `feat/…` o `fix/…` y fusiona en `main`.
- **Antes de hacer commit**, ejecuta `npm run lint`.
- **Expo cambia en cada SDK**: antes de usar una API de Expo, consulta la documentación de la versión instalada (`https://docs.expo.dev/versions/v58.0.0/`).

---

Proyecto académico del bootcamp **AI For Devs** — Kodigo.
