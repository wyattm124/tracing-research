//const {Tracer, ExplicitContext, BatchRecorder} = require('zipkin');
//const {HttpLogger} = require('zipkin-transport-http');
//const wrap = require('zipkin-instrumentation-openwhisk');

//const ctxImpl = new ExplicitContext()

//const recorder = new BatchRecorder({
//  logger: new HttpLogger({
//    endpoint: 'http://192.168.33.16:9411/api/v1/spans'
///  })
//});

//const tracer = new Tracer({ctxImpl, recorder});
//const serviceName = 'chaining-test';

const openwhisk = require('openwhisk');
// or is host : 'http://192.168.33.16:10001' ???
// need tothese options if trying to invoke from a different machine
var options = {apihost: '192.168.33.16:10001',
 api_key: '23bc46b1-71f6-4ed5-8c54-816aa4f8c502:123zO3xZCLrMN6v2BKK1dXYFpXlPkccOFqm12CdAsMgRU4VrNZ9lyGVCGuMDGIwP', ignore_certs: 'true'};
var ow_options = openwhisk(options);
//const ow = wrap(ow_options, { tracer, serviceName });

console.log('Starting Test ...');

// // STEP 1
exports.main = ow_options.actions.invoke({ actionName: 'Firstname' }).then(result => console.log(result));
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
