import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CedantDashboard } from './cedant-dashboard';

describe('CedantDashboard', () => {
  let component: CedantDashboard;
  let fixture: ComponentFixture<CedantDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CedantDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CedantDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
