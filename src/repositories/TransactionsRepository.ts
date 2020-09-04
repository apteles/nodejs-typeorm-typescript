import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const income = await this.find({ where: { type: 'income' } });
    const outcome = await this.find({ where: { type: 'outcome' } });

    const sumIncome = income.reduce((acc, cv) => acc + cv.value, 0);
    const sumOutcome = outcome.reduce((acc, cv) => acc + cv.value, 0);

    return {
      income: sumIncome,
      outcome: sumOutcome,
      total: sumIncome - sumOutcome,
    };
  }
}

export default TransactionsRepository;
