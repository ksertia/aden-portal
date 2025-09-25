import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Avocat } from './avocat';

describe('Avocat', () => {
  let component: Avocat;
  let fixture: ComponentFixture<Avocat>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Avocat]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Avocat);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
