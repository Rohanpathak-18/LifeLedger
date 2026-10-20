import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import ContactMessage from '../../models/ContactMessage.js';

export async function create(input) {
  const message = await ContactMessage.create({
    name: input.name,
    email: input.email.toLowerCase(),
    subject: input.subject,
    message: input.message,
  });

  if (env.RESEND_API_KEY && env.EMAIL_FROM && env.CONTACT_EMAIL) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: env.EMAIL_FROM,
          to: [env.CONTACT_EMAIL],
          reply_to: input.email,
          subject: `LifeLedger contact: ${input.subject}`,
          text: `From: ${input.name} <${input.email}>\n\n${input.message}`,
        }),
        signal: AbortSignal.timeout(12_000),
      });
      if (!response.ok)
        throw new Error(`Email provider returned HTTP ${response.status}`);
      const emailedAt = new Date();
      await ContactMessage.updateOne(
        { _id: message._id },
        { $set: { emailedAt } },
      );
      message.emailedAt = emailedAt;
    } catch (error) {
      logger.warn(
        { err: error, messageId: message._id },
        'Contact notification email failed',
      );
    }
  }

  return message;
}
