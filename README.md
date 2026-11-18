# 🐄 TFI - Sistema Ganadero (Frontend)

Este repositorio contiene la interfaz de usuario (Frontend) para el **Sistema de Gestión Ganadera (TFI - PCampo)**. La aplicación web permite llevar un control integral de animales, potreros, movimientos internos y registros sanitarios (vacunaciones), con control de acceso basado en roles (Administrador y Empleado/Peón).

---

## 👨‍💻 Integrantes

* **Ignacio Rivas**
* **Gonzalez Benjamin**

---

## 🛠️ Tecnologías Utilizadas

* **[React](https://react.dev/)** (v18+) - Biblioteca para la construcción de interfaces de usuario interactivas.
* **[Vite](https://vitejs.dev/)** - Herramienta de construcción rápida para proyectos web modernos.
* **[Bootstrap 5](https://getbootstrap.com/)** - Framework de CSS para un diseño limpio, responsive y moderno.
* **[Zustand](https://zustand-demo.pmnd.rs/)** - Gestión de estado global ligera para mantener la sesión y datos del usuario/token.
* **[React Router DOM](https://reactrouter.com/)** - Enrutamiento dinámico y protección de rutas privadas/públicas.
* **[Axios](https://axios-http.com/)** - Cliente HTTP basado en promesas para interactuar con la API REST (Backend).

---

## 📋 Requisitos Previos

Antes de ejecutar la aplicación, asegúrate de tener instalado en tu sistema:

* **[Node.js](https://nodejs.org/)** (Versión 18.x o superior recomendada)
* **[npm](https://www.npmjs.com/)** (Viene incluido con Node.js)

---

## 🚀 Instalación y Ejecución

Sigue estos pasos para poner en marcha el servidor de desarrollo del Frontend:

### 1. Ubicarse en la carpeta Frontend
Abre una terminal y navega hasta el directorio del Frontend dentro del proyecto:
```bash
cd Frontend
```

### 2. Instalar las dependencias
Ejecuta el siguiente comando para descargar todos los paquetes requeridos:
```bash
npm install
```

### 3. Ejecutar la aplicación en modo desarrollo
Inicia el servidor local de desarrollo:
```bash
npm run dev
```

Una vez ejecutado, la aplicación estará disponible en la dirección:
👉 **`http://localhost:5173`**

---

## 🔐 Roles y Permisos en la Interfaz

* **Administrador:** Acceso a los módulos de gestión, incluida la consulta y eliminación de usuarios. No puede eliminar su propia cuenta ni al último administrador.
* **Empleado / Peón:** Acceso de lectura a catálogos e historial, y registro de vacunas y movimientos. Las funciones sensibles de eliminación permanecen ocultas e inhabilitadas.

## Dashboard y gráficos (novedades)

**Dependencia nueva:** `recharts`. Ejecutar `npm install` después de actualizar.

- `/dashboard` (en el menú figura como **Inicio**): tarjetas de resumen, 4 gráficos (Recharts) y últimos animales registrados.
- `/usuarios`: listado y eliminación de cuentas, visible solo para administradores. El registro público crea cuentas con rol Peón.
- `src/components/charts/`: gráficos reutilizables (`GraficoArea`, `GraficoBarras`, `GraficoDonut`) y `TarjetaGrafico` (estados de carga, error y vacío).
- `src/config.js`: URL del backend y encabezado con el token.
- Foto del animal: se elige en el formulario de Animales y se muestra en el listado y el dashboard.
