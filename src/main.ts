/* eslint-disable promise/prefer-await-to-callbacks */
import Listr from 'listr'
import Bus from './model/Bus'
import Plan from "./model/Plan"

const generater = require("url-generate")
const {type} = generater

const bus = new Bus()
let number = Number.MIN_SAFE_INTEGER

const generateKey = (plan: Plan): string => {
	number++
	const d = new Date()
	const timeStr = `${d.getMonth() + 1}/${d.getDate()}T${d.getHours()}-${d.getMinutes()}-${d.getSeconds()}`
	return `${plan.name}@${timeStr}#${number}`
}

const executeTask = (plan: Plan): Promise<any>=> {
	// check plan, plan should be a class
	console.log(`[perloin][run]: plan "${plan.name}" begins!`)
	// plan.context = plan.context || {}
	// 兩句合為一句
	const key = generateKey(plan)
	plan.key = key
	// bus[key] = []
	const gen = generater.generate(plan.urlTemplate, plan.urlPhases)
	return new Promise((resolve, reject) => {
		const hook: ReturnType<typeof setTimeout> = setInterval(() => {
			const next = gen.next()
			if (next.done) {
				Promise.all(bus.get(key)).then(() => {
					process.nextTick(() => {
						console.log(`[perloin][run]: plan "${plan.name}" complete!`)
						bus.clear(key)
					})
					return resolve(true)
				})
					.catch((e) => {
						console.error(`[perloin][promise]: error when executing "${plan.name}": \r\n${e}`)
						reject(e)
					})
				return clearInterval(hook)
			}
			const promise = plan.execute(next.value, plan.context)
			bus.push(key, promise)
			new Listr([{title: next.value.url, task: () => promise}]).run()
				.catch((err) => {
					console.error(`[perloin][listr]: error when executing "${plan.name}": \r\n${err}`)
				})
		}, 1000 * (plan.interval || 1.2))
	})
}


export {executeTask as run}
export {type}
