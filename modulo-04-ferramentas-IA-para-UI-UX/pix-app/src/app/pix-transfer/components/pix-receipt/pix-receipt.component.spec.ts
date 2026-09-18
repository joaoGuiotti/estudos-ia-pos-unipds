import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { PixReceiptComponent } from './pix-receipt.component';
import { PixReceipt } from '../../models/pix.model';

registerLocaleData(localePt);

describe('PixReceiptComponent', () => {
  let component: PixReceiptComponent;
  let fixture: ComponentFixture<PixReceiptComponent>;

  const mockReceipt: PixReceipt = {
    id: 'PIX-TEST-999',
    chave: 'jhon.g@email.com',
    valor: 150.0,
    dataAgendamento: '2026-09-17',
    dataCriacao: '2026-09-17T15:42:00.000Z',
    autenticacao: 'AUTH-999-XYZ',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PixReceiptComponent],
      providers: [{ provide: LOCALE_ID, useValue: 'pt-BR' }],
    }).compileComponents();

    fixture = TestBed.createComponent(PixReceiptComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should display the formatted amount and recipient details via inputs', () => {
    fixture.componentRef.setInput('recibo', mockReceipt);
    fixture.componentRef.setInput('nome', 'Jhon G.');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const amountEl = compiled.querySelector('.receipt-amount');
    const nameEl = compiled.querySelector('.receiver-name');
    const keyEl = compiled.querySelector('.receiver-key');
    const timestampEl = compiled.querySelector('.receipt-timestamp');

    expect(amountEl?.textContent).toMatch(/150[.,]00/);
    expect(nameEl?.textContent).toContain('Jhon G.');
    expect(keyEl?.textContent).toContain('jhon.g@email.com');
    const authEl = compiled.querySelector('.auth-code');
    expect(authEl?.textContent).toContain('AUTH-999-XYZ');
    expect(timestampEl?.textContent?.toLowerCase()).toContain('setembro');
  });

  it('should compute recipient initials correctly', () => {
    fixture.componentRef.setInput('nome', 'Carlos Eduardo Silva');
    fixture.detectChanges();
    expect(component.iniciais()).toBe('CS');

    fixture.componentRef.setInput('nome', 'Maria');
    fixture.detectChanges();
    expect(component.iniciais()).toBe('MA');
  });

  it('should emit voltar event when return button is clicked', () => {
    let emitted = false;
    component.voltar.subscribe(() => {
      emitted = true;
    });

    fixture.componentRef.setInput('recibo', mockReceipt);
    fixture.detectChanges();

    const btnReturn = fixture.nativeElement.querySelector('.btn-return') as HTMLButtonElement;
    btnReturn.click();

    expect(emitted).toBe(true);
  });

  it('should trigger authentication copy and update copied status', async () => {
    fixture.componentRef.setInput('recibo', mockReceipt);
    fixture.detectChanges();

    await component.copiarAutenticacao();
    expect(component.copiado()).toBe(true);
  });
});
