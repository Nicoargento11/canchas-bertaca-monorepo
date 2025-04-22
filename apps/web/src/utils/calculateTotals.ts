const calculateTotals = (reserve: {
  price?: number;
  Payment?: Array<{ amount: number }>;
  consumitions?: Array<{ quantity: number; price: number }>;
}) => {
  const consumitionAmount =
    reserve.consumitions?.reduce(
      (sum, ps) => sum + ps.quantity * ps.price,
      0
    ) || 0;

  const paidAmount =
    reserve.Payment?.reduce((sum, p) => sum + p.amount, 0) || 0;

  const courtPrice = reserve.price || 0;
  const totalAmount = courtPrice + consumitionAmount;
  const balance = paidAmount - totalAmount;
  return {
    consumitionAmount,
    paidAmount,
    totalAmount,
    balance,
  };
};

export default calculateTotals;
