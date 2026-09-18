import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { PixHistoryComponent } from './pix-history.component';
import { PixHistoryBaseService } from './services/pix-history-base.service';
import { PixHistoryService } from './services/pix-history.service';

registerLocaleData(localePt);

describe('PixHistoryComponent', () => {
  let component: PixHistoryComponent;
  let fixture: ComponentFixture<PixHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PixHistoryComponent],
      providers: [
        { provide: LOCALE_ID, useValue: 'pt-BR' },
        { provide: PixHistoryBaseService, useClass: PixHistoryService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PixHistoryComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render the header title and subtitle', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const title = compiled.querySelector('.history-title');
    const subtitle = compiled.querySelector('.history-subtitle');

    expect(title?.textContent?.trim()).toBe('Extrato Pix');
    expect(subtitle?.textContent?.trim()).toBe('Confira suas últimas movimentações');
  });

  it('should render all transactions loaded via facade', fakeAsync(() => {
    fixture.detectChanges();
    // Avança o timer simulado do serviço (400ms de latência)
    tick(500);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const items = compiled.querySelectorAll('.transaction-item');

    expect(items.length).toBe(4);
    expect(items[0].textContent).toContain('Pix recebido - Erick S.');
    expect(items[0].textContent).toContain('+ R$ 500,00');
    expect(items[1].textContent).toContain('Transferência enviada - Pagamentos S/A');
    expect(items[1].textContent).toContain('- R$ 150,00');
    expect(items[2].textContent).toContain('Pix recebido - Loja Central');
    expect(items[2].textContent).toContain('+ R$ 1.250,00');
    expect(items[3].textContent).toContain('Pagamento efetuado - QR Code');
    expect(items[3].textContent).toContain('- R$ 42,90');
  }));

  it('should not render bottom navigation bar', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const bottomNav = compiled.querySelector('.bottom-nav');

    expect(bottomNav).toBeNull();
  });

  it('should trigger report generation on button click', fakeAsync(() => {
    fixture.detectChanges();
    tick(500);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const btnReport = compiled.querySelector('.btn-report') as HTMLButtonElement;

    btnReport.click();
    // Avança o timer simulado do relatório (600ms)
    tick(700);
    fixture.detectChanges();

    expect(component['facade'].relatorioSolicitado()).toBe(true);

    // Limpa o timer de reset do relatório (3000ms)
    tick(3000);
  }));
});
