import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Creancier } from './creancier';

describe('Creancier', () => {
  let component: Creancier;
  let fixture: ComponentFixture<Creancier>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Creancier]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Creancier);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
