import { Component, ElementRef, effect, input, output, signal, viewChild } from '@angular/core';
import { FormField, FormRoot, form, min, required, submit } from '@angular/forms/signals';
import { PixTransferData } from '../../models/pix.model';

@Component({
  selector: 'app-pix-transfer-form',
  imports: [FormField, FormRoot],
  templateUrl: './pix-transfer-form.component.html',
  styleUrl: './pix-transfer-form.component.scss',
})
export class PixTransferFormComponent {
  readonly isLoading = input<boolean>(false);
  readonly isSuccess = input<boolean>(false);
  readonly transferir = output<PixTransferData>();

  protected readonly dataMinima = new Date().toISOString().split('T')[0];

  protected readonly pixModel = signal<PixTransferData>({
    chave: '',
    valor: null,
    data: new Date().toISOString().split('T')[0],
  });

  protected readonly pixForm = form(this.pixModel, (s) => {
    required(s.chave);
    required(s.valor);
    min(s.valor, 0.01);
    required(s.data);
  });

  private readonly chaveInput = viewChild<ElementRef<HTMLInputElement>>('chaveInput');
  private readonly valorInput = viewChild<ElementRef<HTMLInputElement>>('valorInput');
  private readonly dataInput = viewChild<ElementRef<HTMLInputElement>>('dataInput');

  constructor() {
    effect(() => {
      if (this.isSuccess()) {
        this.limpar();
      }
    });
  }

  protected async submeter(event: Event): Promise<void> {
    event.preventDefault();

    await submit(this.pixForm, async () => {
      this.transferir.emit({ ...this.pixModel() });
    });

    if (this.pixForm().invalid()) {
      this.focarPrimeiroCampoInvalido();
    }
  }

  private focarPrimeiroCampoInvalido(): void {
    if (this.pixForm.chave().invalid()) {
      this.chaveInput()?.nativeElement.focus();
    } else if (this.pixForm.valor().invalid()) {
      this.valorInput()?.nativeElement.focus();
    } else if (this.pixForm.data().invalid()) {
      this.dataInput()?.nativeElement.focus();
    }
  }

  limpar(): void {
    this.pixForm().reset();
    this.pixModel.set({
      chave: '',
      valor: null,
      data: new Date().toISOString().split('T')[0],
    });
  }
}

