import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartnerChat } from './partner-chat';

describe('PartnerChat', () => {
  let component: PartnerChat;
  let fixture: ComponentFixture<PartnerChat>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PartnerChat]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PartnerChat);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
