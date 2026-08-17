/**
 * Fallbacks por domínio. A API já devolve `message` em português na maioria
 * dos casos — prefira sempre exibir a dela. Isto cobre o que ela não cobre:
 * falha de rede, timeout e estados que só o cliente conhece.
 */
export const messages = {
  network: {
    offline: "Sem conexão. Verifique sua internet e tente de novo.",
    timeout: "O servidor demorou a responder. Tente de novo em instantes.",
    unexpected: "Algo deu errado. Se persistir, informe o código abaixo ao suporte.",
  },
  auth: {
    sessionExpired: "Sua sessão expirou. Entre novamente.",
    forbidden: "Você não tem permissão para acessar esta área.",
  },
  reservations: {
    seatTaken: "Este assento acabou de ser reservado por outra pessoa. Escolha outro.",
    expired: "O tempo da reserva acabou. Selecione o assento novamente.",
  },
  payment: {
    refused: "Pagamento recusado. Tente novamente ou escolha outra forma.",
  },
  checkin: {
    cameraDenied: "Não foi possível acessar a câmera. Use o código manual abaixo.",
    readerUnavailable:
      "A leitura automática do QR parou de funcionar neste dispositivo. Digite o código do ingresso abaixo.",
  },
} as const;
