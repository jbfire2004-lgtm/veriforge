export declare class SmsService {
    send(payload: {
        to: string;
        message: string;
    }): Promise<boolean>;
}
