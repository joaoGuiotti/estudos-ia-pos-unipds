import { events } from "./constants.js";

type EventCallback<T = any> = (detail: T) => void;

export default class Events {
    static onTrainingComplete(callback: EventCallback) {
        document.addEventListener(events.trainingComplete, (event: CustomEvent) => {
            return callback(event.detail);
        });
    }

    static dispatchTrainingComplete(data: any) {
        const event = new CustomEvent(events.trainingComplete, {
            detail: data
        });
        document.dispatchEvent(event);
    }

    static onRecommend(callback: EventCallback) {
        document.addEventListener(events.recommend, (event: CustomEvent) => {
            return callback(event.detail);
        });
    }

    static dispatchRecommend(data: any) {
        const event = new CustomEvent(events.recommend, {
            detail: data
        });
        document.dispatchEvent(event);
    }

    static onRecommendationsReady(callback: EventCallback) {
        document.addEventListener(events.recommendationsReady, (event: CustomEvent) => {
            return callback(event.detail);
        });
    }

    static dispatchRecommendationsReady(data: any) {
        const event = new CustomEvent(events.recommendationsReady, {
            detail: data
        });
        document.dispatchEvent(event);
    }

    static onTrainModel(callback: EventCallback) {
        document.addEventListener(events.modelTrain, (event: CustomEvent) => {
            return callback(event.detail);
        });
    }

    static dispatchTrainModel(data: any) {
        const event = new CustomEvent(events.modelTrain, {
            detail: data
        });
        document.dispatchEvent(event);
    }

    static onTFVisLogs(callback: EventCallback) {
        document.addEventListener(events.tfvisLogs, (event: CustomEvent) => {
            return callback(event.detail);
        });
    }

    static dispatchTFVisLogs(data: any) {
        const event = new CustomEvent(events.tfvisLogs, {
            detail: data
        });
        document.dispatchEvent(event);
    }

    static onTFVisorData(callback: EventCallback) {
        document.addEventListener(events.tfvisData, (event: CustomEvent) => {
            return callback(event.detail);
        });
    }

    static dispatchTFVisorData(data: any) {
        const event = new CustomEvent(events.tfvisData, {
            detail: data
        });
        document.dispatchEvent(event);
    }

    static onProgressUpdate(callback: EventCallback) {
        document.addEventListener(events.modelProgressUpdate, (event: CustomEvent) => {
            return callback(event.detail);
        });
    }

    static dispatchProgressUpdate(progressData: any) {
        const event = new CustomEvent(events.modelProgressUpdate, {
            detail: progressData
        });
        document.dispatchEvent(event);
    }

    static onUserSelected(callback: EventCallback) {
        document.addEventListener(events.userSelected, (event: CustomEvent) => {
            return callback(event.detail);
        });
    }

    static dispatchUserSelected(data: any) {
        const event = new CustomEvent(events.userSelected, {
            detail: data
        });
        document.dispatchEvent(event);
    }

    static onUsersUpdated(callback: EventCallback) {
        document.addEventListener(events.usersUpdated, (event: CustomEvent) => {
            return callback(event.detail);
        });
    }

    static dispatchUsersUpdated(data: any) {
        const event = new CustomEvent(events.usersUpdated, {
            detail: data
        });
        document.dispatchEvent(event);
    }

    static onPurchaseAdded(callback: EventCallback) {
        document.addEventListener(events.purchaseAdded, (event: CustomEvent) => {
            return callback(event.detail);
        });
    }

    static dispatchPurchaseAdded(data: any) {
        const event = new CustomEvent(events.purchaseAdded, {
            detail: data
        });
        document.dispatchEvent(event);
    }

    static onPurchaseRemoved(callback: EventCallback) {
        document.addEventListener(events.purchaseRemoved, (event: CustomEvent) => {
            return callback(event.detail);
        });
    }

    static dispatchEventPurchaseRemoved(data: any) {
        const event = new CustomEvent(events.purchaseRemoved, {
            detail: data
        });
        document.dispatchEvent(event);
    }
}
