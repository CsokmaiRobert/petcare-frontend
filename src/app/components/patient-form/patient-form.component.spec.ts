import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { PatientFormComponent, positiveNumber } from './patient-form.component';
import { PetService } from '../../services/pet.service';
import { routes } from '../../app.routes';
import { FormControl } from '@angular/forms';

describe('positiveNumber validator', () => {
  it('should return null for a positive number', () => {
    const ctrl = new FormControl(5);
    expect(positiveNumber(ctrl)).toBeNull();
  });

  it('should return error for zero', () => {
    const ctrl = new FormControl(0);
    expect(positiveNumber(ctrl)).toEqual({ positiveNumber: true });
  });

  it('should return error for a negative number', () => {
    const ctrl = new FormControl(-3);
    expect(positiveNumber(ctrl)).toEqual({ positiveNumber: true });
  });

  it('should return null for empty value', () => {
    const ctrl = new FormControl('');
    expect(positiveNumber(ctrl)).toBeNull();
  });
});

function buildFixture(paramId: string) {
  return TestBed.configureTestingModule({
    imports: [PatientFormComponent],
    providers: [
      provideRouter(routes),
      {
        provide: ActivatedRoute,
        useValue: { snapshot: { paramMap: { get: () => paramId } } },
      },
    ],
  })
    .compileComponents()
    .then(() => {
      const fixture = TestBed.createComponent(PatientFormComponent);
      fixture.detectChanges();
      return fixture;
    });
}

describe('PatientFormComponent – Add mode', () => {
  let component: PatientFormComponent;
  let fixture: ComponentFixture<PatientFormComponent>;

  beforeEach(async () => {
    fixture = await buildFixture('new');
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be in add mode', () => {
    expect(component.isEdit()).toBeFalse();
  });

  it('should have an invalid form initially', () => {
    expect(component.form.invalid).toBeTrue();
  });

  it('should call markAllAsTouched when submitted with invalid form', () => {
    spyOn(component.form, 'markAllAsTouched');
    component.onSubmit();
    expect(component.form.markAllAsTouched).toHaveBeenCalled();
  });

  it('should add a pet when form is valid and submitted', () => {
    const petService = TestBed.inject(PetService);
    const before = petService.allPets().length;
    component.form.setValue({
      name: 'NewPet',
      species: 'Dog',
      breed: 'Poodle',
      age: 2,
      weight: 23,
      status: 'Active',
      ownerName: 'New Owner',
      ownerEmail: 'new@owner.com',
      ownerPhone: '0723-456-789',
      lastVisit: '2026-01-01',
      nextAppointment: '',
      medicalNotes: '',
      vaccinations: '',
    });
    expect(component.form.valid).toBeTrue();
    component.onSubmit();
    expect(petService.allPets().length).toBe(before + 1);
  });

  it('should mark name invalid when empty', () => {
    component.form.get('name')!.markAsTouched();
    component.form.get('name')!.setValue('');
    expect(component.form.get('name')!.invalid).toBeTrue();
  });

  it('should mark email invalid when badly formatted', () => {
    component.form.get('ownerEmail')!.setValue('not-an-email');
    expect(component.form.get('ownerEmail')!.invalid).toBeTrue();
  });

  it('should mark phone invalid when wrong format', () => {
    component.form.get('ownerPhone')!.setValue('1234567890');
    expect(component.form.get('ownerPhone')!.invalid).toBeTrue();
  });

  it('should accept a correctly formatted phone', () => {
    component.form.get('ownerPhone')!.setValue('0723-456-789');
    expect(component.form.get('ownerPhone')!.valid).toBeTrue();
  });
});

describe('PatientFormComponent – Edit mode', () => {
  let component: PatientFormComponent;
  let petService: PetService;

  beforeEach(async () => {
    const fixture = await buildFixture('1');
    component = fixture.componentInstance;
    petService = TestBed.inject(PetService);
  });

  it('should be in edit mode', () => {
    expect(component.isEdit()).toBeTrue();
  });

  it('should pre-fill the name field', () => {
    expect(component.form.get('name')!.value).toBe('Max');
  });

  it('should update pet on submit', () => {
    component.form.get('name')!.setValue('MaxEdited');
    component.onSubmit();
    expect(petService.getPetById('1')!.name).toBe('MaxEdited');
  });
});
