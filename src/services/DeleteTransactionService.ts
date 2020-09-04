import { getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';

class DeleteTransactionService {
  public async execute({ id }: { id: string }): Promise<void> {
    const transactionRepository = getRepository(Transaction);

    const foundTransantion = await transactionRepository.findOne(id);

    if (!foundTransantion) {
      throw new AppError('Transaction not found');
    }

    await transactionRepository.remove(foundTransantion);
  }
}

export default DeleteTransactionService;
