import { InjectionToken } from '@angular/core';
import type { GymConfig } from './gym-config.model';

export const GYM_CONFIG = new InjectionToken<GymConfig>('GYM_CONFIG');
