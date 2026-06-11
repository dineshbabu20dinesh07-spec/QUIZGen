import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/upload': 'http://localhost:8000',
      '/save-quiz': 'http://localhost:8000',
      '/quizzes': 'http://localhost:8000',
      '/get-quiz': 'http://localhost:8000',
      '/submit-attempt': 'http://localhost:8000',
      '/student-attempts': 'http://localhost:8000',
      '/faculty-quizzes': 'http://localhost:8000',
      '/signup': 'http://localhost:8000',
      '/signin': 'http://localhost:8000',
    }
  }
})
