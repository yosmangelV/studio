import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import type { ClassesUpdate, GymProfileUpdate, ScheduleUpdate } from '../../core/api/gym-profile.service';
import { GymSettingsService, SettingsBlock } from './data-access/gym-settings.service';
import { ClassesEditorComponent } from './ui/classes-editor/classes-editor.component';
import { ProfileFormComponent } from './ui/profile-form/profile-form.component';
import { ScheduleEditorComponent } from './ui/schedule-editor/schedule-editor.component';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [ProfileFormComponent, ScheduleEditorComponent, ClassesEditorComponent],
  templateUrl: './settings-page.html',
  styleUrl: './settings-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SettingsPage implements OnInit {
  protected readonly settings = inject(GymSettingsService);

  protected readonly profile  = computed(() => this.settings.data()?.profile ?? null);
  protected readonly schedule = computed(() => this.settings.data()?.schedule ?? []);
  protected readonly classes  = computed(() => this.settings.data()?.classes ?? []);

  protected readonly loadError = computed(() => {
    const error = this.settings.error();
    return error?.block === 'load' ? error.message : null;
  });

  protected readonly profileState  = this.blockState('profile');
  protected readonly scheduleState = this.blockState('schedule');
  protected readonly classesState  = this.blockState('classes');

  ngOnInit(): void {
    this.settings.load();
  }

  protected onSaveProfile(payload: GymProfileUpdate): void {
    this.settings.saveProfile(payload);
  }

  protected onSaveSchedule(payload: ScheduleUpdate): void {
    this.settings.saveSchedule(payload);
  }

  protected onSaveClasses(payload: ClassesUpdate): void {
    this.settings.saveClasses(payload);
  }

  private blockState(block: SettingsBlock) {
    return computed(() => {
      const error = this.settings.error();
      return {
        saving: this.settings.saving() === block,
        saved: this.settings.saved() === block,
        error: error?.block === block ? error.message : null,
      };
    });
  }
}
