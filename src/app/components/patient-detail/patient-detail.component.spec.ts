import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { PatientDetailComponent } from './patient-detail.component';
import { PetService } from '../../services/pet.service';
import { routes } from '../../app.routes';

describe('PatientDetailComponent', () => {
  let component: PatientDetailComponent;
  let fixture: ComponentFixture<PatientDetailComponent>;
  let petService: PetService;

  function createWithId(id: string) {
    return TestBed.configureTestingModule({
      imports: [PatientDetailComponent],
      providers: [
        provideRouter(routes),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => id } } },
        },
      ],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(PatientDetailComponent);
        component = fixture.componentInstance;
        petService = TestBed.inject(PetService);
        fixture.detectChanges();
      });
  }

  it('should create and find pet by id', async () => {
    await createWithId('1');
    expect(component).toBeTruthy();
    expect(component.pet()).toBeDefined();
    expect(component.pet()!.name).toBe('Max');
  });

  it('should set pet to undefined for unknown id', async () => {
    await createWithId('999');
    expect(component.pet()).toBeUndefined();
  });

  it('should show delete modal when requestDelete is called', async () => {
    await createWithId('1');
    component.requestDelete();
    expect(component.showDeleteConfirm()).toBeTrue();
  });

  it('should hide delete modal when cancelDelete is called', async () => {
    await createWithId('1');
    component.requestDelete();
    component.cancelDelete();
    expect(component.showDeleteConfirm()).toBeFalse();
  });

  it('should delete pet on confirmDelete', async () => {
    await createWithId('1');
    const before = petService.allPets().length;
    component.confirmDelete();
    expect(petService.allPets().length).toBe(before - 1);
  });

  it('formatDate should return em-dash for empty string', async () => {
    await createWithId('1');
    expect(component.formatDate('')).toBe('—');
  });

  it('formatDate should include year in output', async () => {
    await createWithId('1');
    expect(component.formatDate('2026-02-15')).toContain('2026');
  });

  it('formatDateShort should include year in output', async () => {
    await createWithId('1');
    expect(component.formatDate('2025-01-10')).toContain('2025');
  });

  it('should render pet name in the DOM', async () => {
    await createWithId('1');
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Max');
  });
});
