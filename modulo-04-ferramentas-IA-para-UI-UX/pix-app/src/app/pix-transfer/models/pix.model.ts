export interface PixTransferData {
  chave: string;
  valor: number | null;
  data: string;
}

export type PixTransferStatus = 'idle' | 'loading' | 'success' | 'error';

export interface PixReceipt {
  id: string;
  chave: string;
  valor: number;
  dataAgendamento: string;
  dataCriacao: string;
  autenticacao: string;
}

export interface PixState {
  saldo: number;
  status: PixTransferStatus;
  ultimoRecibo: PixReceipt | null;
  mensagemErro: string | null;
  historico: PixReceipt[];
}
