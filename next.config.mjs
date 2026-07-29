/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Salida "standalone": genera un servidor mínimo autocontenido para Docker/Coolify.
  output: "standalone",
  // better-sqlite3 es un módulo nativo: hay que dejar que Next lo cargue sin
  // empaquetarlo para evitar errores de bundling en las rutas del servidor.
  experimental: {
    serverComponentsExternalPackages: ["better-sqlite3"],
  },
};
export default nextConfig;
