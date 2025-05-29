# Calendario Laboral - Frontend

Sistema de gestión de calendarios laborales para empleados - Componente Frontend

## Descripción

Interfaz de usuario para el sistema de gestión de calendarios laborales, que permite:
- Visualización y gestión de empleados
- Administración de centros de trabajo
- Visualización de calendarios laborales
- Gestión de días festivos y especiales
- Solicitud y aprobación de vacaciones

## Tecnologías

- Vue.js 3
- Vue Router
- Pinia para gestión de estado
- FullCalendar para visualización de calendarios
- Vite como herramienta de construcción

## Requisitos

- Node.js 18.x o superior
- npm o yarn

## Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/nereasaga/proyecto-pedagogico-front
cd proyecto-pedagogico-front
```

2. Instalar dependencias:
```bash
npm install
# o con yarn
yarn install
```

3. Configurar variables de entorno:
   - Crear archivo `.env.local` basado en `.env.example`
   - Ajustar la URL de la API según sea necesario

## Ejecución

### Desarrollo
```bash
npm run dev
# o con yarn
yarn dev
```

La aplicación estará disponible en http://localhost:5173

### Producción
```bash
npm run build
# o con yarn
yarn build
```

Los archivos generados estarán en la carpeta `dist/`

## Estructura del Proyecto

```
proyecto-pedagogico-front/
├── public/                 # Archivos públicos
├── src/                    # Código fuente
│   ├── assets/             # Recursos estáticos
│   │   └── css/            # Estilos CSS
│   ├── components/         # Componentes Vue
│   │   ├── dashboard/      # Componentes del dashboard
│   │   ├── employees/      # Componentes de empleados
│   │   ├── layout/         # Componentes de layout
│   │   └── ...
│   ├── lib/                # Bibliotecas y utilidades
│   ├── router/             # Configuración de rutas
│   ├── services/           # Servicios (API, etc.)
│   ├── stores/             # Stores Pinia
│   ├── views/              # Vistas/Páginas
│   │   ├── auth/           # Autenticación
│   │   ├── calendar/       # Calendario
│   │   ├── employees/      # Empleados
│   │   ├── workCenters/    # Centros de trabajo
│   │   └── ...
│   ├── App.vue             # Componente raíz
│   └── main.js             # Punto de entrada
├── index.html              # Plantilla HTML
├── vite.config.js          # Configuración de Vite
└── package.json            # Dependencias y scripts
```

## Funcionalidades

### Autenticación
- Inicio de sesión con diferentes roles
- Gestión de tokens JWT
- Protección de rutas según rol

### Dashboard
- Resumen de información relevante según rol
- Acceso rápido a funcionalidades principales

### Empleados
- Listado de empleados
- Creación, edición y eliminación de empleados
- Visualización de detalles de empleado

### Centros de Trabajo
- Listado de centros
- Creación, edición y eliminación de centros
- Gestión de días especiales por centro

### Calendario
- Visualización de calendario laboral
- Filtrado por empleado o centro
- Visualización de festivos y días especiales

### Vacaciones
- Solicitud de vacaciones
- Aprobación/rechazo de solicitudes
- Visualización de estado de solicitudes

## Roles y Permisos

- **Administrador**: Acceso completo a todas las funcionalidades
- **Responsable de Área**: Gestión de empleados y calendarios de su centro
- **Empleado**: Visualización de su propio calendario y solicitud de vacaciones

## Usuarios de Prueba

| Usuario | Contraseña | Rol |
|---------|------------|-----|
| admin | admin123 | Administrador |
| manager | manager123 | Responsable de Área |
| employee | employee123 | Empleado |

## Licencia

Este proyecto está licenciado bajo [MIT License](LICENSE).
