import IBus from "./IBus"

class Bus implements IBus {
	private readonly _map: Map<string, any[]>

	private getMap():Map<string, any[]> {
		return this._map
	}

	private init(key: string):void {
		const m = this.getMap()
		if (m.has(key)) {
			return undefined
		}
		m.set(key, [])
	}

	constructor() {
		this._map = new Map()
	}

	push(key: string, promise: Promise<any>): void {
		this.init(key)
		const m = this.getMap()
		m?.get(key)?.push(promise)
	}

	clear(key: string): void {
		const arr = this.getMap().get(key)
		if (arr) {
			arr.length = 0
		}
	}

	get(key: string): any {
		this.init(key)
		return this.getMap().get(key)
	}
}

export default Bus
