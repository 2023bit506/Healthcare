import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { User } from "../models/userSchema.js";
import { generateToken } from "../utils/jwtToken.js";
import cloudinary from "cloudinary";
// 🚀 Patient Registration
export const patientRegister = catchAsyncErrors(async (req, res, next) => {
    const {
        firstName,
        lastName,
        email,
        phone,
        password,
        gender,
        dob,
        // nic,
        role,
    } = req.body;

    // Check if all fields are filled
    if (
        !firstName ||
        !lastName ||
        !email ||
        !phone ||
        !password ||
        !gender ||
        !dob ||
        // !nic ||
        !role
    ) {
        return next(new ErrorHandler("Please fill the full form!", 400));
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
        return next(new ErrorHandler("User already registered!", 400));
    }

    // Create new user
    user = await User.create({
        firstName,
        lastName,
        email,
        phone,
        password,
        gender,
        dob,
        // nic,
        role,
    });

    // Generate JWT token and send response
    generateToken(user, "User registered successfully!", 200, res);

    // 🔵 NOTE: The line below is not needed since generateToken handles response
    // res.status(200).json({ success: true, message: "User Registered!" });
});


// 🚀 Login Controller
export const login = catchAsyncErrors(async (req, res, next) => {
    const { email, password, confirmPassword, role } = req.body;

    // Check if all fields are filled
    if (!email || !password || !confirmPassword || !role) {
        return next(new ErrorHandler("Please provide all details!", 400));
    }

    // Confirm password check
    if (password !== confirmPassword) {
        return next(
            new ErrorHandler("Password and Confirm Password do not match!", 400)
        );
    }

    // Find user with email
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        return next(new ErrorHandler("Invalid email or password!", 400));
    }

    // Match password
    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid email or password!", 400));
    }

    // Check if role matches
    if (role !== user.role) {
        return next(new ErrorHandler("User with this role not found!", 400));
    }

    // Generate token
    generateToken(user, "User logged in successfully!", 200, res);
});


// 🚀 Add New Admin
export const addNewAdmin = catchAsyncErrors(async (req, res, next) => {
    const {
        firstName,
        lastName,
        email,
        phone,
        password,
        gender,
        dob,
        // nic,
    } = req.body;

    // Validate all fields
    if (
        !firstName ||
        !lastName ||
        !email ||
        !phone ||
        !password ||
        !gender ||
        !dob 
        // !nic
    ) {
        return next(new ErrorHandler("Please fill the full form!", 400));
    }

    // Check if admin already exists
    const isRegistered = await User.findOne({ email });
    if (isRegistered) {
        return next(
            new ErrorHandler(
                `${isRegistered.role} with this email already exists!`,
                400
            )
        );
    }

    // Create new admin
    const admin = await User.create({
        firstName,
        lastName,
        email,
        phone,
        password,
        gender,
        dob,
        // nic,
        role: "Admin",
    });

    res.status(200).json({
        success: true,
        message: "New Admin registered successfully!",
    });
});



export const getAllDoctors = catchAsyncErrors(async (req, res, next) => {
    const doctors = await User.find({ role: "Doctor" });
    res.status(200).json({
        success: true,
        doctors,
    });
});


export const getUserDetails = catchAsyncErrors(async (req, res, next) => {
    const user = req.user;
    res.status(200).json({
        success: true,
        user,
    });
});


export const logoutAdmin = catchAsyncErrors(async(req, res, next)=>{
    res
    .status(200)
    .cookie("adminToken","", {
        httpOnly: true,
        expires: new Date(Date.now()),
        secure: true,
        sameSite: "None"
    })
    .json({
        success: true,
        message: "Admin Logged Out Successfully!"
    });
});


export const logoutPatient = catchAsyncErrors(async(req, res, next)=>{
    res
    .status(200)
    .cookie("patientToken","", {
        httpOnly: true,
        expires: new Date(Date.now()),
        secure: true,
        sameSite: "None"
    })
    .json({
        success: true,
        message: "Patient Logged Out Successfully!"
    });
});


export const addNewDoctor = catchAsyncErrors(async(req,res,next)=>{
    if(!req.files || Object.keys(req.files).length === 0){
        return next(new ErrorHandler("Doctor Avatar Required!", 400));
    }
    const {docAvatar} = req.files;
    const allowedFormats = ["/image/png", "image/jpeg","image/webp","image/jpg"];

    if (!allowedFormats.includes(docAvatar.mimetype)) {
        return next(new ErrorHandler("File Format Not Supported!", 400));
    }

    const {
        firstName,
        lastName,
        email,
        phone,
        password,
        gender,
        dob,
        // nic,
        doctorDepartment,
    } = req.body;
    if (
        !firstName ||
        !lastName ||
        !email ||
        !phone ||
        !password ||
        !gender ||
        !dob ||
        // !nic ||
        !doctorDepartment
    ) {
        return next(new ErrorHandler("Please Provide Full Details!", 400));
    }
    const isRegistered = await User.findOne({email});
    if (isRegistered) {
        return next(new ErrorHandler(`${isRegistered.role} already registered with this email`),
        400
    );
    }

    // const cloudinaryResponse = await cloudinary.UploadStream.upload(
    //     docAvatar.tempFilePath
    // );

    const cloudinaryResponse = await cloudinary.uploader.upload(
        docAvatar.tempFilePath
    ); 


    if (!cloudinaryResponse || cloudinaryResponse.error) {
        console.error("Cloudinary Error:", cloudinaryResponse.error || "Unknown Cloudinary Error");
    }
    const doctor = await User.create({
        firstName,
        lastName,
        email,
        phone,
        password,
        gender,
        dob,
        // nic,
        doctorDepartment,
        role: "Doctor",
        docAvatar:{
            public_id: cloudinaryResponse.public_id,
            url: cloudinaryResponse.secure_url,
        },
    });
    res.status(200).json({
        success: true,
        message: "New Doctor Registered!",
        doctor
    });


});


