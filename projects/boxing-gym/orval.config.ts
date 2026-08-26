import { defineConfig } from 'orval';

export default defineConfig({
  students: {
    input: 'http://127.0.0.1:8000/openapi.json',
    output: {
      target: './src/app/core/api/students.service.ts',
      client: 'angular',
      baseUrl: 'http://127.0.0.1:8000',
    },
  },
});
