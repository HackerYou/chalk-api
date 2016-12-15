const spawn = require('child_process').spawn;
const vm = require('vm');
const fs = require('fs');

module.exports = {
	run(question,userAnswer) {
		return new Promise((resolve,reject) => {
			const date = +new Date()
			const file = `testCenter/test_${date}.js`;
			fs.writeFile(file, `
					${userAnswer}
					${question.unitTest}
				`, (err) => {
				const context = {
					spawn,
					__dirname,
					file,
					cb(data) {
						fs.unlink(file, (err) => {
							resolve(data)
						});
					}
				};

				const scriptRun = vm.runInNewContext(`
					const testRun = spawn('jest',['--json', file]);
					let testRes = '';
					testRun.stdout.on('data',(data) => {
						testRes += data.toString();
					});

					testRun.stdout.on('end',() => {
						cb(testRes);
					});
				`,context);
			});
		});
	}
}