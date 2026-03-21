
// let low = 0, high = 100
// let opts.result_max = 100
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
	} while (++tried < 50)
	return i
}

function rand_int_limit_units(low, high, units_low, units_high) {
	if (low > high) {
		alert(`low ${low} > high ${high}`)
		return 0
	}
	let tried = 0
	let i, units
	do {
		i = Math.round(Math.random()*(high-low) + low)
		units = i % 10
	} while (++tried < 20 && (units < units_low || units > units_high))
	return i
}


$('#main').append(``)
$('#main').append('')


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

function gen_exam(opts)
{
	// opts.result_max, opts.l_units_low, opts.l_units_high, opts.r_units_low, opts.r_units_high, 
	// opts.multidiv_units_high, opts.plus_only, opts.minus_only, opts.plus_minus_only, opts.multiply_only, opts.div_only, opts.div_w_rem_only
	let low = 0 //Math.min(10, opts.result_max - 1)
	let result

	let qtable = $('#main > table#questions')

	qtable.empty()

	let gen_funcs = [
		//+
		() => {
			let lhs = rand_int_limit_units(low, opts.result_max, opts.l_units_low, opts.l_units_high)
			let rhs = rand_int_limit_units(low, opts.result_max-lhs, opts.r_units_low, opts.r_units_high)
			expr = `${lhs} + ${rhs} = `
			result = lhs + rhs
			// log(`expr ${expr} ${result}`)
			return [expr, result]
		},
		//-
		() => {
			let lhs = rand_int_limit_units(low, opts.result_max, opts.l_units_low, opts.l_units_high)
			let rhs = rand_int_limit_units(low, lhs, opts.r_units_low, opts.r_units_high)
			expr = `${lhs} - ${rhs} = `
			result = lhs - rhs
			// log(`expr ${expr} ${result}`)
			return [expr, result]
		},
		//+-
		() => {
			let iter_cnt = parseInt($('#plus_minus_cont_cnt').val())
			let lhs, rhs
			lhs = rand_int_limit_units(low, opts.result_max, opts.l_units_low, opts.l_units_high)
			expr = `${lhs}`
			result = lhs
			for (c=0; c<iter_cnt; c++) {
				if (rand_int(0,9) % 2 == 0) { //+
					rhs = rand_int_limit_units(low, opts.result_max-result, opts.r_units_low, opts.r_units_high)
					expr += ` + ${rhs}`
					result += rhs
				} else {
					rhs = rand_int_limit_units(low, result, opts.r_units_low, opts.r_units_high)
					expr += ` - ${rhs}`
					result -= rhs
				}
			}

			expr += ' = '
			// log(`expr ${expr} ${result}`)
			return [expr, result]
		},
		//×
		() => {
			let lhs = rand_int(2, opts.multidiv_units_high)
			let l2 = rand_int(2, opts.multidiv_units_high)
			expr = `${lhs} × ${l2} = `
			result = lhs * l2
			// log(`expr ${expr} ${result}`)
			return [expr, result]
		},
		//÷
		() => {
			do {
				let rhs = rand_int(2, opts.multidiv_units_high)
				let lhs = rand_int(opts.multidiv_units_high, opts.multidiv_units_high*rhs)
				result = Math.floor(lhs/rhs)
				lhs = rhs * result
				expr = `${lhs} / ${rhs} = `
			} while(result > opts.multidiv_units_high)
			// log(`expr ${expr} ${result}`)
			return [expr, result]
		},
		//÷ with remainder
		() => {
			do {
				let rhs = rand_int(2, opts.multidiv_units_high)
				let lhs = rand_int(opts.multidiv_units_high, opts.multidiv_units_high*rhs)
				result = Math.floor(lhs/rhs)
				remainder = rand_int(1, rhs-1)
				lhs = rhs*result + remainder
				expr = `${lhs} / ${rhs} = `
			} while(result > opts.multidiv_units_high)
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
			if (opts.plus_only)
				[expr, result] = gen_funcs[0]()
			else if (opts.minus_only)
				[expr, result] = gen_funcs[1]()
			else if (opts.plus_minus_only)
				[expr, result] = gen_funcs[2]()
			else if (opts.multiply_only)
				[expr, result] = gen_funcs[3]()
			else if (opts.div_only)
				[expr, result] = gen_funcs[4]()
			else if (opts.div_w_rem_only)
				[expr, result, remainder] = gen_funcs[5]()
			else // mixed
				[expr, result, remainder] = gen_funcs[i % 6]()
			// log(`out ${expr} ${result}`)
		} while (++tried < 20 && (result < 0 || result > opts.result_max))
			
		let td_question = $('<td>')
		td_question.append(`<label>${expr}</label>`)

		let td_answer = $(`<td class=answer>
			<input type='tel' id='result_${i}' class='answer_input' style='min-width: 2em;'>
			${remainder && "...<input type='tel' id='remainder_"+i+"' class='remainder_input' style='width: 1em;'>" || ""}
			</td>`)
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
	let opts = {}
	opts.result_max = parseInt($('#result_max').val())
	opts.l_units_low = parseInt($('#l_units_low').val())
	opts.l_units_high = parseInt($('#l_units_high').val())
	opts.r_units_low = parseInt($('#r_units_low').val())
	opts.r_units_high = parseInt($('#r_units_high').val())
	opts.multidiv_units_high = parseInt($('#multidiv_units_high').val())

	opts.minus_only = $('#minus_only').is(':checked')
	opts.plus_only = $('#plus_only').is(':checked')
	opts.plus_minus_only = $('#plus_minus_only').is(':checked')
	opts.multiply_only = $('#multiply_only').is(':checked')
	opts.div_only = $('#div_only').is(':checked')
	opts.div_w_rem_only = $('#div_w_rem_only').is(':checked')

	console.log(`opts `, opts)
	
	reset_stat()
	gen_exam(opts)
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