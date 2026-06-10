import { Component, signal, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PetService } from '../../services/pet.service';
import { PetSpecies, PetStatus } from '../../models/pet.model';

export const positiveNumber: ValidatorFn = (
  c: AbstractControl,
): ValidationErrors | null =>
  c.value !== null && c.value !== '' && Number(c.value) <= 0
    ? { positiveNumber: true }
    : null;

@Component({
  selector: 'app-patient-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './patient-form.component.html',
  styleUrl: './patient-form.component.scss',
})
export class PatientFormComponent implements OnInit {
  form!: FormGroup;
  isEdit = signal(false);
  petId = signal<string | null>(null);
  pageTitle = signal('Add New Patient');
  pageSubtitle = signal('Enter the patient information to create a new record');

  readonly species: PetSpecies[] = ['Dog', 'Cat', 'Bird', 'Rabbit', 'Other'];
  readonly statuses: PetStatus[] = ['Active', 'Inactive'];

  fb = inject(FormBuilder);
  route = inject(ActivatedRoute);
  router = inject(Router);
  petService = inject(PetService);

  ngOnInit(): void {
    this.form = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(50),
        ],
      ],
      species: ['Dog', Validators.required],
      breed: ['', [Validators.required, Validators.maxLength(50)]],
      age: [
        null,
        [
          Validators.required,
          Validators.min(0),
          Validators.max(100),
          positiveNumber,
        ],
      ],
      weight: [null, [Validators.required, Validators.min(0), positiveNumber]],
      status: ['Active', Validators.required],
      ownerName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(80),
        ],
      ],
      ownerEmail: ['', [Validators.required, Validators.email]],
      ownerPhone: [
        '',
        [Validators.required, Validators.pattern(/^07\d{2}-\d{3}-\d{3}$/)],
      ],
      lastVisit: ['', Validators.required],
      nextAppointment: [''],
      medicalNotes: [''],
      vaccinations: [''],
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEdit.set(true);
      this.petId.set(id);
      this.petService.getPetById(id).subscribe((pet) => {
        this.pageTitle.set('Edit Patient Record');
        this.pageSubtitle.set(`Update ${pet.name}'s information`);
        this.form.patchValue(pet);
      });
    }
  }

  get f() {
    return this.form.controls;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.value;
    if (this.isEdit() && this.petId()) {
      this.petService.updatePet(this.petId()!, value).subscribe(() => {
        this.router.navigate(['/dashboard/patients', this.petId()]);
      });
    } else {
      this.petService.addPet(value).subscribe((newPet) => {
        this.router.navigate(['/dashboard/patients', newPet.id]);
      });
    }
  }

  cancel(): void {
    if (this.isEdit() && this.petId()) {
      this.router.navigate(['/dashboard/patients', this.petId()]);
    } else {
      this.router.navigate(['/dashboard/patients']);
    }
  }
}
