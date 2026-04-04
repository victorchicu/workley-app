import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {retry} from 'rxjs/operators';
import {retryStrategy} from '../idempotency/retry-strategy';
import {CreateJobRequest, JobResponse} from './job-api.models';

@Injectable({providedIn: 'root'})
export class JobApiService {
  private readonly baseUrl = '/api/jobs';

  constructor(private readonly httpClient: HttpClient) {}

  getJob(jobId: string): Observable<JobResponse> {
    return this.httpClient.get<JobResponse>(`${this.baseUrl}/${jobId}`, {
      withCredentials: true
    });
  }

  getJobs(): Observable<JobResponse[]> {
    return this.httpClient.get<JobResponse[]>(this.baseUrl, {
      withCredentials: true
    });
  }

  getHints(query: string): Observable<string[]> {
    const params = new HttpParams().set('q', query);
    return this.httpClient.get<string[]>(`${this.baseUrl}/hints`, {
      withCredentials: true,
      params
    });
  }

  createJob(request: CreateJobRequest): Observable<JobResponse> {
    return this.httpClient.post<JobResponse>(this.baseUrl, request, {
      withCredentials: true
    }).pipe(retry(retryStrategy()));
  }
}
