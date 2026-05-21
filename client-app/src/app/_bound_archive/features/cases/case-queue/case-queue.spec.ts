import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaseQueue } from './case-queue';

describe('CaseQueue', () => {
  let component: CaseQueue;
  let fixture: ComponentFixture<CaseQueue>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CaseQueue]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaseQueue);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
