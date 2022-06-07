
// let low = 0, high = 100
// let result_max = 100
let total_cnt = 100
let correct_cnt = 0
let modified_cnt = 0

function rand_int(low, high, ones_low, ones_high) {
	let i, ones
	do {
		i = parseInt(Math.random()*(high-low) + low)
		ones = i % 10
	} while (high > 10 && i <= 10 || ones < ones_low || ones > ones_high)
	return i
}

$('#main').append(`<div style='position: fixed; top: 0px; width: 80%; padding: 4px; color: white; background: teal; '>
ok rate: <label id='ok_rate' ></label><br>
time used: <label id='time_used'></label>
<div id='log'></log>
</div>`)
$('#main').append('<table/>')


function update_input_handlers()
{
	let start
	let last
	function check_result(node, onfly, modify) {
		if (start === undefined) {
			start = Date.now()
			last = start
			// $('#log').append(`init start ${start}, last ${last}<br/>`)
		}

		let td_answer = node.parent()
		let ok = node.val() == td_answer.data('result')
		// console.log('result ', ok, ' : ', node.val(), ' == ', td_answer.data('result'))
		let row = node.parent().parent()
		if (modify) {
			node.data('modified', true)
		}
		if (onfly && !ok) {
			return
		}

		// freeze node
		node.prop('disabled', true)

		// update statistics
		row.children('.judge').html(`<font color=${ok && 'green' || 'red'}>${ok && '✅' || '❌'}</font>`)
		if (node.data('modified')) {
			modified_cnt++
			row.children('.judge').css('border', '1px solid gray')
		}
		// let len = $('.judge').filter((idx, elem) => { return $(elem).attr('ok') === 'true' }).length
		if (ok) {
			correct_cnt++
		}

		$('#ok_rate').html(`${correct_cnt}/${total_cnt} (${modified_cnt} ?)`)

		// time elapsed
		let now = Date.now()
		// $('#log').append(`now ${now} last ${last} diff ${now-last}, start ${start}<br/>`)
		row.children('.time_used').html(`${Math.floor((now-last)/1000)}秒`)

		let elapsed = (now - start)/1000
		let mins = Math.floor(elapsed/60)
		let seconds = Math.floor(elapsed % 60)
		$('#time_used').html(`${mins}分${seconds}秒`)
		last = now

		// focus next
		let idx = td_answer.data('idx')
		$(`#result_${idx+1}`).focus()
	}

	function onkeyup(e) {
		// console.log('keyCode ', e.keyCode, ' code ', e.code)
		let modify = e.code == 'Backspace'
		check_result($(e.target), true, modify)
		return true
	}

	function onchange(e) {
		check_result($(e.target), false, false)
		return true
	}

	$('input.answer_input').on('keyup', onkeyup)
	// $('input.answer_input').on('change', onchange)  // enable this will update `last' twice, and result in elapsed 0
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
		let td_question = $('<td>')
		td_question.append(`<label>${expr}</label>`)

		let td_answer = $(`<td><input type='tel' id='result_${i}' class='answer_input' style='width: 4em;'></td>`)
		td_answer.data('expr',   expr)
		td_answer.data('result', result)
		td_answer.data('idx', i)

		let tr = $('<tr/>')
		tr.append(`<td style='text-align: center; color: white; background: gray;'>${i}</font></td>`)
		tr.append(`<td class='judge' style='width: 1em' />`)
		tr.append(td_question)
		tr.append(td_answer)
		tr.append(`<td class='time_used'></td>`)
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