export interface SmtpConfig {
    host: string;    // define how your application talk to email server
    port: number;    //its like setting up simcard and network settings on phone
    secure: boolean,// it make sure the phone can reach the cell tower
    auth: {          //secure and tls are encryption rules to make sure hackers cant read the email while it travelling
        user: string;
        pass: string,
    };
    tls: {
        rejectUnauthorized: boolean;
    }
}

export interface EmailConfig { //this defines what is sending and who is recieving it  its used every time you call email service methods
    // from:string;               //like an actual letter u put in to the mail box
    to: string;
    subject: string;
    html: string   // mail body   
}