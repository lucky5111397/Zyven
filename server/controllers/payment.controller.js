import razorpay from "../utils/razorPay.js";
import Payment from "../models/payment.model.js";
import User from "../models/user.model.js";
import crypto from "crypto";

export const CreateOrder = async (req, res) => {
    try {
        const { amount, aiCredits } = req.body;

        if (!amount || !aiCredits) {
            return res.status(400).json({
                success: false,
                message: "Invalid plan data",
            });
        }

        const options = {
            amount: amount * 100,
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        const payment = await Payment.create({
            userId: req.userId,
            amount,
            aiCredits,
            razorpayOrderId: order.id,
            status: "created",
        });

        return res.status(201).json({
            success: true,
            message: "Order created successfully",
            order,
            payment,
        });
    } catch (error) {
        console.error("CreateOrder Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create order",
            error: error.message,
        });
    }
};

export const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = req.body;

        if (
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature
        ) {
            return res.status(400).json({
                success: false,
                message: "Payment details are missing",
            });
        }

        const body =
            razorpay_order_id + "|" + razorpay_payment_id;

        /*
         * WHY VERIFY HMAC SHA-256?
         * The frontend alone cannot be trusted to verify payment success. Malicious users 
         * could easily forge a successful payload to grant themselves AI credits. 
         * By regenerating the cryptographic HMAC SHA-256 signature locally using our secret 
         * RAZORPAY_KEY_SECRET, we mathematically guarantee that this webhook/callback actually 
         * originated from Razorpay and that the payment details were not tampered with.
         */
        const expectedSignature = crypto
            .createHmac(
                "sha256",
                process.env.RAZORPAY_KEY_SECRET
            )
            .update(body)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Payment verification failed",
            });
        }

        const payment = await Payment.findOne({
            razorpayOrderId: razorpay_order_id,
        });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Payment record not found",
            });
        }

        // Prevent adding credits twice
        if (payment.status === "paid") {
            return res.status(200).json({
                success: true,
                message: "Payment already verified",
                payment,
            });
        }

        payment.status = "paid";
        payment.razorpayPaymentId = razorpay_payment_id;

        await payment.save();

        const updatedUser = await User.findByIdAndUpdate(
            payment.userId,
            {
                $inc: {
                    aiCredits: payment.aiCredits,
                },
            },
            {
                new: true,
            }
        );

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Payment verified and credits added",
            user: updatedUser,
            payment,
        });
    } catch (error) {
        console.error("Verify Payment Error:", error);

        return res.status(500).json({
            success: false,
            message: "Payment verification failed",
            error: error.message,
        });
    }
};