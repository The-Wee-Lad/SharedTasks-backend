export const todoDB = "SharedTasks";
import dotenv from "dotenv";
dotenv.config({
    path: "./.env",
    credentials: true,
});
export const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
};

export const welcomeEmail = `
< !DOCTYPE html>
    <html lang="en">
        <body style="background-color: #f5f7fa; margin: 0; padding: 0;">
            <div style="max-width: 600px; margin: 40px auto; background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); text-align: center; font-family: Arial, sans-serif;">

                <div style="font-size: 24px; font-weight: bold; color: #4F46E5; margin-bottom: 20px;">
                    Shared Tasks
                </div>

                <div style="font-size: 22px; color: #333333; margin-bottom: 10px;">
                    Thank You for Registering!
                </div>

                <div style="font-size: 16px; color: #555555; margin-bottom: 30px;">
                    We're excited to have you onboard. Start managing and sharing your tasks effortlessly with Shared Tasks!
                </div>

                <a href="https://httpstatusdogs.com/503-service-unavailable" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: #ffffff; text-decoration: none; border-radius: 5px; font-size: 16px;">
                    Get Started
                </a>

                <div style="margin-top: 30px; font-size: 12px; color: #999999;">
                    If you did not sign up for Shared Tasks, please ignore this email.
                </div>

            </div>
        </body>
    </html>

`

export const confirmationEmail = (confirmationLink) => 
`
    <html lang="en">
        <body style="background-color: #f5f7fa; margin: 0; padding: 0;">
            <div style="max-width: 600px; margin: 40px auto; background: #ffffff; padding: 40px 30px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); text-align: center; font-family: Arial, sans-serif;">

                <!-- Brand heading -->
                <div style="font-size: 36px; font-weight: 800; color: #4F46E5; margin-bottom: 30px; letter-spacing: -1px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                    Shared<span style="color: #000000;"> Tasks</span>
                </div>

                <!-- Email Confirmation Title -->
                <div style="font-size: 24px; color: #333333; margin-bottom: 15px; font-weight: 600;">
                    Confirm Your Email
                </div>

                <!-- Message -->
                <div style="font-size: 16px; color: #555555; margin-bottom: 30px;">
                    Please click the button below to verify your email address and start using Shared Tasks.
                </div>

                <!-- Button -->
                <a href=${confirmationLink} style="display: inline-block; padding: 14px 28px; background-color: #4F46E5; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 18px; font-weight: bold;">
                    Confirm Email
                </a>

                <!-- Fallback link (optional) -->
                <div style="margin-top: 30px; font-size: 14px; color: #777777;">
                    Or copy and paste this link into your browser:<br>
                        <a href=${confirmationLink} style="color: #4F46E5;">${confirmationLink}</a>
                </div>

                <!-- Footer -->
                <div style="margin-top: 30px; font-size: 12px; color: #999999;">
                    If you did not create an account with Shared Tasks, you can safely ignore this email.
                </div>

            </div>
        </body>
    </html>

`;