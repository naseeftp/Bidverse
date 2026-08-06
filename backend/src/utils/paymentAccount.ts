import crypto from "crypto";

export const generatePaymentAccountId = (): string => {
    return `acc_test_${crypto.randomBytes(8).toString("hex")}`;
};