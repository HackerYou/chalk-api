const spawn = require('child_process').spawn;
const vm = require('vm');
const fs = require('fs');
const bcrypt = require('bcryptjs');


//Transpile file for HTML tests and React tests
function transpile(file,tempContent) {
	return new Promise((resolve,reject) => {
		fs.writeFile(`${file}.js`,tempContent,(err) => {
			if(err) {
				reject(err);
			}
			const files = fs.readdirSync('testCenter')
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
			const hash = bcrypt.hashSync(question._id.toString(), 2).replace(/[\/.]/ig,'');
			const file = `${__dirname.replace('/api','')}/testCenter/test_${hash}`;
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