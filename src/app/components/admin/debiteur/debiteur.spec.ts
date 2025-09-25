import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Debiteur } from './debiteur';

describe('Debiteur', () => {
  let component: Debiteur;
  let fixture: ComponentFixture<Debiteur>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Debiteur]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Debiteur);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
