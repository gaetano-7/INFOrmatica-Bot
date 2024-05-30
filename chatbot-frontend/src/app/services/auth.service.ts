import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { AnythingLLMService } from './anythingLLM.services';
import { environment } from '../../environments/environment';

interface CurrentUser {
  access_token: string | null;
  role: string | null;
  id: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject: BehaviorSubject<CurrentUser>;
  public currentUser: Observable<CurrentUser>;
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private router: Router,
    private anythingLLMService: AnythingLLMService,
  ) {
    const storedAccessToken = localStorage.getItem('access_token');
    const storedRole = localStorage.getItem('role');
    const storedId = localStorage.getItem('user_id');
    this.currentUserSubject = new BehaviorSubject<CurrentUser>({
      access_token: storedAccessToken,
      role: storedRole,
      id: storedId
    });
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): CurrentUser {
    return this.currentUserSubject.value;
  }

  login(username: string, password: string) {
    const formData = new HttpParams()
      .set('username', username)
      .set('password', password);

    return this.http.post<any>(`${this.apiUrl}/auth/login`, formData.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).pipe(
      switchMap(data => {
        const decodedToken = this.decodeToken(data.access_token);
        localStorage.setItem('username', username);
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('role', decodedToken.role);
        localStorage.setItem('user_id', decodedToken.id);

        this.currentUserSubject.next({ access_token: data.access_token, role: decodedToken.role, id: decodedToken.id });

        return this.anythingLLMService.getToken(username, password).pipe(
          map(llmTokenData => {
            localStorage.setItem('llm_token', llmTokenData.token);
            return true;
          })
        );
      })
    );
  }

  register(email: string, username: string, first_name: string, last_name: string, password: string) {
    const formData = { email, username, first_name, last_name, password };

    return this.http.post<any>(`${this.apiUrl}/auth/register`, formData).pipe(
      map(data => data)
    );
  }

  logout() {
    const username = environment.usernameAdmin;
    const password = environment.passwordAdmin; 

    this.anythingLLMService.getToken(username, password).pipe(
      switchMap(llmTokenData => {
        return this.anythingLLMService.deleteAllWorkspacesChat(llmTokenData.token);
      })
    ).subscribe(
      () => {
        localStorage.removeItem('username');
        localStorage.removeItem('access_token');
        localStorage.removeItem('role');
        localStorage.removeItem('user_id');
        
        localStorage.removeItem('llm_token');
        localStorage.removeItem('conversation');
        this.currentUserSubject.next({ access_token: null, role: null, id: null });
        this.router.navigate(['/login']);
      },
      error => {
        console.error('Logout error:', error);
      }
    );
  }

  deleteUserById(userId: number) {
    const token = this.getAccessToken();
    if (token) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.delete<any>(`${this.apiUrl}/users/${userId}`, { headers });
    } else {
      throw new Error('Token di autenticazione non disponibile');
    }
  }

  isAuthenticated(): boolean {
    return !!this.currentUserValue.access_token;
  }

  get currentUserId(): string | null {
    return this.currentUserValue.id;
  }

  get currentUserRole(): string | null {
    return this.currentUserValue.role;
  }

  isAdmin(): boolean {
    return this.currentUserValue.role === 'admin';
  }

  isUser(): boolean {
    return this.currentUserValue.role === 'user';
  }

  getAccessToken(): string | null {
    const currentUser = this.currentUserValue;
    return currentUser ? currentUser.access_token : null;
  }

  private decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch (Error) {
      return null;
    }
  }
}