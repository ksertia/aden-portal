import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditorPayments } from './creditor-payments';

describe('CreditorPayments', () => {
  let component: CreditorPayments;
  let fixture: ComponentFixture<CreditorPayments>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreditorPayments]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreditorPayments);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
