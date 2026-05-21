import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProviderOnboarding } from './provider-onboarding';

describe('ProviderOnboarding', () => {
  let component: ProviderOnboarding;
  let fixture: ComponentFixture<ProviderOnboarding>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProviderOnboarding]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProviderOnboarding);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
