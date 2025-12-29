import { Target } from "@/types";

/**
 * Lógica de Maturidade Policial:
 * - Operação base: 10%
 * - Por Alvo:
 *   - Possui CPF: +15%
 *   - Possui Vulgo: +5%
 *   - Possui Foto: +5%
 *   - Possui ao menos 1 endereço: +10%
 *   - Possui ao menos 1 endereço CONFIRMADO: +20%
 * 
 * O cálculo é normalizado para não ultrapassar 100% e reflete a 
 * robustez probatória da operação.
 */
export function calculateMaturity(targets: Target[]): number {
  if (targets.length === 0) return 10;

  const totalPoints = targets.reduce((acc, target) => {
    let points = 0;
    if (target.hasCpf && target.cpf && target.cpf.length >= 11) points += 15;
    if (target.nickname) points += 5;
    if (target.hasPhoto) points += 5;
    if (target.addresses && target.addresses.length > 0) {
      points += 10;
      if (target.addresses.some(a => a.isConfirmed)) points += 20;
    }
    return acc + points;
  }, 0);

  // Média de maturidade baseada nos alvos, partindo de um piso de 10%
  const averageTargetMaturity = totalPoints / targets.length;
  const finalMaturity = 10 + averageTargetMaturity;

  return Math.min(Math.round(finalMaturity), 100);
}