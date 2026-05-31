import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AnnouncementStory } from '../models/announcement.models';

@Injectable({ providedIn: 'root' })
export class AnnouncementApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getStory(code: string): Observable<AnnouncementStory> {
    return this.http
      .get<AnnouncementStory>(`${this.baseUrl}/messages/${code}`)
      .pipe(catchError((err: HttpErrorResponse) => throwError(() => err)));
  }
}
