import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PatientListComponent } from './patient-list.component';
import { PetService } from '../../services/pet.service';
import { routes } from '../../app.routes';

describe('PatientListComponent', () => {
  let component: PatientListComponent;
  let fixture: ComponentFixture<PatientListComponent>;
  let petService: PetService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientListComponent],
      providers: [provideRouter(routes)],
    }).compileComponents();

    fixture = TestBed.createComponent(PatientListComponent);
    component = fixture.componentInstance;
    petService = TestBed.inject(PetService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display all pets initially', () => {
    expect(component.filteredPets().length).toBe(petService.allPets().length);
  });

  it('should filter pets when search query changes', () => {
    component.onSearch('Max');
    expect(component.filteredPets().some((p) => p.name === 'Max')).toBeTrue();
    expect(component.filteredPets().length).toBeLessThanOrEqual(petService.allPets().length);
  });

  it('should reset to page 1 when searching', () => {
    component.currentPage.set(2);
    component.onSearch('Max');
    expect(component.currentPage()).toBe(1);
  });

  it('should update petToDelete when requestDelete is called', () => {
    const pet = petService.allPets()[0];
    component.requestDelete(pet);
    expect(component.petToDelete()).toEqual(pet);
  });

  it('should clear petToDelete when cancelDelete is called', () => {
    component.petToDelete.set(petService.allPets()[0]);
    component.cancelDelete();
    expect(component.petToDelete()).toBeNull();
  });

  it('should delete pet when confirmDelete is called', () => {
    const pet = petService.allPets()[0];
    const before = petService.allPets().length;
    component.requestDelete(pet);
    component.confirmDelete();
    expect(petService.allPets().length).toBe(before - 1);
    expect(component.petToDelete()).toBeNull();
  });

  it('should navigate to the correct page with goToPage', () => {
    component.goToPage(1);
    expect(component.currentPage()).toBe(1);
  });

  it('should not exceed totalPages in goToPage', () => {
    component.goToPage(999);
    expect(component.currentPage()).toBeLessThanOrEqual(component.totalPages());
  });

  it('should compute pageNumbers correctly', () => {
    expect(component.pageNumbers().length).toBe(component.totalPages());
  });

  it('formatDate should return em-dash for empty string', () => {
    expect(component.formatDate('')).toBe('—');
  });

  it('formatDate should format a valid date', () => {
    expect(component.formatDate('2026-02-15')).toContain('2026');
  });

  it('should show delete modal when petToDelete is set', () => {
    component.petToDelete.set(petService.allPets()[0]);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.modal')).toBeTruthy();
  });

  it('should hide delete modal when petToDelete is null', () => {
    component.petToDelete.set(null);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.modal')).toBeNull();
  });
});
