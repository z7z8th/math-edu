
// let low = 0, high = 100
// let opts.result_max = 100
let total_cnt = 100
let correct_cnt = 0
let modified_cnt = 0

function ffs(n) {
  if (n === 0) {
    return 0; // Or -1, depending on desired behavior for no set bits
  }
  // Isolate the rightmost set bit
  const rightmostOne = n & -n;
  // Use logarithm base 2 to find its 1-based position
  const position = Math.log2(rightmostOne) + 1;
  return position;
}

// Example usage:
// Binary of 18 is 010010, first set bit from right is position 2
console.log(`Position of first set bit in 18: ${ffs(18)}`); // Output: 2
// Binary of 12 is 1100, first set bit from right is position 3
console.log(`Position of first set bit in 12: ${ffs(12)}`); // Output: 3


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
	} while (++tried < 50 && (units < units_low || units > units_high))
	return i
}

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

const OP_ADD = 1 << 0;
const OP_SUB = 1 << 1;
const OP_MUL = 1 << 2;
const OP_DIV = 1 << 3;
const OP_DIV_REM = 1 << 4;
const OP_ADD_SUB_CONT = 1 << 5;
const OP_MIXED = 0xFF;
const OP_MAX_BITS = 6

const OP_MUL_XX = 1 << 8;
const OP_DIV_XX = 1 << 9;
const OP_DIV_XX_REM =  1 << 10;
// const OP_MUL_DIV = OP_MUL | OP_DIV;
const OP_XX_MIXED = 0xFF00;
const OP_XX_MAX_BITS = 3


function gen_exam(opts)
{
	// opts.result_max, opts.l_units_low, opts.l_units_high, opts.r_units_low, opts.r_units_high, 
	// opts.multidiv_units_high, 
	// opts.op_add, opts.op_sub, opts.op_add_sub_cont, opts.op_mul, opts.op_div, opts.op_div_rem
	let low = 0 //Math.min(10, opts.result_max - 1)
	let result

	let qtable = $('#main > table#questions')

	qtable.empty()

	const gen_funcs = new Map([
		//+
		[OP_ADD, () => {
			let lhs = rand_int_limit_units(low, opts.result_max, opts.l_units_low, opts.l_units_high)
			let rhs = rand_int_limit_units(low, opts.result_max-lhs, opts.r_units_low, opts.r_units_high)
			expr = `${lhs} + ${rhs} = `
			result = lhs + rhs
			// log(`expr ${expr} ${result}`)
			return [expr, result]
		}],
		//-
		[OP_SUB, () => {
			let lhs = rand_int_limit_units(low, opts.result_max, opts.l_units_low, opts.l_units_high)
			let rhs = rand_int_limit_units(low, lhs, opts.r_units_low, opts.r_units_high)
			expr = `${lhs} - ${rhs} = `
			result = lhs - rhs
			// log(`expr ${expr} ${result}`)
			return [expr, result]
		}],
		//+-
		[OP_ADD_SUB_CONT, () => {
			let iter_cnt = parseInt($('#add_sub_cont_cnt').val())
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
		}],
		//×
		[OP_MUL, () => {
			let lhs = rand_int(2, opts.multidiv_units_high)
			let rhs = rand_int(2, opts.multidiv_units_high)
			expr = `${lhs} × ${rhs} = `
			result = lhs * rhs
			// log(`expr ${expr} ${result}`)
			return [expr, result]
		}],
		//÷
		[OP_DIV, () => {
			do {
				let rhs = rand_int(2, opts.multidiv_units_high)
				let lhs = rand_int(opts.multidiv_units_high, opts.multidiv_units_high*rhs)
				result = Math.floor(lhs/rhs)
				lhs = rhs * result
				expr = `${lhs} / ${rhs} = `
			} while(result > opts.multidiv_units_high)
			// log(`expr ${expr} ${result}`)
			return [expr, result]
		}],
		//÷ with remainder
		[OP_DIV_REM, () => {
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
		}],

		// class high
		//× xx
		[OP_MUL_XX,() => {
			let lhs = rand_int(opts.muldiv_l_low, opts.muldiv_l_high)
			let rhs = rand_int(opts.muldiv_r_low, opts.muldiv_r_high)
			expr = `${lhs} × ${rhs} = `
			result = lhs * rhs
			// log(`expr ${expr} ${result}`)
			return [expr, result]
		}],
		//÷ xx
		[OP_DIV_XX,() => {
			do {
				let rhs = rand_int(Math.max(opts.muldiv_r_low, 2), opts.muldiv_r_high)
				let lhs = rand_int(Math.max(opts.muldiv_r_low, 2)*opts.muldiv_l_low, opts.muldiv_r_high*opts.muldiv_l_high)
				result = Math.floor(lhs/rhs)
				lhs = rhs * result
				expr = `${lhs} / ${rhs} = `
			} while(result > Math.max(opts.muldiv_r_high, opts.muldiv_l_high))
			// log(`expr ${expr} ${result}`)
			return [expr, result]
		}],
		//÷ with remainder
		[OP_DIV_XX_REM,
		() => {
			do {
				let rhs = rand_int(Math.max(opts.muldiv_r_low, 2), opts.muldiv_r_high)
				let lhs = rand_int(Math.max(opts.muldiv_r_low, 2)*opts.muldiv_l_low, opts.muldiv_r_high*opts.muldiv_l_high)
				result = Math.floor(lhs/rhs)
				remainder = rand_int(1, rhs-1)
				lhs = rhs*result + remainder
				expr = `${lhs} / ${rhs} = `
			} while(result > Math.max(opts.muldiv_r_high, opts.muldiv_l_high))
			// log(`expr ${expr} ${result}`)
			return [expr, result, remainder]
		}]
	])


	function onfocus(e) {
		let row = $(e.target).parent().parent()
		row.addClass('hls_row')
	}

	function losefocus(e) {
		let row = $(e.target).parent().parent()
		row.removeClass('hls_row')
	}

	let op=0
	for (i=0; i<total_cnt; i++) {
		let tried = 0
		let expr
		let result
		let remainder
		op = op || opts.ops
		let op_next
		do {
			if (opts.ops == OP_MIXED){
				[expr, result, remainder] = gen_funcs.get(OP_ADD << (i % OP_MAX_BITS))()
			} else if (opts.ops  == OP_XX_MIXED) {
				[expr, result, remainder] = gen_funcs.get(OP_MUL_XX << (i % OP_XX_MAX_BITS))()
			} else {
				op_next  = 1 << (ffs(op) - 1);
				[expr, result, remainder] = gen_funcs.get(op_next)()
			}

			// log(`out ${expr} ${result}`)
		} while (++tried < 20 && (result < 0 || result > opts.result_max))

		op &= ~op_next;
			
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
	
	opts.muldiv_l_low = parseInt($('#muldiv_l_low').val())
	opts.muldiv_l_high = parseInt($('#muldiv_l_high').val())
	opts.muldiv_r_low = parseInt($('#muldiv_r_low').val())
	opts.muldiv_r_high = parseInt($('#muldiv_r_high').val())

	opts.ops = 0
	opts.ops |= $('#op_add').is(':checked') ? OP_ADD : 0
	opts.ops |= $('#op_sub').is(':checked') ? OP_SUB : 0
	opts.ops |= $('#op_add_sub_cont').is(':checked')? OP_ADD_SUB_CONT : 0
	opts.ops |= $('#op_mul').is(':checked')? OP_MUL : 0
	opts.ops |= $('#op_div').is(':checked') ? OP_DIV : 0
	opts.ops |= $('#op_div_rem').is(':checked') ? OP_DIV_REM : 0
	opts.ops |= $('#op_mixed').is(':checked') ? OP_MIXED : 0

	opts.ops |= $('#op_mul_xx').is(':checked') ? OP_MUL_XX : 0
	opts.ops |= $('#op_div_xx').is(':checked') ? OP_DIV_XX : 0
	opts.ops |= $('#op_div_xx_rem').is(':checked') ? OP_DIV_XX_REM : 0
	opts.ops |= $('#op_xx_mixed').is(':checked') ? OP_XX_MIXED : 0

	console.log(`opts `, opts)
	
	reset_stat()
	gen_exam(opts)
}


function on_class_level_change(e)
{
	$('input[name="op_type"]').prop('checked', false);
	let checked = $("#class_low").is(':checked')
	$(".class_low").css("display", checked?"":"none")
	checked && $('#op_add').prop('checked', true)

	checked = $("#class_high").is(':checked')
	$(".class_high").css("display", checked?"":"none")
	checked && $('#op_mul_xx').prop('checked', true)
}
on_class_level_change()

function on_muldiv_duo_digits_change(e)
{
	if ($("#muldiv_duo_digits").is(':checked')) {
		$("#muldiv_l_low").val(11)
		$("#muldiv_l_high").val(99)
		$("#muldiv_r_low").val(11)
		$("#muldiv_r_high").val(99)
	} else {
		$("#muldiv_l_low").val(100)
		$("#muldiv_l_high").val(1000)
		$("#muldiv_r_low").val(1)
		$("#muldiv_r_high").val(10)
	}
}
on_muldiv_duo_digits_change()

// dark/white theme
let h = new Date().getHours()
if (h >= 18 || h<7) {
	$('html').css('backgroundColor', 'black')
	$('html').css('color', 'lightgray')
} else {
	$('html').css('backgroundColor', 'white')
	$('html').css('color', 'black')
}