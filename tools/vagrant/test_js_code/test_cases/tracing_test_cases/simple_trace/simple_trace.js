// OW API setup:
const openwhisk = require('openwhisk');

var options = {apihost: '192.168.33.16',
  api_key: '23bc46b1-71f6-4ed5-8c54-816aa4f8c502:123zO3xZCLrMN6v2BKK1dXYFpXlPkccOFqm12CdAsMgRU4VrNZ9lyGVCGuMDGIwP',
  ignore_certs: 'yes'};
var ow = openwhisk(options);

// zipkin API setup
// NOTE : for debug use
// const recorder_STDOUT = new ConsoleRecorder();

// here on is copied from GIT repository (NOT the npm page)
const {
  Tracer,
  BatchRecorder,
  jsonEncoder: {JSON_V2},
  Annotation,
  ExplicitContext
} = require('zipkin');
const CLSContext = require('zipkin-context-cls');
const {HttpLogger} = require('zipkin-transport-http');

// Setup the tracer to use http and implicit trace context
const tracer = new Tracer({
  ctxImpl: new CLSContext(),
  recorder: new BatchRecorder({
    logger: new HttpLogger({
      endpoint: 'http://192.168.33.16:9411/api/v2/spans',
      jsonEncoder: JSON_V2
    })
  }),
  localServiceName: 'Simple Trace' // name of this application
});

// and here we start the test. Make sure the zipkin server is running at the endpoint!!!
console.log('Starting : Simple Trace ...');
// DEBUG NOTES SO FAR:
// - if unsure what is going on use the console recorder
// - we get a namless span with the current code, but not sure why
// - async function added at the end becaause it may be that the program
//   was exiting before span could be asyncronously recorded

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// note that this does not work becaause zipkin library has
// trouble with asynch functions
// to make make it work with async need
// to replace continuation-local-storage dependancy in
// CLS context with CLS-hook
// this was talked about on the pull request of zipkin-js
async function run (tag) {
	tracer.scoped(() => {
		const id = tracer.createChildId();
		tracer.setId(id);

		tracer.recordAnnotation(new Annotation.ClientSend());
		tracer.recordAnnotation(new Annotation.Rpc(`Func with tag : ${tag}`));

		let p = ow.actions.invoke({name: 'func_with_tag', params: {arg: tag}})
			.then(async function(result) {
					// sleep to avoid HTTP 404 error of result not bieng found (OW not done running function)
				await sleep(1500);
				tracer.scoped(() => {
					tracer.setId(id);
					return ow.activations.get(result).then(result => {
						console.log(result);
						return Promise.resolve(result)
					})
					tracer.recordAnnotation(new Annotation.ClientRecv());
				});
			})
		return p;
	});
}

// To avoid asynch, we block for the result
const rootId = tracer.createRootId()
tracer.setId(rootId);
tracer.recordServiceName("Simple Trace")
const name = 'func_with_tag'
const blocking = true
const result = true
const args = {arg: 'A', _temp_trace_ID: rootId.traceId, _temp_parent_ID: rootId.spanId}

// Note that these logs can take up to 2min to show on the server
tracer.scoped(() => {
	const id = tracer.createChildId();
	tracer.setId(id);

	tracer.recordServiceName("Simple Trace")
	tracer.recordAnnotation(new Annotation.ClientSend());
	tracer.recordAnnotation(new Annotation.Rpc(" AAA "))

	ow.actions.invoke({name, blocking, result, params: args}).then(r => {
		tracer.scoped(() => {
			tracer.setId(id);
			console.log(r)
			tracer.recordAnnotation(new Annotation.ClientRecv());
		})
	})
})

// Note that these two implementations below work as intended,
//  but not exactly the tracing we want
//tracer.scoped(() => {
	//const id = tracer.createChildId();
	//tracer.setId(id);
	//tracer.recordAnnotation(new Annotation.ClientSend());
	//tracer.recordAnnotation(new Annotation.Rpc("Func with tag : A"));
	//tracer.scoped(() => {
		//tracer.setId(id);
		//run('A');
		//tracer.recordAnnotation(new Annotation.ClientRecv());
	//})
//})

// tracer.scoped(() => {
// 	const id = tracer.createChildId();
// 	tracer.setId(id);
// 	tracer.recordAnnotation(new Annotation.ClientSend());
// 	tracer.recordAnnotation(new Annotation.Rpc("Func with tag : B"));
// 	tracer.scoped(() => {
// 		tracer.setId(id);
		//run('B');
		//tracer.recordAnnotation(new Annotation.ClientRecv());
	//})
//})

async function tester () {
	await sleep(1000);
}

tester();

console.log("DONE!!!");
