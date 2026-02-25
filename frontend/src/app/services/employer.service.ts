import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { CompanyModel } from '../models/company.model';
import { API_BASE_URL } from './config/api.config';

export interface EmployerProfilePayload {
  userId: number;
  email: string;
  mobileNumber: string;
  companyName: string;
  industry: string;
  companySize: string;
  companyDescription: string;
  website: string;
  companyLocation: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmployerService {
  private companiesSubject = new BehaviorSubject<CompanyModel[]>([]);

  companies$ = this.companiesSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  getCompanyProfile(userId: number): Observable<EmployerProfilePayload> {
    return this.http.get<EmployerProfilePayload>(`${API_BASE_URL}/employer/company-profile/${userId}`);
  }

  updateCompanyProfile(payload: EmployerProfilePayload): Observable<void> {
    return this.http.put(`${API_BASE_URL}/employer/company-profile`, payload).pipe(map(() => void 0));
  }

  registerCompany(company: Omit<CompanyModel, 'id' | 'ownerUserId'>, ownerUserId: number): CompanyModel {
    const newCompany: CompanyModel = {
      id: this.companiesSubject.value.length + 1,
      ownerUserId,
      ...company
    };

    this.companiesSubject.next([...this.companiesSubject.value, newCompany]);
    return newCompany;
  }

  createPendingCompany(company: Omit<CompanyModel, 'id' | 'ownerUserId'>): CompanyModel {
    return {
      id: this.companiesSubject.value.length + 1,
      ownerUserId: -1,
      ...company
    };
  }

  getCompanyByOwner(ownerUserId: number): CompanyModel | undefined {
    return this.companiesSubject.value.find((company) => company.ownerUserId === ownerUserId);
  }

  getCompanyById(companyId: number): CompanyModel | undefined {
    return this.companiesSubject.value.find((company) => company.id === companyId);
  }

  updateCompany(companyId: number, payload: Partial<CompanyModel>): void {
    this.companiesSubject.next(
      this.companiesSubject.value.map((company) =>
        company.id === companyId ? { ...company, ...payload } : company
      )
    );
  }
}
