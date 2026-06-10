export type PetSpecies = 'Dog' | 'Cat' | 'Bird' | 'Rabbit' | 'Other';
export type PetStatus = 'Active' | 'Inactive';

export interface Pet {
  id: string;
  name: string;
  species: PetSpecies;
  breed: string;
  age: number;
  weight: number;
  status: PetStatus;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  lastVisit: string;
  nextAppointment: string;
  medicalNotes: string;
  vaccinations: string;
  createdAt: string;
}
