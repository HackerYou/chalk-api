const spawn = require('child_process').spawn;
const vm = require('vm');
const fs = require('fs');


//Transpile file for HTML tests and React tests
function transpile(date,tempContent) {
	return new Promise((resolve,reject) => {
		const filePath = `testCenter/test_${date}`;
		fs.writeFile(`${filePath}.js`,tempContent,(err) => {
			transpiledSrc = spawn('babel',[`${filePath}.js`,'-o',`${filePath}_transpiled.js`]);
			transpiledSrc.stdout.pipe(process.stdout)
			transpiledSrc.on('exit',() => {
				resolve();
			});
		});
	});
}

function removeFile(file) {
	return new Promise((resolve,reject) => {
		fs.unlink(file, (err) => {
			resolve()
		});
	});
}

module.exports = {
	run(question,userAnswer) {
		return new Promise((resolve,reject) => {
			const date = +new Date();
			const file = `testCenter/test_${date}`;
			const requires = `
				const enzyme = require('enzyme');
				const shallow = enzyme.shallow;
				const mount = enzyme.mount;
				const render = enzyme.render;
				const React = require('react');
			`;
			// Transpile code
			if(question.type === 'Code' && question.category === 'HTML') {
				userAnswer = `
				class Element extends React.Component {
					render() {
						return (
							<span>
								${userAnswer}
							</span>
						)
					}
				}
				`;
			}
			userAnswer = `
				${requires}
				${userAnswer}
			`;
			transpile(date,`
				${userAnswer}
				${question.unitTest}
			`).then(() => {
				const context = {
					spawn,
					__dirname,
					file,
					cb(data) {
						Promise.all([removeFile(`${file}.js`),removeFile(`${file}_transpiled.js`)])
							.then(() => {
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