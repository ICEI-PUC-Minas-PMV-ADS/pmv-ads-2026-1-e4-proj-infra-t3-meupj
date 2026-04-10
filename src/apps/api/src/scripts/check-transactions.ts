import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME;

if (!uri) {
  throw new Error('MONGODB_URI is required for check-transactions');
}

if (!dbName) {
  throw new Error('MONGODB_DB_NAME is required for check-transactions');
}

const client = new MongoClient(uri, {
  retryWrites: true,
  retryReads: true,
});

async function main() {
  await client.connect();
  const db = client.db(dbName);
  console.log('Checking database:', db.databaseName);
  const collection = db.collection('transactions');
  const count = await collection.countDocuments();
  const docs = await collection.find().limit(5).toArray();
  console.log('count:', count);
  console.log('docs:', docs);
  await client.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
