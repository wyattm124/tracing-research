const {Tracer, ExplicitContext, BatchRecorder} = require('zipkin');
const {HttpLogger} = require('zipkin-transport-http');
const wrap = require('zipkin-instrumentation-openwhisk');

// NOTE : no tracing yet!!!

//const ctxImpl = new ExplicitContext()

//const recorder = new BatchRecorder({
//  logger: new HttpLogger({
//    endpoint: 'http://192.168.33.16:9411/api/v1/spans'
//  })
//});

//const tracer = new Tracer({ctxImpl, recorder});
//const serviceName = 'chaining-test';

const openwhisk = require('openwhisk');
// or is host : 'http://192.168.33.16:10001' ???
var options = {apihost: '192.168.33.16',
 api_key: '23bc46b1-71f6-4ed5-8c54-816aa4f8c502:123zO3xZCLrMN6v2BKK1dXYFpXlPkccOFqm12CdAsMgRU4VrNZ9lyGVCGuMDGIwP',
 ignore_certs: 'yes'};
var ow = openwhisk(options);
//const ow = wrap(ow_options, { tracer, serviceName });

console.log('Starting Test ...');
const blocking = true, result = true
var result_id;
// // STEP 1
ow.actions.invoke('Firstname').then(result => console.log(result));
console.log(result_id, "Hello")
//console.log(ow.activations.get(result)
//ow.activations.get(result)
//ow.actions.get(result_id).then(result => console.log(result))
// // STEP 2
// ow.actions.invoke({
// 	actionName: 'lastname'
// }).then(result =>
// 	console.log('result: ', result);
// )
// // STEP 3
// ow.actions.invoke({
// 	actionName: 'lastname'
// }).then(result =>
// 	console.log('result: ', result);
// 	ow.actions.invoke({
// 		actionName: 'lastname',
// 		params: {name: "Joey"}
// 	}).then(result =>
// 		console.log('result: ', result);
// 	)
// )
