import Subscription from "../models/subscription.model.js";
import { WorkflowClient } from "../config/upstash.js";

export const createSubscription = async (req, res, next) => {
  try {
    console.log("📝 Creating subscription with data:", req.body);
    const subscription = await Subscription.create({
      ...req.body,
      user: req.user._id,
    });
    console.log("✅ Subscription created:", subscription._id);
    
    // Trigger the reminder workflow
    try {
      console.log("🚀 Triggering workflow for subscription:", subscription._id.toString());
      const result = await WorkflowClient.trigger({
        url: "reminders",
        body: {
          subscriptionId: subscription._id.toString(),
        },
      });
      console.log("✅ Workflow triggered successfully:", result);
    } catch (workflowError) {
      console.error("❌ Failed to trigger workflow:", workflowError.message);
      console.error("Error details:", workflowError);
      // Don't fail the subscription creation if workflow trigger fails
    }
    
    res.status(201).json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    console.error("❌ Error creating subscription:", error.message);
    next(error);
  }
};

export const getUserSubscriptions = async (req, res, next) => {
  try {
    if (req.user._id.toString() !== req.params.id) {
      const error = new Error("Unauthorized");
      error.statusCode = 401;
      throw error;
    }
    const subscriptions = await Subscription.find({ user: req.params.id });
    res.status(200).json({
      success: true,
      data: subscriptions,
    });
  } catch (error) {
    next(error);
  }
};
