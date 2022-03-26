
// let low = 0, high = 100
// let result_max = 100
let total_cnt = 100

function rand_int(low, high) {
	return parseInt(Math.random()*(high-low) + low)
}

$('#main').append('<div style="position: fixed; top: 0px; width: 170px; padding: 4px; color: white; background: teal; ">' +
					'ok rate: <label id=ok_rate ></label><br>' +
					'time used: <label id=time_used></label>' +
					'</div>')
// $('#main').append('<table style="margin-top: 3.5rem; "/>')

function update_input_handlers()
{
	let start
	let last

	$('input.result').on('change', (e) => {
		if (!start) {
			start = new Date().getTime()
			last = start
		}
		let node = $(e.target)
		node.prop('disabled', true)
		let td = node.parent()
		let ok = node.val() == td.prev().data('result')
		console.log('result ', ok, ' : ', node.val(), ' == ', td.prev().data('result'))
		let row = node.parent().parent()
		row.children('.judge').html(`<font color=${ok && "green" || "red"}>${ok && "✅" || "❌"}</font>`).attr('ok', ok)
		let len = $('.judge').filter((idx, elem) => {
			return $(elem).attr('ok') === 'true'
		}).length
		$('#ok_rate').html(`${len}/${total_cnt}`)
		let now = new Date().getTime()
		let elapsed = (now - start)/1000
		let mins = Math.floor(elapsed/60)
		let seconds = Math.floor(elapsed % 60)
		row.children('.time_used').html(`${Math.floor((now-last)/1000)}秒`)
		last = now
		$('#time_used').html(`${mins}分${seconds}秒`)
	})
}

function gen_exam(result_max, minus_only)
{
	let low = 0
	let t = $('#main > table')

	t.empty()

	for (i=0; i<total_cnt; i++) {
		let td
		let expr
		let result
		do {
			td = $('<td>')
			let l1 = rand_int(low, result_max)
			let l2 = rand_int(low, result_max)
			if (!minus_only && i%2 == 0) {
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
		} while (result < 0 || result > result_max)
		td.append(`<label>${expr}</label>`)
		t.append($('<tr/>').append(`<td style="text-align: center; color: white; background: gray;">${i}</font></td>`).append('<td class=judge style="width: 1em" />').append(td).append('<td><input type=number class=result style="width: 4em;"></td><td class=time_used></td>'))
	}

	update_input_handlers();
}

function gen_handler()
{
	let result_max = parseInt($('#result_max').val())
	let minus_only = $('#minus_only').is(':checked')
	console.log(`result_max ${typeof(result_max)}: ${result_max} minus_only ${minus_only}`)
	gen_exam(result_max, minus_only)
}