import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartnerPaymentTracking } from './partner-payment-tracking';

describe('PartnerPaymentTracking', () => {
  let component: PartnerPaymentTracking;
  let fixture: ComponentFixture<PartnerPaymentTracking>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PartnerPaymentTracking]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PartnerPaymentTracking);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
