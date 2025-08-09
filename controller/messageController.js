import {catchAsyncErrors} from '../middlewares/catchAsyncErrors.js' 
import { Message } from "../models/messageSchema.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";

export const sendMessage = async(req, res,next) => {
        const { firstName, lastName, email, phone, message } = req.body;

        if (!firstName || !lastName || !email || !phone || !message) {
        return next(new ErrorHandler("Please Fill Full Form!", 400));
    }

    //varcha sagla data asla trch he run karnar 
    //hyachysathi ek router create karaucha aahe tithe path define karaucha aahe
        await Message.create({ firstName, lastName, email, phone, message });
        res.status(200).json({
            success: true,
            message: "Message Send Successfully!",
        });
    }



export const getAllMessages = catchAsyncErrors(async(req,res,next)=>{
    const messages = await Message.find();
    res.status(200).json({
        success: true,
        messages,
    });
});