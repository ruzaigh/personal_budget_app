export const generateId = (): string =>
  Math.random().toString(36).substring(2, 9);

export const formatCurrency = (amount: number): string =>
  `$${amount.toFixed(2)}`;

export const validateAmount = (value: string): number | null => {
  const amount = parseFloat(value);
  return !isNaN(amount) && amount > 0 ? amount : null;
};

export const validatePositiveNumber = (value: string): boolean => {
  const num = parseFloat(value);
  return !isNaN(num) && num >= 0;
};
