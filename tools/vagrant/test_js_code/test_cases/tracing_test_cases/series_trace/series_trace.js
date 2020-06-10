// OW API setup:
const openwhisk = require('openwhisk');

var options = {apihost: '192.168.33.16',
  api_key: '23bc46b1-71f6-4ed5-8c54-816aa4f8c502:123zO3xZCLrMN6v2BKK1dXYFpXlPkccOFqm12CdAsMgRU4VrNZ9lyGVCGuMDGIwP',
  ignore_certs: 'yes'};
var ow = openwhisk(options);

// zipkin API setup
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
  localServiceName: 'Series Trace' // name of this application
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// and here we start the test. Make sure the zipkin server is running at the endpoint!!!
console.log('Starting : Series Trace ...');


// To avoid asynch, we block for the result
tracer.setId(tracer.createRootId());
tracer.recordServiceName("Series Trace")
const name = 'func_with_tag'
const blocking = true
const result = true
const argsA = {arg: 'A'}
const argsB = {arg: 'B'}

// Note that these logs can take up to 2min to show on the server
tracer.scoped(() => {
	const id = tracer.createChildId();
	tracer.setId(id);

	tracer.recordServiceName("Series Trace")
	tracer.recordAnnotation(new Annotation.ClientSend());
	tracer.recordAnnotation(new Annotation.Rpc(" AAA "))

	ow.actions.invoke({name, blocking, result, params: argsA}).then(r => {
		tracer.scoped(() => {
			tracer.setId(id);
			console.log(r)
			tracer.recordAnnotation(new Annotation.ClientRecv());
			tracer.scoped(() => {
				const id = tracer.createChildId();
				tracer.setId(id);

				tracer.recordServiceName("Series Trace")
				tracer.recordAnnotation(new Annotation.ClientSend());
				tracer.recordAnnotation(new Annotation.Rpc(" BBB "))

				ow.actions.invoke({name, blocking, result, params: argsB}).then(r => {
					tracer.scoped(() => {
						tracer.setId(id);
						console.log(r)
						tracer.recordAnnotation(new Annotation.ClientRecv());
					})
				})
			})
		})
	})
})


async function tester () {
	await sleep(1000);
}

tester();

console.log("DONE!!!");
