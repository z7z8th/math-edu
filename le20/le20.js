
let low = 0, high = 20
let result_max = 20
let total_cnt = 100

function rand_int() {
	return parseInt(Math.random()*(high-low) + low)
}

$('#main').append('<div style="position: fixed; top: 0px; width: 170px; padding: 4px; color: white; background: teal; ">ok rate: <label id=ok_rate ><label></div>')
$('#main').append('<table style="margin-top: 30px; "/>')
let t = $('#main > table')

for (i=0; i<total_cnt; i++) {
	let td
	let expr
	let result
	do {
		td = $('<td>')
		let l1 = rand_int()
		let l2 = rand_int()
		if (i%2 == 0) {
			expr = `${l1} + ${l2} = `
			result = l1 + l2
			td.data('expr',   expr)
			td.data('result', result)
		} else {
			if (l1 < l2) {
				[l1, l2] = [l2, l1]
			}
			expr = `${l1} - ${l2} = `
			result = l1 - l2
			td.data('expr',   expr)
			td.data('result', result)
		}
	} while (result < 0 || result > 20)
	td.append(`<label>${expr}</label>`)
	t.append($('<tr/>').append(`<td style="text-align: center; color: white; background: gray;">${i}</font></td>`).append('<td class=judge style="width: 1em" />').append(td).append('<td><input></td>'))
}
$('input').on('change', (e) => {
	let node = $(e.target)
	let td = node.parent()
	let ok = node.val() == td.prev().data('result')
	console.log('result ', ok, ' : ', node.val(), ' == ', td.prev().data('result'))
	node.parent().parent().children('.judge').html(`<font color=${ok && "green" || "red"}>${ok && "✅" || "❌"}</font>`).attr('ok', ok)
	let len = $('.judge').filter((idx, elem) => {
		return $(elem).attr('ok') === 'true'
	}).length
	$('#ok_rate').html(`${len}/${total_cnt}`)
})