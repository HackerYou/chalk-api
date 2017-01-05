const spawn = require('child_process').spawn;
const vm = require('vm');
const fs = require('fs');


//Transpile file for HTML tests and React tests
function transpile(file,tempContent) {
	return new Promise((resolve,reject) => {
		fs.writeFile(`${file}.js`,tempContent,(err) => {
			if(err) {
				reject(err);
			}
			transpiledSrc = spawn('babel',[`${file}.js`,'-o',`${file}_transpiled.js`]);
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
			if(err) {
				reject(err);
			}
			resolve();
		});
	});
}

module.exports = {
	run(question,userAnswer) {
		return new Promise((resolve,reject) => {
			const date = +new Date();
			const file = `${__dirname.replace('/api','')}/testCenter/test_${date}`;
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
			transpile(file,`
				${userAnswer}
				${question.unitTest}
			`).then(() => {
				console.log(file);
				const context = {
					spawn,
					__dirname,
					file: `${file}_transpiled.js`,
					cb(data) {
						Promise.all([removeFile(`${file}.js`),removeFile(`${file}_transpiled.js`)])
							.then(() => {
								resolve(data)
							})
							.catch((err) => {
								console.log(`${new Date()} - ${err}`);
								reject(err);
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
			})
			.catch((err) => {
				console.log(`${new Date()} - ${err}`);
				reject(err);
			});
		});
	}
};