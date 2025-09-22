import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Cedant } from './cedant';

describe('Cedant', () => {
  let component: Cedant;
  let fixture: ComponentFixture<Cedant>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cedant]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Cedant);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
