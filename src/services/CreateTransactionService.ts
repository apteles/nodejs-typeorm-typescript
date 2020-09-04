import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: TransactionType;
  category: string;
}

enum TransactionType {
  INCOME = 'income',
  OUTCOME = 'outcome',
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionsRepository);

    const balance = await transactionRepository.getBalance();

    if (type === TransactionType.OUTCOME && value > balance.total) {
      throw new AppError('Sorry, insufficient founds', 400);
    }

    const categoryRepository = getRepository(Category);

    let categoryExists = await categoryRepository.findOne({
      where: { title: category.trim() },
    });

    if (!categoryExists) {
      categoryExists = categoryRepository.create({ title: category });
      await categoryRepository.save(categoryExists);
    }
    const { id: category_id } = categoryExists;

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category_id,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
