import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Partenaire } from './partenaire';

describe('Partenaire', () => {
  let component: Partenaire;
  let fixture: ComponentFixture<Partenaire>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Partenaire]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Partenaire);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
