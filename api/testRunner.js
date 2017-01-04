const spawn = require('child_process').spawn;
const vm = require('vm');
const fs = require('fs');


//Transpile file for HTML tests and React tests
function transpile(date,tempContent) {
	return new Promise((resolve,reject) => {
		const filePath = `testCenter/test_${date}`;
		fs.writeFile(filePath,tempContent,(err) => {
			console.log(err);
			transpiledSrc = spawn('babel',[`${filePath}.js`,'-o',`${filePath}_compiled.js`]);
			transpiledSrc.stdout.on('data', data => {
				console.log(data.toString())
			});
			transpiledSrc.stdout.on('end',() => {
				resolve();
			});
		});
	});
}


module.exports = {
	run(question,userAnswer) {
		return new Promise((resolve,reject) => {
			const date = +new Date()
			const file = `testCenter/test_${date}_compiled.js`;
			// Transpile code
			if(question.type === 'Code' && question.category === 'HTML') {
				userAnswer = `
				const enzyme = require('enzyme');
				const shallow = enzyme.shallow;
				const mount = enzyme.mount;
				const render = enzyme.render;
				const React = require('react');
				class Element extends React.Component {
					render() {
						<span>
							${userAnswer}
						</span>
					}
				}
				`;
			}
			transpile(date,`
				${userAnswer}
				${question.unitTest}
			`).then(() => {
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
};