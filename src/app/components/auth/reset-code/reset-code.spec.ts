import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResetCode } from './reset-code';

describe('ResetCode', () => {
  let component: ResetCode;
  let fixture: ComponentFixture<ResetCode>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResetCode]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResetCode);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
