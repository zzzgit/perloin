interface IBus {
    push(key: string, promise: Promise<any>):void
    clear(key: string):void
    get(key: string): any
}

export default IBus
