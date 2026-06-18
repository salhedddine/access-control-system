import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // FIXED: Removed the accidental double slash from the origin configurations
  private readonly baseUrl: string = 'http://192.168.194.46:8080/api';

  // Standard JSON Headers configuration
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };

  constructor(private http: HttpClient) {}

  /**
   * Helper utility to safely join the base URL and endpoint strings 
   * without creating duplicate or missing forward slashes.
   */
  private buildUrl(endpoint: string): string {
    const cleanBase = this.baseUrl.replace(/\/$/, '');      // Trims trailing slashes
    const cleanEndpoint = endpoint.replace(/^\//, '');      // Trims leading slashes
    return `${cleanBase}/${cleanEndpoint}`;
  }

  /**
   * Generic GET Request
   */
  get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(this.buildUrl(endpoint), this.httpOptions).pipe(
      retry(1), // Transient network error safety fallback
      catchError(this.handleError)
    );
  }

  /**
   * Generic POST Request
   * Used for both sending door events and managing card provision steps
   */
  post<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<T>(this.buildUrl(endpoint), body, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Generic PUT Request
   */
  put<T>(endpoint: string, body: any): Observable<T> {
    return this.http.put<T>(this.buildUrl(endpoint), body, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Generic DELETE Request
   */
  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(this.buildUrl(endpoint), this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Centralized HTTP Error Handling Handler
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown network anomaly occurred.';

    if (error.error instanceof ErrorEvent) {
      // Client-side or localized network transaction error
      errorMessage = `Client-side exception: ${error.error.message}`;
    } else {
      // Backend server-side execution context error code returned
      errorMessage = `Server responded with code ${error.status}. Message: ${error.error?.error || error.message}`;
    }

    console.error(`[API ERROR LOG]: ${errorMessage}`, error);
    
    // Return an observable that throws the message straight down to the UI component subscriber
    return throwError(() => new Error(errorMessage));
  }
}