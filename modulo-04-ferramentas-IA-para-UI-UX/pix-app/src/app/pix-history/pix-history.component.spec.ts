import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LOCALE_ID } from '@angular/core';
import { Location, registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { PixHistoryComponent } from './pix-history.component';
import { PixHistoryBaseService } from './services/pix-history-base.service';
import { Transaction } from './models/pix-history.model';
import { Injectable } from '@angular/core';

registerLocaleData(localePt);

/**
 * Mock síncrono do serviço para testes — sem delays simulados.
 */
@Injectable()
class MockPixHistoryTestService extends PixHistoryBaseService {
  async carregarTransacoes(): Promise<Transaction[]> {
    return [
      {
        id: 'tx-1',
        title: 'Pix recebido - Erick S.',
        amount: 500.0,
        type: 'received',
        date: '14 de Março, 14:30',
        category: 'transfer',
      },
      {
        id: 'tx-2',
        title: 'Transferência enviada - Pagamentos S/A',
        amount: 150.0,
        type: 'sent',
        date: '13 de Março, 09:15',
        category: 'transfer',
      },
      {
        id: 'tx-3',
        title: 'Pix recebido - Loja Central',
        amount: 1250.0,
        type: 'received',
        date: '12 de Março, 18:45',
        category: 'transfer',
      },
      {
        id: 'tx-4',
        title: 'Pagamento efetuado - QR Code',
        amount: 42.9,
        type: 'sent',
        date: '12 de Março, 10:20',
        category: 'qr-code',
      },
    ];
  }

  async solicitarRelatorio(): Promise<boolean> {
    return true;
  }
}

describe('PixHistoryComponent', () => {
  let component: PixHistoryComponent;
  let fixture: ComponentFixture<PixHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PixHistoryComponent],
      providers: [
        { provide: LOCALE_ID, useValue: 'pt-BR' },
        { provide: PixHistoryBaseService, useClass: MockPixHistoryTestService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PixHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // Aguarda carregamento assíncrono via facade (mock sem delay)
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render the header title and subtitle', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const title = compiled.querySelector('.history-title');
    const subtitle = compiled.querySelector('.history-subtitle');

    expect(title?.textContent?.trim()).toBe('Extrato Pix');
    expect(subtitle?.textContent?.trim()).toBe('Confira suas últimas movimentações');
  });

  it('should render all transactions loaded via facade', () => {
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
  });

  it('should not render bottom navigation bar', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const bottomNav = compiled.querySelector('.bottom-nav');

    expect(bottomNav).toBeNull();
  });

  it('should trigger report generation on button click', async () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const btnReport = compiled.querySelector('.btn-report') as HTMLButtonElement;

    btnReport.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component['facade'].relatorioSolicitado()).toBe(true);
  });

  it('should call location.back when the go back button is clicked', () => {
    const location = TestBed.inject(Location);
    const backSpy = vi.spyOn(location, 'back');
    const compiled = fixture.nativeElement as HTMLElement;
    const backButton = compiled.querySelector(
      'button[aria-label="Voltar para a página anterior"]'
    ) as HTMLButtonElement;

    backButton.click();

    expect(backSpy).toHaveBeenCalledTimes(1);
  });
});
