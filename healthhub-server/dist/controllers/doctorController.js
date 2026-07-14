"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDoctor = exports.updateDoctor = exports.searchDoctors = exports.getDoctorsBySpecialization = exports.getDoctorByUserId = exports.getDoctor = exports.getDoctors = void 0;
const database_1 = require("../config/database");
const mongodb_1 = require("mongodb");
// Helper function for safe ObjectId conversion
const toObjectId = (id) => {
    if (id instanceof mongodb_1.ObjectId)
        return id;
    if (typeof id === 'string')
        return new mongodb_1.ObjectId(id);
    throw new Error('Invalid ID format');
};
// ✅ Get all doctors
const getDoctors = async (req, res) => {
    try {
        console.log("📋 Fetching all doctors with user data...");
        const collection = database_1.db.getCollection("doctors");
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
        const formattedDoctors = doctors.map((doc) => ({
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
    }
    catch (error) {
        console.error("❌ Error:", error);
        res.status(400).json({
            success: false,
            message: error.message || "Failed to get doctors",
        });
    }
};
exports.getDoctors = getDoctors;
// ✅ Get single doctor by ID
const getDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        const collection = database_1.db.getCollection("doctors");
        const pipeline = [
            { $match: { _id: toObjectId(id) } },
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
            res.status(404).json({
                success: false,
                message: "Doctor not found",
            });
            return;
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
    }
    catch (error) {
        console.error("❌ Error:", error);
        res.status(400).json({
            success: false,
            message: error.message || "Failed to get doctor",
        });
    }
};
exports.getDoctor = getDoctor;
// ✅ Get doctor by userId (for doctor settings)
const getDoctorByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const collection = database_1.db.getCollection("doctors");
        const pipeline = [
            { $match: { userId: toObjectId(userId) } },
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
            res.status(404).json({
                success: false,
                message: "Doctor not found for this user",
            });
            return;
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
    }
    catch (error) {
        console.error("❌ Error:", error);
        res.status(400).json({
            success: false,
            message: error.message || "Failed to get doctor by userId",
        });
    }
};
exports.getDoctorByUserId = getDoctorByUserId;
// ✅ Get doctors by specialization
const getDoctorsBySpecialization = async (req, res) => {
    try {
        const { specialization } = req.params;
        const collection = database_1.db.getCollection("doctors");
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
        const formattedDoctors = doctors.map((doc) => ({
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
    }
    catch (error) {
        console.error("❌ Error:", error);
        res.status(400).json({
            success: false,
            message: error.message || "Failed to get doctors",
        });
    }
};
exports.getDoctorsBySpecialization = getDoctorsBySpecialization;
// ✅ Search doctors
const searchDoctors = async (req, res) => {
    try {
        const { q } = req.query;
        const collection = database_1.db.getCollection("doctors");
        let matchFilter = {};
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
        const formattedDoctors = doctors.map((doc) => ({
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
    }
    catch (error) {
        console.error("❌ Error:", error);
        res.status(400).json({
            success: false,
            message: error.message || "Failed to search doctors",
        });
    }
};
exports.searchDoctors = searchDoctors;
// ✅ Update doctor
const updateDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone, address, profilePicture, ...doctorFields } = req.body;
        const collection = database_1.db.getCollection("doctors");
        // Update doctor collection
        const result = await collection.findOneAndUpdate({ _id: toObjectId(id) }, { $set: { ...doctorFields, updatedAt: new Date() } }, { returnDocument: "after" });
        if (!result) {
            res.status(404).json({
                success: false,
                message: "Doctor not found",
            });
            return;
        }
        // Update user collection
        const usersCollection = database_1.db.getCollection("users");
        const userUpdate = {};
        if (name !== undefined)
            userUpdate.name = name;
        if (phone !== undefined)
            userUpdate.phone = phone;
        if (address !== undefined)
            userUpdate.address = address;
        if (profilePicture !== undefined)
            userUpdate.profilePicture = profilePicture;
        if (Object.keys(userUpdate).length > 0) {
            await usersCollection.updateOne({ _id: result.userId }, { $set: { ...userUpdate, updatedAt: new Date() } });
        }
        // Get updated user
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
    }
    catch (error) {
        console.error("❌ Error:", error);
        res.status(400).json({
            success: false,
            message: error.message || "Failed to update doctor",
        });
    }
};
exports.updateDoctor = updateDoctor;
// ✅ Delete doctor (for admin)
const deleteDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        const collection = database_1.db.getCollection("doctors");
        // Get doctor to find userId
        const doctor = await collection.findOne({ _id: toObjectId(id) });
        if (!doctor) {
            res.status(404).json({
                success: false,
                message: "Doctor not found",
            });
            return;
        }
        // Delete from doctors collection
        const result = await collection.deleteOne({ _id: toObjectId(id) });
        if (result.deletedCount === 0) {
            res.status(404).json({
                success: false,
                message: "Doctor not found",
            });
            return;
        }
        // Delete from users collection
        if (doctor.userId) {
            const usersCollection = database_1.db.getCollection("users");
            await usersCollection.deleteOne({ _id: doctor.userId });
        }
        console.log(`✅ Doctor deleted: ${doctor.name}`);
        res.status(200).json({
            success: true,
            message: "Doctor deleted successfully",
        });
    }
    catch (error) {
        console.error("❌ Error deleting doctor:", error);
        res.status(400).json({
            success: false,
            message: error.message || "Failed to delete doctor",
        });
    }
};
exports.deleteDoctor = deleteDoctor;
