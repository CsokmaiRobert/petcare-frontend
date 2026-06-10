import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PetService } from '../../services/pet.service';
import { Pet } from '../../models/pet.model';

@Component({
  selector: 'app-patient-detail',
  standalone: true,
  imports: [],
  templateUrl: './patient-detail.component.html',
  styleUrl: './patient-detail.component.scss',
})
export class PatientDetailComponent {
  pet = signal<Pet | undefined>(undefined);
  showDeleteConfirm = signal(false);

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly petService = inject(PetService);

  constructor() {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.petService.getPetById(id).subscribe((pet) => this.pet.set(pet));
  }

  goBack(): void {
    this.router.navigate(['/dashboard/patients']);
  }

  editPet(): void {
    this.router.navigate(['/dashboard/patients', this.pet()!.id, 'edit']);
  }

  requestDelete(): void {
    this.showDeleteConfirm.set(true);
  }

  cancelDelete(): void {
    this.showDeleteConfirm.set(false);
  }

  confirmDelete(): void {
    this.petService.deletePet(this.pet()!.id).subscribe(() => {
      this.router.navigate(['/dashboard/patients']);
    });
  }

  formatDate(d: string): string {
    if (!d) return '—';
    const [year, month, day] = d.split('-');
    return `${day}-${month}-${year}`;
  }
}
