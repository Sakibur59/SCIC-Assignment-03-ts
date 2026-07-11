import { ObjectId } from "mongodb";
import { db } from "../config/database";
import { IUser } from "../types";
import bcrypt from "bcryptjs";

export class UserModel {
  private static collectionName = "users";

  static async create(userData: Partial<IUser>): Promise<IUser> {
    const collection = db.getCollection<IUser>(this.collectionName);

    if (userData.password) {
      const salt = await bcrypt.genSalt(10);
      userData.password = await bcrypt.hash(userData.password, salt);
    }

    const now = new Date();
    const user: IUser = {
      ...userData,
      createdAt: now,
      updatedAt: now,
    } as IUser;

    const result = await collection.insertOne(user);
    const insertedUser = await collection.findOne({ _id: result.insertedId });

    if (!insertedUser) {
      throw new Error("User creation failed");
    }

    return insertedUser;
  }

  static async findByEmail(email: string): Promise<IUser | null> {
    const collection = db.getCollection<IUser>(this.collectionName);
    return await collection.findOne({ email });
  }

  static async findById(id: string | ObjectId): Promise<any> {
    const collection = db.getCollection<IUser>(this.collectionName);
    const _id = typeof id === "string" ? new ObjectId(id) : id;
    return await collection.findOne({ _id }, { projection: { password: 0 } });
  }

  static async comparePassword(
    user: IUser,
    candidatePassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, user.password);
  }
  static async update(
    id: string | ObjectId,
    data: Partial<IUser>,
  ): Promise<IUserWithoutPassword | null> {
    const collection = db.getCollection<IUser>(this.collectionName);
    const _id = typeof id === "string" ? new ObjectId(id) : id;

    // If password is being updated, hash it
    if (data.password) {
      const salt = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash(data.password, salt);
    }

    const result = await collection.findOneAndUpdate(
      { _id },
      { $set: { ...data, updatedAt: new Date() } },
      { returnDocument: "after" },
    );

    if (!result) {
      return null;
    }

    const { password, ...userWithoutPassword } = result;
    return userWithoutPassword;
  }
}

