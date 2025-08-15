import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpinnerService {

  loading$: Observable<boolean>;

  private loadingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor() {
    this.loading$ = this.loadingSubject.asObservable();
  }

  setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  get loading(): boolean {
    return this.loadingSubject.value;
  }
}
