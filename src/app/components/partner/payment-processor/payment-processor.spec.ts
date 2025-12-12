import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentProcessor } from './payment-processor';

describe('PaymentProcessor', () => {
  let component: PaymentProcessor;
  let fixture: ComponentFixture<PaymentProcessor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentProcessor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentProcessor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
