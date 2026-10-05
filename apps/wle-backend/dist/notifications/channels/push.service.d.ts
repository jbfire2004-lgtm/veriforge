export declare class PushService {
    send(payload: {
        deviceToken: string;
        title: string;
        body: string;
    }): Promise<boolean>;
}
