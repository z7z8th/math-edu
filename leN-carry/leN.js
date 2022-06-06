
// let low = 0, high = 100
// let result_max = 100
let total_cnt = 100

function rand_int(low, high, ones_low, ones_high) {
	let i, ones
	do {
		i = parseInt(Math.random()*(high-low) + low)
		ones = i % 10
	} while (ones < ones_low || ones > ones_high)
	return i
}

$('#main').append('<div style="position: fixed; top: 0px; width: 170px; padding: 4px; color: white; background: teal; ">' +
					'ok rate: <label id="ok_rate" ></label><br>' +
					'time used: <label id="time_used"></label>' +
					'</div>')
// $('#main').append('<table style="margin-top: 3.5rem; "/>')


function update_input_handlers()
{
	let start
	let last
	function check_result(node, onfly) {
		if (start === undefined) {
			start = new Date().getTime()
			last = start
		}
		let td_ret = node.parent()
		let ok = node.val() == td_ret.data('result')
		console.log('result ', ok, ' : ', node.val(), ' == ', td_ret.data('result'))
		if (onfly && !ok) {
			return
		}

		// freeze node
		node.prop('disabled', true)

		// update statistics
		let row = node.parent().parent()
		row.children('.judge').html(`<font color=${ok && "green" || "red"}>${ok && "✅" || "❌"}</font>`).attr('ok', ok)
		let len = $('.judge').filter((idx, elem) => { return $(elem).attr('ok') === 'true' }).length
		$('#ok_rate').html(`${len}/${total_cnt}`)

		// time elapsed
		let now = new Date().getTime()
		row.children('.time_used').html(`${Math.floor((now-last)/1000)}秒`)

		let elapsed = (now - start)/1000
		let mins = Math.floor(elapsed/60)
		let seconds = Math.floor(elapsed % 60)
		$('#time_used').html(`${mins}分${seconds}秒`)
		last = now

		// focus next
		let idx = td_ret.data('idx')
		$(`#result_${idx+1}`).focus()
	}

	function onkeyup(e) {
		check_result($(e.target), true)
		return true
	}

	function onchange(e) {
		check_result($(e.target), false)
		return true
	}

	$('input.result').on('keyup', onkeyup)
	// $('input.result').on('change', onchange)
}

function gen_exam(result_max, ones_low, ones_high, minus_only, plus_only)
{
	let low = 0
	let t = $('#main > table')

	t.empty()

	for (i=0; i<total_cnt; i++) {
		let expr
		let result
		do {
			let l1 = rand_int(low, result_max, 3, 6)
			let l2 = rand_int(low, result_max, ones_low, ones_high)
			if (plus_only || !minus_only && i%2 == 0) {
				expr = `${l1} + ${l2} = `
				result = l1 + l2
			} else {
				if (l1 < l2) {
					[l1, l2] = [l2, l1]
				}
				expr = `${l1} - ${l2} = `
				result = l1 - l2
			}
		} while (result < 0 || result > result_max)
		let td = $('<td>')
		td.append(`<label>${expr}</label>`)

		let td_ret = $(`<td><input type="tel" id="result_${i}" class="result" style="width: 4em;"></td>`)
		td_ret.data('expr',   expr)
		td_ret.data('result', result)
		td_ret.data('idx', i)

		let tr = $('<tr/>')
		tr.append(`<td style="text-align: center; color: white; background: gray;">${i}</font></td>`)
		tr.append('<td class="judge" style="width: 1em" />')
		tr.append(td)
		tr.append(td_ret)
		tr.append(`<td class="time_used"></td>`)
		t.append(tr)
	}

	update_input_handlers();
}

function gen_handler()
{
	let result_max = parseInt($('#result_max').val())
	let ones_low = parseInt($('#ones_low').val())
	let ones_high = parseInt($('#ones_high').val())
	let minus_only = $('#minus_only').is(':checked')
	let plus_only = $('#plus_only').is(':checked')
	console.log(`result_max ${typeof(result_max)}: ${result_max} minus_only ${minus_only}`)
	gen_exam(result_max, ones_low, ones_high, minus_only, plus_only)
}