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
