/**
 * Os details[].message do VALIDATION_ERROR vêm do Zod, em inglês
 * ("Too small: expected string to have >=8 characters"). Traduzimos por campo,
 * não por tradução literal da frase — a frase muda quando o schema muda.
 */
const FIELD_LABELS: Record<string, string> = {
  name: "Nome",
  email: "E-mail",
  password: "Senha",
  title: "Título",
  description: "Descrição",
  price: "Preço",
  date: "Data",
  imageUrl: "Imagem",
  seatId: "Assento",
  code: "Código do ingresso",
  "(corpo)": "Formulário",
};

export function labelForPath(path: string): string {
  const direct = FIELD_LABELS[path];
  if (direct) return direct;

  const lastSegment = path.split(".").at(-1) ?? path;
  return FIELD_LABELS[lastSegment] ?? path;
}

/**
 * Traduz details[].message do VALIDATION_ERROR (frase do Zod, em inglês) por
 * campo + tipo de violação, nunca repassando a frase original — ela muda
 * quando o schema muda, e em inglês não serve ao usuário final.
 */
export function translateValidationDetail(path: string, zodMessage: string): string {
  const label = labelForPath(path);
  const min = />=\s*(\d+)/.exec(zodMessage)?.[1];
  const max = /<=\s*(\d+)/.exec(zodMessage)?.[1];

  if (/invalid email/i.test(zodMessage)) return `${label}: formato de e-mail inválido.`;
  if (/too small/i.test(zodMessage) && min)
    return `${label}: deve ter pelo menos ${min} caracteres.`;
  if (/too big/i.test(zodMessage) && max) return `${label}: deve ter no máximo ${max} caracteres.`;
  if (/required|received undefined/i.test(zodMessage)) return `${label} é obrigatório.`;
  if (/invalid/i.test(zodMessage)) return `${label}: valor inválido.`;

  return `${label}: verifique o valor informado.`;
}
