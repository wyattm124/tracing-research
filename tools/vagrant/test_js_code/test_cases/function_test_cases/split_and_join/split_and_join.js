const openwhisk = require('openwhisk');

var options = {apihost: '192.168.33.16',
  api_key: '23bc46b1-71f6-4ed5-8c54-816aa4f8c502:123zO3xZCLrMN6v2BKK1dXYFpXlPkccOFqm12CdAsMgRU4VrNZ9lyGVCGuMDGIwP',
  ignore_certs: 'yes'};
var ow = openwhisk(options);

console.log('Starting : Parallel ...');
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run (tag) {
	console.log(`run started, tag: ${tag}`)
	let p = ow.actions.invoke({name: 'func_with_tag', params: {arg: tag}})
		.then(async function(result) {
			// sleep to avoid HTTP 404 error of result not bieng found
			await sleep(500);
			return ow.activations.get(result).then(result => {
					console.log(result);
					return Promise.resolve(result)
			})
		})
	console.log(`run complete, tag: ${tag}`);
	return p;
}

let p1 = run('A');
// these functions do not run in Parallel
p3 = p1.then(r=> run(`(${r.response.result.tag}) B`)).then(r => run(`(${r.response.result.tag}) D`));
p4 = p1.then(r=> run(`(${r.response.result.tag}) C`)).then(r => run(`(${r.response.result.tag}) E`));

Promise.all([p3, p4]).then(r => run(`(${r[0].response.result.tag} ${r[1].response.result.tag}) F`));

console.log("DONE!!!")
