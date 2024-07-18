//anythingLLM.services.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AnythingLLMService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getToken(username: string, password: string): Observable<any> {
    const url = `${this.apiUrl}/anythingLLM/get_token`;
    const body = { username, password };
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.post(url, body, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  askQuestion(message: string, apiKey: string): Observable<any> {
    const url = `${this.apiUrl}/anythingLLM/question`;
    const body = { message, api_key: apiKey };
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.post(url, body, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  getDocuments(apiKey: string): Observable<any> {
    const url = `${this.apiUrl}/anythingLLM/get_documents?api_key=${apiKey}`;
    const headers = new HttpHeaders({ 'Accept': 'application/json' });

    return this.http.get(url, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  getConversation(apiKey: string): Observable<any> {
    const url = `${this.apiUrl}/anythingLLM/chats?api_key=${apiKey}`;
    const headers = new HttpHeaders({ 'Accept': 'application/json' });

    return this.http.get(url, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  deleteAllWorkspacesChat(apiKey: string): Observable<any> {
    const url = `${this.apiUrl}/anythingLLM/deleteAllWorkspacesChat?api_key=${apiKey}`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.delete(url, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  uploadDocument(apiKey: string, file: File): Observable<any> {
    const url = `${this.apiUrl}/anythingLLM/upload_document`;
    const formData: FormData = new FormData();
    formData.append('file', file);
    const params = { api_key: apiKey };

    return this.http.post(url, formData, { params }).pipe(
      catchError(this.handleError)
    );
  }

  uploadDocumentLink(apiKey: string, link: string): Observable<any> {
    const url = `${this.apiUrl}/anythingLLM/upload_document_link`;
    const params = { api_key: apiKey, link: link };

    return this.http.post(url, null, { params }).pipe(
      catchError(this.handleError)
    );
  }

  deleteDocument(token: string, apiKey: string, documentName: string): Observable<any> {
    const url = `${this.apiUrl}/anythingLLM/delete_document`;
    const formData: FormData = new FormData();
    formData.append('document_name', documentName);
    const params = { token: token, api_key: apiKey };
  
    return this.http.post(url, formData, { params }).pipe(
      catchError(this.handleError)
    );
  }
  
  askVerifiedQuestion(message: string, user_id: string, api_key: string): Observable<any> {
    const url = `${environment.apiUrl}/anythingLLM/question_verified`;
    const body = { user_id, message, api_key };
    return this.http.post(url, body).pipe(
      catchError(this.handleError)
    );
  }

  getVerifiedConversation(user_id: string): Observable<any> {
    const url = `${environment.apiUrl}/anythingLLM/get_chat_verified_by_user_id`;
    return this.http.get(url, { params: { user_id } }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    console.error('An error occurred', error);
    return throwError(error.message || error);
  }
}
