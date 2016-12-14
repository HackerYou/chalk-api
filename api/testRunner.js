const spawn = require('child_process').spawn;
const vm = require('vm');

module.exports = {
	run(question,userAnswer) {
		console.log(question,userAnswer);
		console.log(question,userAnswer);
		return new Promise((resolve,reject) => {
			const context = {
				spawn,
				cb(data) {
					resolve(data)
				}
			};

			const scriptRun = vm.runInNewContext(`
				const testRun = spawn('jest',['--json']);
				let testRes = '';
				testRun.stdout.on('data',(data) => {
					testRes += data.toString();
				});

				testRun.stdout.on('end',() => {
					cb(testRes);
				});
			`,context);
		});
	}
}