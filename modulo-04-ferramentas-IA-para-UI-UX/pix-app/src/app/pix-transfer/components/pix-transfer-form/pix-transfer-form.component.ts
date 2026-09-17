import { Component, effect, input, output, signal } from '@angular/core';
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

