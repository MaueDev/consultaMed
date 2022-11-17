import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeuArquivosComponent } from './meusarquivos.component';

describe('MeuArquivosComponent', () => {
  let component: MeuArquivosComponent;
  let fixture: ComponentFixture<MeuArquivosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeuArquivosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeuArquivosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
