const generater = require('url-generate')
const Listr = require('listr')
const bus = {}
let number = Number.MIN_SAFE_INTEGER

let getKey = (plan) => {
	number++
	let d = new Date()
	let key = `${plan.name}@${d.getMonth() + 1}/${d.getDate()}T${d.getHours()}-${d.getMinutes()}-${d.getSeconds()}#${number}`
	return key
}

let executeTask = function (plan) {
	// check plan, plan should be a class
	console.log(`[perloin][run]: plan "${plan.name}" begins!`)
	plan.context = plan.context || {}
	let key = getKey(plan)
	plan.key = key
	bus[key] = []
	let gen = generater.generate(plan.urlTemplate, plan.urlPhases)
	return new Promise((resolve, reject)=>{
		let hook = setInterval(() => {
			let next = gen.next()
			if (next.done) {
				Promise.all(bus[key]).then(() => {
					process.nextTick(() => {
						console.log(`[perloin][run]: plan "${plan.name}" complete!`)
						bus[key] = []
					})
					resolve(true) 
				}).catch(e => {
					console.error(`[perloin][promise]: error when executing "${plan.name}": \r\n${e}`)
					reject(e)
				})
				return clearInterval(hook)
			}
			let promise = plan.execute(next.value, plan.context)
			bus[key].push(promise)
			new Listr([{ title: next.value.url, task: () => promise }]).run().catch(err => {
				//console.error(`[perloin][listr]: error when executing "${plan.name}": \r\n${err}`)
			})
		}, 1000 * (plan.interval || 1.2))
	})
}

module.exports = {
	run: executeTask,
	type: generater.type
}
