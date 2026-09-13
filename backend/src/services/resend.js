const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

// On Resend's free/test domain (onboarding@resend.dev) you can only send to
// the email tied to your own Resend account. Verifying a real domain in
// Resend's dashboard is the only change needed once you have one.
const FROM = process.env.EMAIL_FROM || 'Ekikrit <onboarding@resend.dev>';

async function sendPasswordResetCodeEmail(to, code) {
    await resend.emails.send({
        from: FROM,
        to,
        subject: `${code} is your Ekikrit password reset code`,
        html: `<p>Your password reset code is:</p><h2 style="letter-spacing:4px">${code}</h2><p>This code expires in 15 minutes. If you didn't request this, ignore this email.</p>`,
    });
}

async function sendVerificationEmail(to, code) {
    await resend.emails.send({
        from: FROM,
        to,
        subject: `${code} is your Ekikrit verification code`,
        html: `<p>Your verification code is:</p><h2 style="letter-spacing:4px">${code}</h2><p>This code expires in 15 minutes.</p>`,
    });
}

module.exports = { sendVerificationEmail, sendPasswordResetCodeEmail };