import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  LucideArrowLeft,
  LucideCheck,
  LucideCopy,
  LucidePrinter,
  LucideShare2,
  LucideZap,
} from '@lucide/angular';
import { PixReceipt } from '../../models/pix.model';

@Component({
  selector: 'app-pix-receipt',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    LucideCheck,
    LucideCopy,
    LucideArrowLeft,
    LucideZap,
    LucidePrinter,
    LucideShare2,
  ],
  templateUrl: './pix-receipt.component.html',
  styleUrl: './pix-receipt.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PixReceiptComponent {
  // Inputs Reativos baseados em Signals (Angular 21+)
  readonly recibo = input<PixReceipt | null>(null);
  readonly valor = input<number | null>(null);
  readonly nome = input<string>('Jhon G.');
  readonly chave = input<string>('');
  readonly instituicao = input<string>('Nubank S.A.');
  readonly tipoConta = input<string>('Conta Corrente');
  readonly idTransacao = input<string>('');
  readonly autenticacao = input<string>('');
  readonly data = input<string>('');

  // Evento de retorno / nova transferência
  readonly voltar = output<void>();

  // Estado local para feedback de cópia
  readonly copiado = signal<boolean>(false);

  // Signals computados para composição de dados
  readonly valorExibicao = computed(() => this.valor() ?? this.recibo()?.valor ?? 0);

  readonly chaveExibicao = computed(
    () => this.chave() || this.recibo()?.chave || 'Chave não informada'
  );

  readonly idTransacaoExibicao = computed(
    () => this.idTransacao() || this.recibo()?.id || 'PIX-' + Date.now().toString(36).toUpperCase()
  );

  readonly autenticacaoExibicao = computed(
    () =>
      this.autenticacao() ||
      this.recibo()?.autenticacao ||
      'AUT-' + Math.random().toString(36).substring(2, 12).toUpperCase()
  );

  readonly dataExibicao = computed(() => {
    if (this.data()) return this.data();
    if (this.recibo()?.dataCriacao) return this.recibo()!.dataCriacao;
    return new Date().toISOString();
  });

  readonly iniciais = computed(() => {
    const nomeLimpo = (this.nome() || '').trim();
    if (!nomeLimpo) return 'PX';
    const partes = nomeLimpo.split(/\s+/);
    if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  });

  async copiarAutenticacao(): Promise<void> {
    const codigo = this.autenticacaoExibicao();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(codigo);
        this.notificarCopia();
        return;
      } catch {
        // Fallback caso clipboard API falhe
      }
    }
    this.notificarCopia();
  }

  imprimir(): void {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }

  async compartilhar(): Promise<void> {
    const textoCompartilhamento = `Comprovante Pix de ${this.nome()} no valor de R$ ${this.valorExibicao().toFixed(
      2
    )}. ID: ${this.idTransacaoExibicao()}`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Comprovante Pix',
          text: textoCompartilhamento,
        });
        return;
      } catch {
        // Usuário cancelou ou navegador rejeitou o compartilhamento nativo
      }
    }

    // Fallback: copia o resumo da transferência
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(textoCompartilhamento);
      this.notificarCopia();
    }
  }

  protected onVoltar(): void {
    this.voltar.emit();
  }

  private notificarCopia(): void {
    this.copiado.set(true);
    setTimeout(() => {
      this.copiado.set(false);
    }, 2500);
  }
}
