import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import db from "@/app/core/db";
import { sendMail } from "@/app/utils/mailer";
import env from "@/app/utils/env.server";
import { render } from "react-email";
import VerifyEmail from "@/app/mail-templates/verification-mail";
import React from "react";
import { logger } from "./logger.server";
import { organization } from "better-auth/plugins"

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
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({ user, url }) => {
            logger.info(`Sending the mail to ${user.email}`);
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
    },
    plugins: [
        organization()
    ]
});