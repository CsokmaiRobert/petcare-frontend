import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pet } from '../models/pet.model';

export interface PetPage {
  data: Pet[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const API_URL = 'https://10.169.140.178:3000/api/pets';

@Injectable({ providedIn: 'root' })
export class PetService {
  private readonly http = inject(HttpClient);

  getAll(
    params: {
      page?: number;
      limit?: number;
      search?: string;
      species?: string;
      status?: string;
    } = {},
  ): Observable<PetPage> {
    let httpParams = new HttpParams();
    if (params.page != null) httpParams = httpParams.set('page', params.page);
    if (params.limit != null)
      httpParams = httpParams.set('limit', params.limit);
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.species) httpParams = httpParams.set('species', params.species);
    if (params.status) httpParams = httpParams.set('status', params.status);
    return this.http.get<PetPage>(API_URL, { params: httpParams });
  }

  getPetById(id: string): Observable<Pet> {
    return this.http.get<Pet>(`${API_URL}/${id}`);
  }

  addPet(pet: Omit<Pet, 'id' | 'createdAt'>): Observable<Pet> {
    return this.http.post<Pet>(API_URL, pet);
  }

  updatePet(
    id: string,
    changes: Partial<Omit<Pet, 'id' | 'createdAt'>>,
  ): Observable<Pet> {
    return this.http.put<Pet>(`${API_URL}/${id}`, changes);
  }

  deletePet(id: string): Observable<void> {
    return this.http.delete<void>(`${API_URL}/${id}`);
  }
}
