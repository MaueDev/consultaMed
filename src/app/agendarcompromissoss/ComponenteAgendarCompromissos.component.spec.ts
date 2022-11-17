import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponenteAgendarCompromissos } from './ComponenteAgendarCompromissos.component';

describe('ComponenteAgendarCompromissos', () => {
  let component: ComponenteAgendarCompromissos;
  let fixture: ComponentFixture<ComponenteAgendarCompromissos>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComponenteAgendarCompromissos ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComponenteAgendarCompromissos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
