import { MongoClient, Db, Collection, Document } from 'mongodb';

class Database {
  private static instance: Database;
  private client: MongoClient | null = null;
  private db: Db | null = null;

  private constructor() {}

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(): Promise<void> {
    if (this.client) {
      console.log('✅ Database already connected');
      return;
    }

    try {
      const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
      const dbName = process.env.DB_NAME || 'healthhub';

      this.client = new MongoClient(uri);
      await this.client.connect();
      this.db = this.client.db(dbName);

      console.log(`✅ MongoDB Connected Successfully to ${dbName}`);
      await this.createIndexes();
    } catch (error) {
      console.error('❌ MongoDB Connection Error:', error);
      process.exit(1);
    }
  }

  private async createIndexes(): Promise<void> {
    try {
      await this.getCollection('users').createIndex({ email: 1 }, { unique: true });
      await this.getCollection('users').createIndex({ role: 1 });
      await this.getCollection('doctors').createIndex({ userId: 1 }, { unique: true });
      await this.getCollection('patients').createIndex({ userId: 1 }, { unique: true });
      await this.getCollection('appointments').createIndex({ patientId: 1 });
      await this.getCollection('appointments').createIndex({ doctorId: 1 });
      console.log('✅ Indexes created successfully');
    } catch (error) {
      console.error('❌ Error creating indexes:', error);
    }
  }

  public getDb(): Db {
    if (!this.db) {
      throw new Error('Database not connected');
    }
    return this.db;
  }

  // ✅ Fix: Add extends Document constraint
  public getCollection<T extends Document>(name: string): Collection<T> {
    return this.getDb().collection<T>(name);
  }

  public async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      console.log('✅ Database disconnected');
    }
  }
}

export const db = Database.getInstance();