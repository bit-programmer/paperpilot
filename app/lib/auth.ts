import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import db from "@/app/db";
import { sendMail } from "@/app/utils/mailer";
import env from "@/app/utils/env";
import { render } from "react-email";
import VerifyEmail from "@/app/mail-templates/verification-mail";
import React from "react";
import { logger } from "./logger";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg"
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
    },
    emailVerification: {
        sendOnSignUp: true,
        sendVerificationEmail: async ({ user, url, token }, request) => {
            logger.info(`Sending the mail to ${user.email}`)
            await sendMail({
                from: env.MAIL_ID,
                to: user.email,
                subject: 'Verify your email address',
                html: await render(React.createElement(VerifyEmail, {
                    companyName: env.APP_NAME,
                    url,
                    userName: user.name,
                })),
            });
        }
    }
});