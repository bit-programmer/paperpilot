import nodemailer from 'nodemailer';
import env from './env';
import { logger } from '@/app/lib/logger';

const transporter = nodemailer.createTransport({
    host: env.MAIL_HOST,
    port: env.MAIL_PORT,
    secure: true,
    auth: {
        user: env.MAIL_USERNAME,
        pass: env.MAIL_PASSWORD,
    },
});

interface MailOptions {
    from: string;
    to: string;
    subject: string;
    html: string;
}

export async function sendMail(options: MailOptions): Promise<boolean> {
    try {
        await transporter.sendMail(options);
        return true;
    } catch (error) {
        logger.error(
            { error: error instanceof Error ? error.message : error },
            'Failed to send email'
        );
        return false;
    }
}