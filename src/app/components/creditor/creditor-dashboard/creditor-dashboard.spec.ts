import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditorDashboard } from './creditor-dashboard';

describe('CreditorDashboard', () => {
  let component: CreditorDashboard;
  let fixture: ComponentFixture<CreditorDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreditorDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreditorDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
