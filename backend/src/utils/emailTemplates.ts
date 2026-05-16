export const getOtpTemplate = (name: string, otp: string): string => {
    return `
        <div style="font-family: Arial; border: 1px solid #ddd; padding: 20px;">
            <h2 style="color: #2c3e50;">Hello ${name},</h2>
            <p>Your BidVerse verification code is:</p>
            <div style="font-size: 32px; font-weight: bold; color: #e74c3c;">${otp}</div>
        </div>
    `;
}


export const getAccountBlockedTemplate=(
    name:string,
    email:string,
    reason:string
):string=>{
return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Status Update</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 40px auto; background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; border-collapse: collapse; shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);">
            
            <tr>
                <td height="4" style="background-color: #0F172A;"></td>
            </tr>

            <tr>
                <td style="padding: 40px 32px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                            <td style="font-size: 20px; font-weight: 800; color: #0F172A; tracking-tight: -0.05em; padding-bottom: 24px;">
                                BIDVERSE
                            </td>
                        </tr>
                    </table>

                    <p style="margin: 0 0 12px 0; font-size: 13px; font-weight: 700; color: #D97706; text-transform: uppercase; letter-spacing: 0.05em;">
                        Notice of Account Restriction
                    </p>
                    <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #0F172A; line-height: 1.3;">
                        Hello ${name},
                    </h2>
                    <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #475569;">
                        We are writing to inform you that your BidVerse account linked to <strong style="color: #0F172A;">${email}</strong> has been temporarily suspended due to a compliance or safety review flag.
                    </p>

                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; margin-bottom: 24px;">
                        <tr>
                            <td style="padding: 20px;">
                                <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em;">
                                    Reason for Enforcement Action
                                </p>
                                <p style="margin: 0; font-size: 14px; line-height: 1.5; font-weight: 500; color: #1E293B;">
                                    ${reason}
                                </p>
                            </td>
                        </tr>
                    </table>

                    <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 700; color: #0F172A;">
                        What this means for your account:
                    </h3>
                    <ul style="margin: 0 0 24px 0; padding-left: 20px; font-size: 14px; line-height: 1.6; color: #475569;">
                        <li style="margin-bottom: 4px;">Active marketplace bidding/listing privileges are suspended.</li>
                        <li style="margin-bottom: 4px;">You will be unable to modify account information or start new trades.</li>
                    </ul>

                    <p style="margin: 0 0 32px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                        If you believe this enforcement was made in error or if you wish to appeal this decision by providing additional context, please contact our administrative team directly.
                    </p>

                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                            <td align="left">
                                <a href="mailto:support@bidverse.com?subject=Appeal%20Account%20Restriction%20-%20${encodeURIComponent(email)}" style="display: inline-block; background-color: #0F172A; color: #FFFFFF; font-size: 13px; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 6px; box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05);">
                                    Contact Support Operations
                                </a>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>

            <tr>
                <td style="padding: 24px 32px; background-color: #F8FAFC; border-top: 1px solid #E2E8F0; font-size: 12px; line-height: 1.5; color: #64748B; text-align: left;">
                    <p style="margin: 0 0 4px 0; font-weight: 600; color: #475569;">
                        BidVerse Security & Compliance Operations
                    </p>
                    <p style="margin: 0;">
                        This is an automated system notification regarding transactional updates. Please do not reply directly to this mail string.
                    </p>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;


}


export const getAccountUnblockedTemplate = (
    name: string, 
    email: string
): string => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Access Restored</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 40px auto; background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; border-collapse: collapse; shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);">
            
            <tr>
                <td height="4" style="background-color: #0F172A;"></td>
            </tr>

            <tr>
                <td style="padding: 40px 32px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                            <td style="font-size: 20px; font-weight: 800; color: #0F172A; tracking-tight: -0.05em; padding-bottom: 24px;">
                                BIDVERSE
                            </td>
                        </tr>
                    </table>

                    <p style="margin: 0 0 12px 0; font-size: 13px; font-weight: 700; color: #10B981; text-transform: uppercase; letter-spacing: 0.05em;">
                        Access Re-established
                    </p>
                    <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #0F172A; line-height: 1.3;">
                        Welcome back, ${name}
                    </h2>
                    <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #475569;">
                        We are pleased to inform you that the review on your BidVerse account (<strong style="color: #0F172A;">${email}</strong>) is complete. Full access to your profile and marketplace privileges has been successfully restored.
                    </p>

                    <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                        You may now log back in using your registered credentials to place bids, manage listings, and proceed with your marketplace operations as usual.
                    </p>

                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 32px;">
                        <tr>
                            <td align="left">
                                <a href="https://bidverse.com/login" style="display: inline-block; background-color: #0F172A; color: #FFFFFF; font-size: 13px; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 6px; box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05);">
                                    Log In to Your Account
                                </a>
                            </td>
                        </tr>
                    </table>

                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px;">
                        <tr>
                            <td style="padding: 16px 20px; font-size: 13px; line-height: 1.5; color: #64748B;">
                                <strong style="color: #1E293B; display: block; margin-bottom: 2px;">Need help?</strong>
                                If you experience any technical difficulties or cache sync delays while attempting to access your dashboard, feel free to drop a message to our systems desk.
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>

            <tr>
                <td style="padding: 24px 32px; background-color: #F8FAFC; border-top: 1px solid #E2E8F0; font-size: 12px; line-height: 1.5; color: #64748B;">
                    <p style="margin: 0 0 4px 0; font-weight: 600; color: #475569;">
                        BidVerse Security & Support Operations
                    </p>
                    <p style="margin: 0;">
                        This is an operational transaction status message. Thank you for your patience during our systematic verification check.
                    </p>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;
}