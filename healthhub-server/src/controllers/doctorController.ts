import { Request, Response } from "express";
import { db } from "../config/database";
import { ObjectId } from "mongodb";

// ✅ Get all doctors
export const getDoctors = async (req: Request, res: Response) => {
  try {
    console.log("📋 Fetching all doctors with user data...");

    const collection = db.getCollection("doctors");

    const pipeline = [
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userData",
        },
      },
      { $unwind: { path: "$userData", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          userId: 1,
          specialization: 1,
          experience: 1,
          education: 1,
          availability: 1,
          rating: 1,
          consultationFee: 1,
          createdAt: 1,
          updatedAt: 1,
          name: "$userData.name",
          email: "$userData.email",
          address: "$userData.address",
          phone: "$userData.phone",
          profilePicture: "$userData.profilePicture",
          role: "$userData.role",
        },
      },
    ];

    const doctors = await collection.aggregate(pipeline).toArray();

    const formattedDoctors = doctors.map((doc: any) => ({
      _id: doc._id,
      name: doc.name || "Doctor",
      email: doc.email || "",
      role: doc.role || "doctor",
      address: doc.address || "",
      phone: doc.phone || "",
      profilePicture: doc.profilePicture || "",
      roleData: {
        specialization: doc.specialization || "General Medicine",
        experience: doc.experience || 0,
        education: doc.education || ["MBBS"],
        availability: doc.availability || [],
        rating: doc.rating || 0,
        consultationFee: doc.consultationFee || 0,
      },
    }));

    console.log(`✅ Found ${formattedDoctors.length} doctors`);

    res.status(200).json({
      success: true,
      count: formattedDoctors.length,
      data: formattedDoctors,
    });
  } catch (error: any) {
    console.error("❌ Error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to get doctors",
    });
  }
};

// ✅ Get single doctor by ID
export const getDoctor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const collection = db.getCollection("doctors");
    const pipeline = [
      { $match: { _id: new ObjectId(id) } },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userData",
        },
      },
      { $unwind: { path: "$userData", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          userId: 1,
          specialization: 1,
          experience: 1,
          education: 1,
          availability: 1,
          rating: 1,
          consultationFee: 1,
          createdAt: 1,
          updatedAt: 1,
          name: "$userData.name",
          email: "$userData.email",
          address: "$userData.address",
          phone: "$userData.phone",
          profilePicture: "$userData.profilePicture",
          role: "$userData.role",
        },
      },
    ];

    const result = await collection.aggregate(pipeline).toArray();
    const doctor = result[0];

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }
    const formattedDoctor = {
      _id: doctor._id,
      name: doctor.name || "Doctor",
      email: doctor.email || "",
      role: doctor.role || "doctor",
      address: doctor.address || "",
      phone: doctor.phone || "",
      profilePicture: doctor.profilePicture || "",
      roleData: {
        specialization: doctor.specialization || "General Medicine",
        experience: doctor.experience || 0,
        education: doctor.education || ["MBBS"],
        availability: doctor.availability || [],
        rating: doctor.rating || 0,
        consultationFee: doctor.consultationFee || 0,
      },
    };

    res.status(200).json({
      success: true,
      data: formattedDoctor,
    });
  } catch (error: any) {
    console.error("❌ Error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to get doctor",
    });
  }
};

// ✅ Get doctor by userId (for doctor settings)
export const getDoctorByUserId = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const collection = db.getCollection("doctors");

    const pipeline = [
      { $match: { userId: new ObjectId(userId) } },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userData",
        },
      },
      { $unwind: { path: "$userData", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          userId: 1,
          specialization: 1,
          experience: 1,
          education: 1,
          availability: 1,
          rating: 1,
          consultationFee: 1,
          createdAt: 1,
          updatedAt: 1,
          name: "$userData.name",
          email: "$userData.email",
          address: "$userData.address",
          phone: "$userData.phone",
          profilePicture: "$userData.profilePicture",
          role: "$userData.role",
        },
      },
    ];

    const result = await collection.aggregate(pipeline).toArray();
    const doctor = result[0];

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found for this user",
      });
    }

    const formattedDoctor = {
      _id: doctor._id,
      name: doctor.name || "Doctor",
      email: doctor.email || "",
      role: doctor.role || "doctor",
      address: doctor.address || "",
      phone: doctor.phone || "",
      profilePicture: doctor.profilePicture || "",
      roleData: {
        specialization: doctor.specialization || "General Medicine",
        experience: doctor.experience || 0,
        education: doctor.education || ["MBBS"],
        availability: doctor.availability || [],
        rating: doctor.rating || 0,
        consultationFee: doctor.consultationFee || 0,
      },
    };

    res.status(200).json({
      success: true,
      data: formattedDoctor,
    });
  } catch (error: any) {
    console.error("❌ Error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to get doctor by userId",
    });
  }
};

// ✅ Get doctors by specialization
export const getDoctorsBySpecialization = async (req: Request, res: Response) => {
  try {
    const { specialization } = req.params;
    const collection = db.getCollection("doctors");

    const pipeline = [
      { $match: { specialization: { $regex: specialization, $options: "i" } } },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userData",
        },
      },
      { $unwind: { path: "$userData", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          userId: 1,
          specialization: 1,
          experience: 1,
          education: 1,
          availability: 1,
          rating: 1,
          consultationFee: 1,
          createdAt: 1,
          updatedAt: 1,
          name: "$userData.name",
          email: "$userData.email",
          address: "$userData.address",
          phone: "$userData.phone",
          profilePicture: "$userData.profilePicture",
          role: "$userData.role",
        },
      },
    ];

    const doctors = await collection.aggregate(pipeline).toArray();

    const formattedDoctors = doctors.map((doc: any) => ({
      _id: doc._id,
      name: doc.name || "Doctor",
      email: doc.email || "",
      role: doc.role || "doctor",
      address: doc.address || "",
      phone: doc.phone || "",
      profilePicture: doc.profilePicture || "",
      roleData: {
        specialization: doc.specialization || "General Medicine",
        experience: doc.experience || 0,
        education: doc.education || ["MBBS"],
        availability: doc.availability || [],
        rating: doc.rating || 0,
        consultationFee: doc.consultationFee || 0,
      },
    }));

    res.status(200).json({
      success: true,
      count: formattedDoctors.length,
      data: formattedDoctors,
    });
  } catch (error: any) {
    console.error("❌ Error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to get doctors",
    });
  }
};

// ✅ Search doctors
export const searchDoctors = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    const collection = db.getCollection("doctors");

    let matchFilter: any = {};
    if (q) {
      matchFilter.$or = [
        { name: { $regex: q, $options: "i" } },
        { specialization: { $regex: q, $options: "i" } }
      ];
    }

    const pipeline = [
      { $match: matchFilter },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userData",
        },
      },
      { $unwind: { path: "$userData", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          userId: 1,
          specialization: 1,
          experience: 1,
          education: 1,
          availability: 1,
          rating: 1,
          consultationFee: 1,
          createdAt: 1,
          updatedAt: 1,
          name: "$userData.name",
          email: "$userData.email",
          address: "$userData.address",
          phone: "$userData.phone",
          profilePicture: "$userData.profilePicture",
          role: "$userData.role",
        },
      },
    ];

    const doctors = await collection.aggregate(pipeline).toArray();

    const formattedDoctors = doctors.map((doc: any) => ({
      _id: doc._id,
      name: doc.name || "Doctor",
      email: doc.email || "",
      role: doc.role || "doctor",
      address: doc.address || "",
      phone: doc.phone || "",
      profilePicture: doc.profilePicture || "",
      roleData: {
        specialization: doc.specialization || "General Medicine",
        experience: doc.experience || 0,
        education: doc.education || ["MBBS"],
        availability: doc.availability || [],
        rating: doc.rating || 0,
        consultationFee: doc.consultationFee || 0,
      },
    }));

    res.status(200).json({
      success: true,
      count: formattedDoctors.length,
      data: formattedDoctors,
    });
  } catch (error: any) {
    console.error("❌ Error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to search doctors",
    });
  }
};


export const updateDoctor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      phone,
      address,
      profilePicture,
      ...doctorFields 
    } = req.body;

    const collection = db.getCollection("doctors");

  
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { ...doctorFields, updatedAt: new Date() } },
      { returnDocument: "after" },
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }


    const usersCollection = db.getCollection("users");

    const userUpdate: Record<string, any> = {};
    if (name !== undefined) userUpdate.name = name;
    if (phone !== undefined) userUpdate.phone = phone;
    if (address !== undefined) userUpdate.address = address;
    if (profilePicture !== undefined) userUpdate.profilePicture = profilePicture;

    if (Object.keys(userUpdate).length > 0) {
      await usersCollection.updateOne(
        { _id: result.userId },
        { $set: { ...userUpdate, updatedAt: new Date() } },
      );
    }

    const user = await usersCollection.findOne({ _id: result.userId });

    const formattedDoctor = {
      _id: result._id,
      name: user?.name || "Doctor",
      email: user?.email || "",
      role: "doctor",
      address: user?.address || "",
      phone: user?.phone || "",
      profilePicture: user?.profilePicture || "",
      roleData: {
        specialization: result.specialization || "General Medicine",
        experience: result.experience || 0,
        education: result.education || ["MBBS"],
        availability: result.availability || [],
        rating: result.rating || 0,
        consultationFee: result.consultationFee || 0,
      },
    };

    res.status(200).json({
      success: true,
      data: formattedDoctor,
    });
  } catch (error: any) {
    console.error("❌ Error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to update doctor",
    });
  }
};