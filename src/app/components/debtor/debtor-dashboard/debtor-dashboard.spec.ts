import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DebtorDashboard } from './debtor-dashboard';

describe('DebtorDashboard', () => {
  let component: DebtorDashboard;
  let fixture: ComponentFixture<DebtorDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DebtorDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DebtorDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
