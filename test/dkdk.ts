

let plan = {
    name: `test`,
    urlTemplate: `http://${provCode}.haoma.com/xh/?lanmu={tsp}`,
    urlPhases: {
        tsp: {
            type: perloin.type.iterating,
            set: tsp.map(item => item.value)
        },
    },
    interval: 3,
    execute: hand,
    context: { provCode }
}



let hand = function (task, context) {	// 这个函数必须返回promise，不管异步还是同步
    return samael.fetch(task.url).then(text => {
        const $ = cheerio.load(text)
        let temp = $("body > div.wrap > div.r > div.attribute-box div.sl-value div.sl-v-tab div.trig-item")
        temp = temp.filter((index, item) => {
            item = $(item)
            return item.text().includes("默认套餐") || item.text().includes("资费套餐")
        })
        let wrapper = temp.find("div.sl-value.valueList>ul")
        let str = ""
        wrapper.children().each((index, item) => {
            item = $(item)
            // if (item.hasClass("curr")) {
            // 	return true
            // }
            if (item.data("father") != task.phase.tsp) {
                return true
            }
            str += `\t{ value: ${item.data("val")},\t`
            str += `name: "${item.text()}" },\r\n`
        })
        let isSpecial = areas[context.provCode].isSpecial
        let result = `"${context.provCode}${isSpecial ? "" : ("." + context.city.value)}.${task.phase.tsp}": [\r\n${str}\r\n],\r\n`
        samael.appendToFile(path.resolve(__dirname, "../bin/data/pkgs.js"), result)
    }).catch(() => {
        let isSpecial = areas[context.provCode].isSpecial
        let result = `"${context.provCode}${isSpecial ? "" : ("." + context.city.value)}.${task.phase.tsp}": [\r\n\r\n],\r\n`
        samael.appendToFile(path.resolve(__dirname, "../bin/data/pkgs.js"), result)
        //throw e
    })
}
