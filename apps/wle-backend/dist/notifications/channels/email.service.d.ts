export declare class EmailService {
    send(payload: {
        to: string;
        subject: string;
        body: string;
    }): Promise<boolean>;
}
