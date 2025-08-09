import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";



const userSchema = new mongoose.Schema({
    firstName:{
        type: String,
        required: true,
        minLength: [3, "First Name Must Contain At Least 3 Characters!"]
    },
    lastName:{
        type:String,
        required: true,
        minLength: [3, "Last Name Must Contain At Least 3 Characters!"]
    },
    email:{
        type:String,
        required: true,
        validate: [validator.isEmail, "Please Provide a Valid Email!"]
    },
    phone:{
        type:String,
        required: true,
        minLength: [10, "Phone Number Must Contain Exact 11 Digits!"],
        maxLength: [10, "Phone Number Must Contain Exact 11 Digits!"]
    },

    // nic:{
    //     type:String,
    //     required: true,
    //     minLength: [12, "NIC Must Contain Exact 12 Digits!"],
    //     maxLength: [12, "NIC Must Contain Exact 12 Digits!"]
    // },
    dob:{
        type:String,
        required: [true, "DOB is required!"],
    },
    gender:{
        type: String,
        required: true,
        enum:["Male", "Female"],
    },
    password:{
        type:String,
        minLength: [8, "Password Must Contain At Least 8 Characters"],
        required: true,
        select: false
    },
    role:{
        type: String,
        required: true,
        enum: ["Admin","Patient","Doctor"],
    },
    doctorDepartment:{
        type: String
    },
    docAvatar:{
        public_id: String,
        url: String,
    }

});


//user registered karen tevha tyacha password navin asel mg ha tyal hash karel 
//password hash form madhe save hoil for security purpose
userSchema.pre("save", async function (next){
    if(!this.isModified("password")){
        next();
    }
    this.password = await bcrypt.hash(this.password, 10);
});

//hash password aani use cha origin passowrd match karnyasthi he function ahe
userSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}

//user login karel tevha token generate hoila pahije tyasathi
userSchema.methods.generateJsonWebToken = function () {
    return jwt.sign({ id:this._id }, process.env.JWT_SECRET_KEY,{
        expiresIn: process.env.JWT_EXPIRES,
    } );
};

export const User = mongoose.model("User", userSchema);