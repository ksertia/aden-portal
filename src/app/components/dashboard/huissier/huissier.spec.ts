import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Huissier } from './huissier';

describe('Huissier', () => {
  let component: Huissier;
  let fixture: ComponentFixture<Huissier>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Huissier]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Huissier);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
