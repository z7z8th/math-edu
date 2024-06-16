
// let low = 0, high = 100
// let result_max = 100
let total_cnt = 100
let correct_cnt = 0
let modified_cnt = 0

let log = console.log

function rand_int(low, high) {
	// high = high
	if (low > high) {
		alert(`low ${low} > high ${high}`)
		return 0
	}
	let tried = 0
	let i
	do {
		i = Math.round(Math.random()*(high-low) + low)
	} while (++tried < 20)
	return i
}

function rand_int_limit_units(low, high, low, high) {
	if (low > high) {
		alert(`low ${low} > high ${high}`)
		return 0
	}
	let tried = 0
	let i, units
	do {
		i = Math.round(Math.random()*(high-low) + low)
		units = i % 10
	} while (++tried < 20 && (units < low || units > high))
	return i
}


$('#main').append(`<div style='position: fixed; top: 0px; width: 80%; padding: 4px; color: white; background: teal; '>
ok rate: <label id='ok_rate' ></label><br>
time used: <label id='time_used'></label>
<div id='log'></log>
</div>`)
$('#main').append('<table id="questions"/>')


function update_input_handlers()
{
	let start
	let last
	function check_result(node, onfly, modify) {
		if (start === undefined) {
			last = start = Date.now()
		}
		if (node.data('ok') !== undefined)
			return

		let td_answer = node.parent()
		let remainder = td_answer.data('remainder')
		let final_judge = !remainder || node.hasClass("remainder_input")

		let ok = false
		if (node.hasClass('answer_input'))
			ok = node.val() == td_answer.data('result')
		else
			ok = node.val() == remainder && node.prev().val() == td_answer.data('result')

		let row = node.parent().parent()
		if (modify) {
			row.data('modified', true)
		}
		if (onfly && !ok) {
			return
		}

		// freeze node
		node.prop('disabled', true)
		node.data('ok', ok)

		// update statistics
		if (final_judge) {
			row.children('.judge').html(`<font color=${ok && 'green' || 'red'}>${ok && '✅' || '❌'}</font>`)

			if (row.data('modified')) {
				modified_cnt++
				row.children('.judge').css('border', '1px solid gray').css('border-radius', '5px')
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
			row.removeClass('hls_row')
			$(`#result_${td_answer.data('idx')+1}`).focus()
		} else {
			// focus remainder input
			node.next().focus()
		}
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
	$('input.answer_input').on('change', onchange)  // enable this will update `last' twice, and result in elapsed 0

	$('input.remainder_input').on('keyup', onkeyup)
	$('input.remainder_input').on('change', onchange)  // enable this will update `last' twice, and result in elapsed 0
}

function reset_stat()
{
	correct_cnt = 0
	modified_cnt = 0
	last = undefined
	start = undefined
	$('#time_used').html(``)
	$('#ok_rate').html(``)
}

function gen_exam(l_low, l_high, r_low, r_high, multiply_only, div_only, div_w_rem_only)
{
	let low = 0 //Math.min(10, result_max - 1)
	let result

	let qtable = $('#main > table#questions')

	qtable.empty()

	let gen_funcs = [
		//×
		() => {
			let l1 = rand_int(l_low, l_high)
			let l2 = rand_int(r_low, r_high)
			expr = `${l1} × ${l2} = `
			result = l1 * l2
			// log(`expr ${expr} ${result}`)
			return [expr, result]
		},
		//÷
		() => {
			do {
				let l2 = rand_int(Math.max(r_low, 2), r_high)
				let l1 = rand_int(Math.max(r_low, 2)*l_low, r_high*l_high)
				result = Math.floor(l1/l2)
				l1 = l2 * result
				expr = `${l1} / ${l2} = `
			} while(result > Math.max(r_high, l_high))
			// log(`expr ${expr} ${result}`)
			return [expr, result]
		},
		//÷ with remainder
		() => {
			do {
				let l2 = rand_int(Math.max(r_low, 2), r_high)
				let l1 = rand_int(Math.max(r_low, 2)*l_low, r_high*l_high)
				result = Math.floor(l1/l2)
				remainder = rand_int(1, l2-1)
				l1 = l2*result + remainder
				expr = `${l1} / ${l2} = `
			} while(result > Math.max(r_high, l_high))
			// log(`expr ${expr} ${result}`)
			return [expr, result, remainder]
		}
	]


	function onfocus(e) {
		let row = $(e.target).parent().parent()
		row.addClass('hls_row')
	}

	function losefocus(e) {
		let row = $(e.target).parent().parent()
		row.removeClass('hls_row')
	}

	for (i=0; i<total_cnt; i++) {
		let tried = 0
		let expr
		let result
		let remainder
		do {
			let fi = i % 3
			if (multiply_only)
				[expr, result] = gen_funcs[0]()
			else if (div_only)
				[expr, result] = gen_funcs[1]()
			else if (div_w_rem_only)
				[expr, result, remainder] = gen_funcs[2]()
			else
				[expr, result, remainder] = gen_funcs[fi]()
			// log(`out ${expr} ${result}`)
		} while (++tried < 20 && result < 0)
		let td_question = $('<td>')
		td_question.append(`<label>${expr}</label>`)

		let td_answer = $(`<td class=answer><input type='tel' id='result_${i}' class='answer_input' style='min-width: 2em;'>${remainder && "...<input type='tel' id='remainder_"+i+"' class='remainder_input' style='width: 1em;'>" || ""}</td>`)
		td_answer.data('expr',   expr)
		td_answer.data('result', result)
		td_answer.data('remainder', remainder)
		td_answer.data('idx', i)

		let tr = $('<tr/>')
		tr.append(`<td style='text-align: center; color: white; background: gray;'>${i}</font></td>`)
		tr.append(`<td class='judge' style='width: 1em' />`)
		tr.append(td_question)
		tr.append(td_answer)
		tr.append(`<td class='time_used'></td>`)

		tr.on('focusout', losefocus)
		tr.on('focusin', onfocus)

		qtable.append(tr)
	}

	update_input_handlers();
}

function gen_handler()
{
	let l_low = parseInt($('#l_low').val())
	let l_high = parseInt($('#l_high').val())
	let r_low = parseInt($('#r_low').val())
	let r_high = parseInt($('#r_high').val())

	let multiply_only = $('#multiply_only').is(':checked')
	let div_only = $('#div_only').is(':checked')
	let div_w_rem_only = $('#div_w_rem_only').is(':checked')
	// console.log(`result_max ${typeof(result_max)}: ${result_max} minus_only ${minus_only}`)
	reset_stat()
	gen_exam(l_low, l_high, r_low, r_high, multiply_only, div_only, div_w_rem_only)
}

// dark/white theme
let h = new Date().getHours()
if (h >= 18 || h<7) {
	$('html').css('backgroundColor', 'black')
	$('html').css('color', 'gray')
} else {
	$('html').css('backgroundColor', 'white')
	$('html').css('color', 'black')
}