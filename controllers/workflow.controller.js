import dayjs from "dayjs";
import { createRequire } from "module";
import Subscription from "../models/subscription.model.js";
const require = createRequire(import.meta.url);
const { serve } = require("@upstash/workflow/express");

const REMINDERS = [7, 5, 2, 1];

export const sendReminders = serve(async (context) => {
  console.log("🔄 Workflow started with payload:", context.payload);
  const { subscriptionId } = context.payload;
  const subscription = await fetchSubscription(context, subscriptionId);
  console.log("📦 Fetched subscription:", subscription);

  if (!subscription || subscription.status !== "active") {
    return;
  }

  const renewalDate = dayjs(subscription.renewalDate);
  if (renewalDate.isBefore(dayjs())) {
    console.log(`Subscription ${subscription._id} has already expired.`);
    return;
  }
  for (const daysBefore of REMINDERS) {
    const reminderDate = renewalDate.subtract(daysBefore, "day");
    if (reminderDate.isAfter(dayjs())) {
      await sleepUntilReminder(
        context,
        `reminder_${daysBefore}_days`,
        reminderDate,
      );
      await triggerReminder(context, `reminder_${daysBefore}_days`);
    }
  }
});

const fetchSubscription = async (context, subscriptionId) => {
  return await context.run("get subscription", () => {
    return Subscription.findById(subscriptionId).populate("user", "email name");
  });
};

const sleepUntilReminder = async (context, label, date) => {
  console.log(
    `Sleeping until ${label} reminder for subscription ${context.payload.subscriptionId}`,
  );
  await context.sleepUntil(label, date.toDate());
};

const triggerReminder = async (context, label) => {
  return await context.run(label, () => {
    console.log(
      `Triggering ${label} reminder for subscription ${context.payload.subscriptionId}`,
    );
  });
};
