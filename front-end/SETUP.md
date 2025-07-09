# Sistema de Clasificación de Patologías - Guía de Configuración

Sistema de apoyo diagnóstico usando modelos entrenados con datos hospitalarios de Guatemala, desarrollado con React, Firebase Authentication, Tailwind CSS y componentes Shadcn UI.

## Características

✅ **Sistema de Autenticación**
- Registro de usuarios con verificación de email
- Inicio de sesión seguro con Firebase Auth
- Flujo de verificación de email
- Rutas protegidas

✅ **Sistema de Clasificación**
- Formulario para datos de pacientes
- Estadísticas de clasificaciones
- Panel de control médico
- Interfaz moderna y responsiva

✅ **Componentes del Dashboard**
- Formulario de clasificación de patologías
- Estadísticas de rendimiento del modelo
- Clasificaciones recientes
- Métricas de precisión y confianza

## Requisitos Previos

- Node.js (v18 o superior)
- npm o yarn
- Proyecto Firebase con Authentication habilitado

## Configuración de Firebase

1. Crear un nuevo proyecto en Firebase en [https://console.firebase.google.com/](https://console.firebase.google.com/)

2. Habilitar Authentication:
   - Ir a Authentication > Sign-in method
   - Habilitar el proveedor "Email/Password"

3. Obtener la configuración de Firebase:
   - Ir a Project Settings > General
   - Desplazarse hacia abajo a "Your apps" y hacer clic en el ícono web
   - Copiar los valores de configuración

4. Crear un archivo `.env` en la raíz del proyecto con la configuración de Firebase:

```env
# Configuración de Firebase
VITE_FIREBASE_API_KEY=tu_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=tu_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_project_id
VITE_FIREBASE_STORAGE_BUCKET=tu_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id

# Opcional: Configuración específica de la app
VITE_APP_ID=tu_app_id
VITE_INITIAL_AUTH_TOKEN=null
```

## Instalación y Ejecución

1. Instalar dependencias:
```bash
npm install
```

2. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

3. Abrir el navegador y navegar a `http://localhost:5173`

## Uso del Sistema

### Flujo de Registro
1. Navegar a `/register`
2. Llenar los datos (nombre, apellido, email, contraseña)
3. Enviar el formulario
4. Revisar el email para el enlace de verificación
5. Hacer clic en el enlace de verificación
6. Regresar a la app y hacer clic en "Ya verifiqué mi email"
7. Será redirigido al dashboard

### Flujo de Inicio de Sesión
1. Navegar a `/login`
2. Ingresar email verificado y contraseña
3. Será redirigido al dashboard

### Características del Dashboard
- **Formulario de Clasificación**: Ingrese datos del paciente para obtener clasificación diagnóstica
- **Estadísticas**: Vea métricas clave como casos clasificados, precisión del modelo, etc.
- **Clasificaciones Recientes**: Revise los últimos diagnósticos procesados
- **Rendimiento del Modelo**: Monitoree precisión, sensibilidad y especificidad

## Estructura del Proyecto

```
src/
├── components/
│   ├── auth/                 # Componentes de autenticación
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── EmailVerification.jsx
│   │   └── ProtectedRoute.jsx
│   ├── dashboard/            # Componentes del dashboard
│   │   └── Dashboard.jsx
│   ├── layout/               # Componentes de layout
│   │   └── DashboardLayout.jsx
│   └── ui/                   # Componentes UI reutilizables
├── contexts/                 # Contextos de React
│   └── AuthContext.jsx      # Contexto de autenticación
├── lib/                      # Funciones utilitarias
│   └── utils.js
├── App.jsx                   # Componente principal con routing
├── main.jsx                  # Punto de entrada de la app
└── index.css                 # Estilos globales
```

## Tecnologías Clave

- **React 19** - Framework frontend
- **React Router DOM** - Routing del lado del cliente
- **Firebase Auth** - Servicio de autenticación
- **Tailwind CSS** - Framework CSS utility-first
- **Shadcn UI** - Librería de componentes moderna
- **Lucide React** - Librería de iconos
- **Vite** - Herramienta de build y servidor dev

## Características de Seguridad

- Verificación de email requerida antes del acceso al dashboard
- Rutas protegidas que redirigen usuarios no autenticados
- Autenticación segura con Firebase
- Toggle de visibilidad de contraseña para mejor UX

## Personalización

### Agregar Nuevas Páginas
1. Crear un nuevo componente en `src/components/`
2. Agregar una ruta en `App.jsx`
3. Envolver con `ProtectedRoute` si requiere autenticación
4. Agregar enlace de navegación en `DashboardLayout.jsx`

### Estilos
- Modificar `src/index.css` para estilos globales
- Usar clases de Tailwind para estilos de componentes
- Personalizar el tema en `tailwind.config.js`

### Configuración de Firebase
- Agregar servicios adicionales de Firebase según necesidad
- Configurar reglas de Firestore para seguridad de datos
- Configurar Firebase hosting para deployment

## Integración con Modelos de IA

El sistema está preparado para integrar endpoints de modelos de clasificación:

### Estructura de Datos del Formulario
```javascript
{
  patientId: "GT-2024-XXX",
  age: "número",
  gender: "M/F",
  symptoms: "descripción de síntomas",
  vitalSigns: "signos vitales",
  medicalHistory: "historia médica",
  labResults: "resultados de laboratorio"
}
```

### Endpoint Esperado
```
POST /api/classify
Content-Type: application/json

{
  // datos del formulario
}

Response:
{
  diagnosis: "Diabetes Mellitus Tipo 2",
  confidence: 96.7,
  recommendations: [...],
  timestamp: "..."
}
```

## Solución de Problemas

### Problemas Comunes

1. **Errores de "Module not found"**: Asegúrese de que todas las dependencias estén instaladas con `npm install`

2. **Errores de Firebase**: Verifique la configuración del archivo `.env`

3. **Verificación de email no funciona**: 
   - Revisar configuración de autenticación en consola Firebase
   - Asegurar que el proveedor email/password esté habilitado
   - Revisar carpeta de spam para emails de verificación

4. **Problemas de estilos**: 
   - Asegurar que Tailwind CSS esté configurado correctamente
   - Verificar que todos los archivos CSS estén importados correctamente

## Datos de Prueba

El sistema actualmente usa datos dummy para demostración. Los endpoints reales serán configurados según las especificaciones del modelo de IA.

## Licencia

Este proyecto es para propósitos educativos y de desarrollo. Por favor asegurar cumplimiento con regulaciones de datos de salud (HIPAA, GDPR, etc.) al manejar datos médicos reales.

## Contexto: Guatemala

Este sistema está específicamente diseñado para apoyar el diagnóstico médico en Guatemala, utilizando modelos entrenados con datos hospitalarios locales para mejorar la precisión y relevancia de las clasificaciones diagnósticas. 