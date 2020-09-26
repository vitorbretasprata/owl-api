import { Expo } from "expo-server-sdk";

export default class Notifications {
    public async sendPushNotifications(targetExpoPushToken : string , message : string) {

        const expo = new Expo();

        const chunks = expo.chunkPushNotifications([
            {
                to: targetExpoPushToken,
                sound: "default",
                body: message
            }
        ]);

        await this.sendChunks(chunks, expo);
    }

    private async sendChunks(chunks: Array<Object>, expo : any) {
        const tickets : Array<any> = [];
        const receiptIds : Array<any> = [];

        chunks.forEach(async chunk => {
            try {
                let ticketChunk = await expo.sendPushNotificationsAsync(chunk);

                tickets.push(...ticketChunk);

            } catch(error) {
                console.log(error);
            }
        });

        tickets.forEach(ticket => {
            if (ticket.id) {
                receiptIds.push(ticket.id);
            }
        });

        let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);

        await this.retrieveBatches(receiptIdChunks, expo);

    }

    private async retrieveBatches(receiptIdChunks : Array<any>, expo : any) {
        receiptIdChunks.forEach(async chunk => {
            try {
                let receipts = await expo.getPushNotificationReceiptsAsync(chunk);

                receipts.forEach(receiptId => {
                    let { status, message, details } = receipts[receiptId];

                    if (status === 'error') {
                        console.error(
                          `There was an error sending a notification: ${message}`
                        );
                        if (details && details.error) {
                          console.error(`The error code is ${details.error}`);
                        }
                    }
                });
            } catch (error) {
                console.log(error);
            }
        })

    }
}