// astro.config.js
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://ldadev.github.io', 
  
  // ¡El prefijo del repositorio debe estar aquí!
  base: '/registration_app/', 
  
  output: 'static', 
});