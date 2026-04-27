export const getOtpTemplate = (name: string, otp: string): string => {
    return `
        <div style="font-family: Arial; border: 1px solid #ddd; padding: 20px;">
            <h2 style="color: #2c3e50;">Hello ${name},</h2>
            <p>Your BidVerse verification code is:</p>
            <div style="font-size: 32px; font-weight: bold; color: #e74c3c;">${otp}</div>
        </div>
    `;
}