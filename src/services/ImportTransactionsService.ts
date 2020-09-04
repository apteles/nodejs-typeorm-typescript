import csvParser from 'csv-parse';
import fs from 'fs';
import { getRepository, In } from 'typeorm';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  path: string;
}

enum TransactionType {
  INCOME = 'income',
  OUTCOME = 'outcome',
}

interface CSVTransaction {
  title: string;
  type: TransactionType;
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute({ path }: Request): Promise<Transaction[]> {
    const contactsReadStream = fs.createReadStream(path);
    const categoriesRepository = getRepository(Category);
    const transactionsRepository = getRepository(Transaction);

    const parsers = csvParser({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = contactsReadStream.pipe(parsers);

    const transactions: CSVTransaction[] = [];

    const categories: string[] = [];

    parseCSV.on('data', async line => {
      const [title, type, value, category] = line;

      if (!title || !type || !value || !category) {
        return '';
      }

      transactions.push({ title, type, value, category });
      categories.push(category);
      return '';
    });

    await new Promise(resolve => parseCSV.on('end', resolve));

    const existentCategories = await categoriesRepository.find({
      where: { title: In(categories) },
    });
    const existentCategoriesTitles = existentCategories.map(
      (category: Category) => category.title,
    );

    const addCategoryTitles = categories
      .filter(category => !existentCategoriesTitles.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);

    const newCategories = categoriesRepository.create(
      addCategoryTitles.map(title => ({ title })),
    );

    await categoriesRepository.save(newCategories);

    const finalCategories = [...newCategories, ...existentCategories];

    const transactionsMapped = transactions.map(transaction => ({
      title: transaction.title,
      type: transaction.type,
      value: transaction.value,
      category: finalCategories.find(
        category => category.title === transaction.category,
      ),
    }));

    const createdTransactions = transactionsRepository.create(
      transactionsMapped,
    );

    await transactionsRepository.save(createdTransactions);
    await fs.promises.unlink(path);

    return createdTransactions;
  }
}

export default ImportTransactionsService;
