const generater = require('url-generate')
const Listr = require('listr')
const kaze = require("kaze")

const bus = {}
let number = Number.MIN_SAFE_INTEGER

const getKey = (plan) => {
	number++
	const d = new Date()
	const key = `${plan.name}@${d.getMonth() + 1}/${d.getDate()}T${d.getHours()}-${d.getMinutes()}-${d.getSeconds()}#${number}`
	return key
}

const executeTask = function(plan) {
	// check plan, plan should be a class
	console.log(`[perloin][run]: plan "${plan.name}" begins!`)
	plan.context = plan.context || {}
	const key = getKey(plan)
	plan.key = key
	bus[key] = []
	const gen = generater.generate(plan.urlTemplate, plan.urlPhases)
	// return coolie.createSimplePlan({
	// 	initInterval: 1000 * (plan.interval || 1.2),
	// 	resourceGen: gen,
	// 	getPromise: ()=>{
	// 		return plan.execute(next.value, plan.context)
	// 	}
	// })


	kaze.repeat(() => {
		const next = gen.next()
		if (next.done) {
			Promise.all(bus[key]).then(() => {
				process.nextTick(() => {
					console.log(`[perloin][run]: plan "${plan.name}" complete!`)
					bus[key] = []
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
		new Listr([{title: next.value.url, task: () => promise}]).run()
			.catch(() => {
			// console.error(`[perloin][listr]: error when executing "${plan.name}": \r\n${err}`)
			})
		return promise
	}, 1000 * (plan.interval || 1.2))
}

module.exports = {
	run: executeTask,
	// type: generater.type
}
