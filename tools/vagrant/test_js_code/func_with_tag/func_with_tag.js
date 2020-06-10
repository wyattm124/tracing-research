exports.main = function (params) {
  console.log('func START')
  if(params.arg) {
	return {verbose: `func with tag : ${params.arg}`, tag: `${params.arg}`};
  } else {
	return {verbose: `func with tag : ${params.arg}`, tag: `NULL`};
  }
}
