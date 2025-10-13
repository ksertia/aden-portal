import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LawyerDashboard } from './lawyer-dashboard';

describe('LawyerDashboard', () => {
  let component: LawyerDashboard;
  let fixture: ComponentFixture<LawyerDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LawyerDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LawyerDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
