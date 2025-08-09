import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { Appointment } from "../models/appointmentSchema.js";
import { User } from "../models/userSchema.js";

export const postAppointment = catchAsyncErrors(async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    // nic,
    dob,
    gender,
    appointment_date,
    department,
    doctor_firstName,
    doctor_lastName,
    hasVisited = false,
    address,
  } = req.body;

  // Basic required fields validation
  if (
    !firstName?.trim() ||
    !lastName?.trim() ||
    !email?.trim() ||
    !phone?.trim() ||
    // !nic?.trim() ||
    !dob?.trim() ||
    !gender?.trim() ||
    !appointment_date?.trim() ||
    !department?.trim() ||
    !doctor_firstName?.trim() ||
    !doctor_lastName?.trim() ||
    !address?.trim()
  ) {
    return next(new ErrorHandler("Please fill in all required fields.", 400));
  }

  // Find the doctor by first name, last name, role and department
  const doctors = await User.find({
    firstName: doctor_firstName,
    lastName: doctor_lastName,
    role: "Doctor",
    doctorDepartment: department,
  });

  if (doctors.length === 0) {
    return next(new ErrorHandler("Doctor not found.", 404));
  }

  if (doctors.length > 1) {
    return next(
      new ErrorHandler(
        "Multiple doctors found with the same name in this department. Please contact support.",
        409
      )
    );
  }

  const doctor = doctors[0];
  const patientId = req.user._id;

  // Create the appointment
  const appointment = await Appointment.create({
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: email.trim(),
    phone: phone.trim(),
    // nic: nic.trim(),
    dob: dob.trim(),
    gender: gender.trim(),
    appointment_date: appointment_date.trim(),
    department: department.trim(),
    doctor: {
      firstName: doctor_firstName.trim(),
      lastName: doctor_lastName.trim(),
    },
    hasVisited,
    address: address.trim(),
    doctorId: doctor._id,
    patientId,
  });

  res.status(201).json({
    success: true,
    message: "Appointment created successfully.",
    appointment,
  });
});

export const getAllAppointments = catchAsyncErrors(async (req, res, next) => {
  const appointments = await Appointment.find();
  res.status(200).json({
    success: true,
    appointments,
  });
});

export const updateAppointmentStatus = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const appointment = await Appointment.findById(id);
  if (!appointment) {
    return next(new ErrorHandler("Appointment not found.", 404));
  }

  const updatedAppointment = await Appointment.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: "Appointment status updated successfully.",
    appointment: updatedAppointment,
  });
});

export const deleteAppointment = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const appointment = await Appointment.findById(id);
  if (!appointment) {
    return next(new ErrorHandler("Appointment not found.", 404));
  }

  await appointment.deleteOne();

  res.status(200).json({
    success: true,
    message: "Appointment deleted successfully.",
  });
});
