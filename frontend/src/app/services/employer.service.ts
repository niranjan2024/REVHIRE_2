import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CompanyModel } from '../models/company.model';

@Injectable({
  providedIn: 'root'
})
export class EmployerService {
  private companiesSubject = new BehaviorSubject<CompanyModel[]>([]);

  companies$ = this.companiesSubject.asObservable();

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
