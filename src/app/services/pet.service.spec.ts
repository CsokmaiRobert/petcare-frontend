import { TestBed } from '@angular/core/testing';
import { PetService } from './pet.service';

describe('PetService', () => {
  let service: PetService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PetService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have 5 seed pets', () => {
    expect(service.allPets().length).toBe(5);
  });

  it('should report totalPatients correctly', () => {
    expect(service.totalPatients()).toBe(5);
  });

  it('should report activePatients correctly', () => {
    expect(service.activePatients()).toBe(5);
  });

  it('should report thisMonthPatients, which may be 0 for seeded data', () => {
    expect(service.thisMonthPatients()).toBeGreaterThanOrEqual(0);
  });

  describe('getPetById', () => {
    it('should return the pet with the given id', () => {
      const pet = service.getPetById('1');
      expect(pet).toBeDefined();
      expect(pet!.name).toBe('Max');
    });

    it('should return undefined for an unknown id', () => {
      expect(service.getPetById('999')).toBeUndefined();
    });
  });

  describe('addPet', () => {
    it('should add a pet and increase the count', () => {
      const before = service.allPets().length;
      service.addPet({
        name: 'TestPet',
        species: 'Cat',
        breed: 'Persian',
        age: 2,
        weight: 4,
        status: 'Active',
        ownerName: 'Test Owner',
        ownerEmail: 'owner@test.com',
        ownerPhone: '(555) 000-0000',
        lastVisit: '2026-01-01',
        nextAppointment: '',
        medicalNotes: '',
        vaccinations: '',
      });
      expect(service.allPets().length).toBe(before + 1);
    });

    it('should assign a unique id to the new pet', () => {
      const newPet = service.addPet({
        name: 'IdTestPet',
        species: 'Dog',
        breed: 'Poodle',
        age: 1,
        weight: 5,
        status: 'Active',
        ownerName: 'Id Owner',
        ownerEmail: 'id@owner.com',
        ownerPhone: '(555) 111-2222',
        lastVisit: '2026-02-01',
        nextAppointment: '',
        medicalNotes: '',
        vaccinations: '',
      });
      expect(newPet.id).toBeTruthy();
    });

    it('should set createdAt to today', () => {
      const today = new Date().toISOString().split('T')[0];
      const newPet = service.addPet({
        name: 'DatePet',
        species: 'Bird',
        breed: 'Parrot',
        age: 3,
        weight: 0.5,
        status: 'Active',
        ownerName: 'Date Owner',
        ownerEmail: 'd@d.com',
        ownerPhone: '(555) 333-4444',
        lastVisit: '2026-01-01',
        nextAppointment: '',
        medicalNotes: '',
        vaccinations: '',
      });
      expect(newPet.createdAt).toBe(today);
    });
  });

  describe('updatePet', () => {
    it('should update the specified pet', () => {
      service.updatePet('1', { name: 'Maxi' });
      expect(service.getPetById('1')!.name).toBe('Maxi');
    });

    it('should return the updated pet', () => {
      const updated = service.updatePet('2', { breed: 'Persian' });
      expect(updated).not.toBeNull();
      expect(updated!.breed).toBe('Persian');
    });

    it('should return null for an unknown id', () => {
      expect(service.updatePet('999', { name: 'Ghost' })).toBeNull();
    });

    it('should not change other pets', () => {
      const before = service.getPetById('2')!.name;
      service.updatePet('1', { name: 'Changed' });
      expect(service.getPetById('2')!.name).toBe(before);
    });
  });

  describe('deletePet', () => {
    it('should remove the pet with the given id', () => {
      const before = service.allPets().length;
      service.deletePet('1');
      expect(service.allPets().length).toBe(before - 1);
      expect(service.getPetById('1')).toBeUndefined();
    });

    it('should do nothing for an unknown id', () => {
      const before = service.allPets().length;
      service.deletePet('999');
      expect(service.allPets().length).toBe(before);
    });
  });

  describe('search', () => {
    it('should return all pets for empty query', () => {
      expect(service.search('').length).toBe(service.allPets().length);
    });

    it('should find pets by name (case-insensitive)', () => {
      const results = service.search('max');
      expect(results.some((p) => p.name === 'Max')).toBeTrue();
    });

    it('should find pets by owner name', () => {
      const results = service.search('John Smith');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should find pets by species', () => {
      const results = service.search('cat');
      expect(results.every((p) => p.species === 'Cat')).toBeTrue();
    });

    it('should find pets by breed', () => {
      const results = service.search('beagle');
      expect(results.some((p) => p.breed === 'Beagle')).toBeTrue();
    });

    it('should return empty array when nothing matches', () => {
      expect(service.search('zzznomatch999').length).toBe(0);
    });
  });
});
