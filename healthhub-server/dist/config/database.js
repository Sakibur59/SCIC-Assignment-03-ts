"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const mongodb_1 = require("mongodb");
class Database {
    constructor() {
        this.client = null;
        this.db = null;
    }
    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }
    async connect() {
        if (this.client) {
            console.log('✅ Database already connected');
            return;
        }
        try {
            const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
            const dbName = process.env.DB_NAME || 'healthhub';
            this.client = new mongodb_1.MongoClient(uri);
            await this.client.connect();
            this.db = this.client.db(dbName);
            console.log(`✅ MongoDB Connected Successfully to ${dbName}`);
            await this.createIndexes();
        }
        catch (error) {
            console.error('❌ MongoDB Connection Error:', error);
            process.exit(1);
        }
    }
    async createIndexes() {
        try {
            await this.getCollection('users').createIndex({ email: 1 }, { unique: true });
            await this.getCollection('users').createIndex({ role: 1 });
            await this.getCollection('doctors').createIndex({ userId: 1 }, { unique: true });
            await this.getCollection('patients').createIndex({ userId: 1 }, { unique: true });
            await this.getCollection('appointments').createIndex({ patientId: 1 });
            await this.getCollection('appointments').createIndex({ doctorId: 1 });
            console.log('✅ Indexes created successfully');
        }
        catch (error) {
            console.error('❌ Error creating indexes:', error);
        }
    }
    getDb() {
        if (!this.db) {
            throw new Error('Database not connected');
        }
        return this.db;
    }
    // ✅ Fix: Add extends Document constraint
    getCollection(name) {
        return this.getDb().collection(name);
    }
    async disconnect() {
        if (this.client) {
            await this.client.close();
            this.client = null;
            this.db = null;
            console.log('✅ Database disconnected');
        }
    }
}
exports.db = Database.getInstance();
