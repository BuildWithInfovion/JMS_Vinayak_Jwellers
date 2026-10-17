// Girvi (gahan) interest: simple interest at a monthly rate, counted by days (30 days = 1 month).
// Stores that count part-months differently can change GIRVI_MIN_DAYS (minimum days charged).
const MIN_DAYS = Number(process.env.GIRVI_MIN_DAYS || 0);

function interestDue(record, asOf = new Date()) {
  const start = new Date(record.pawnDate);
  const days = Math.max(MIN_DAYS, Math.ceil((asOf - start) / 86400000));
  const interest = (record.amountGiven * (record.interestRate / 100) * days) / 30;
  return { days, interest: Math.round(interest * 100) / 100 };
}

module.exports = { interestDue };
