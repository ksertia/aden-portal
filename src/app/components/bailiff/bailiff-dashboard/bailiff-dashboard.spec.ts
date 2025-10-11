import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BailiffDashboard } from './bailiff-dashboard';

describe('BailiffDashboard', () => {
  let component: BailiffDashboard;
  let fixture: ComponentFixture<BailiffDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BailiffDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BailiffDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
