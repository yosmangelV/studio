import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-students-page',
  standalone: true,
  template: `
    <header class="students-page__header">
      <h1 class="students-page__title">Alumnos</h1>
      <p class="students-page__subtitle">Gestiona el padrón de alumnos del gimnasio.</p>
    </header>
    <div class="students-page__placeholder">
      Módulo en construcción — disponible en Fase 1.
    </div>
  `,
  styles: [`
    .students-page__header {
      margin-bottom: 2rem;
    }
    .students-page__title {
      font-size: 1.75rem;
      font-weight: 700;
      color: #fff;
      margin: 0 0 0.25rem;
    }
    .students-page__subtitle {
      font-size: 0.875rem;
      color: rgba(255,255,255,.45);
      margin: 0;
    }
    .students-page__placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 240px;
      border: 1px dashed rgba(255,255,255,.12);
      border-radius: 8px;
      font-size: 0.875rem;
      color: rgba(255,255,255,.3);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class StudentsPage {}
