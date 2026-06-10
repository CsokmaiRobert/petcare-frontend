import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PetService } from '../../services/pet.service';
import { Pet } from '../../models/pet.model';

const PAGE_SIZE = 5;

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './patient-list.component.html',
  styleUrl: './patient-list.component.scss',
})
export class PatientListComponent implements OnInit {
  searchQuery = signal('');
  currentPage = signal(1);
  petToDelete = signal<Pet | null>(null);
  pageSize = PAGE_SIZE;

  pagedPets = signal<Pet[]>([]);
  total = signal(0);
  totalPages = signal(1);
  activeCount = signal(0);

  pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1),
  );

  private readonly petService = inject(PetService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.loadPage();
    this.loadActiveCount();
  }

  private loadPage(): void {
    this.petService
      .getAll({
        page: this.currentPage(),
        limit: this.pageSize,
        search: this.searchQuery(),
      })
      .subscribe((res) => {
        this.pagedPets.set(res.data);
        this.total.set(res.total);
        this.totalPages.set(res.totalPages);
      });
  }

  private loadActiveCount(): void {
    this.petService
      .getAll({ status: 'Active', limit: 1 })
      .subscribe((res) => this.activeCount.set(res.total));
  }

  onSearch(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1);
    this.loadPage();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadPage();
    }
  }

  viewPet(id: string): void {
    this.router.navigate(['/dashboard/patients', id]);
  }

  editPet(id: string): void {
    this.router.navigate(['/dashboard/patients', id, 'edit']);
  }

  requestDelete(pet: Pet): void {
    this.petToDelete.set(pet);
  }

  cancelDelete(): void {
    this.petToDelete.set(null);
  }

  confirmDelete(): void {
    const pet = this.petToDelete();
    if (pet) {
      this.petService.deletePet(pet.id).subscribe(() => {
        this.petToDelete.set(null);
        if (this.pagedPets().length === 1 && this.currentPage() > 1) {
          this.currentPage.update((p) => p - 1);
        }
        this.loadPage();
        this.loadActiveCount();
      });
    }
  }

  addNew(): void {
    this.router.navigate(['/dashboard/patients/new']);
  }

  formatDate(d: string): string {
    if (!d) return '—';
    const [year, month, day] = d.split('-');
    return `${day}-${month}-${year}`;
  }
}
