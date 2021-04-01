const http = require("https");
const url = require("url");

exports.get = (uri, headers = {}) => {
	let q = url.parse(uri);
	let options = {
		hostname: q.hostname,
		port: 443,
		path: q.path,
		search: q.search,
		method: "GET",
		headers: headers
	};
	return new Promise((resolve, reject) => {
		const req = http.request(options, res => {
			let fullData = "";
			res.on('data', (data) => {fullData += data});
			res.on('end', () => resolve(fullData));
		})

		req.on('error', (error) => reject(error));

		req.end()
	});
}

exports.post = (uri, data, headers = {}) => {
	let q = url.parse(uri);
	let options = {
		hostname: q.hostname,
		port: 443,
		path: q.path,
		search: q.search,
		method: "POST",
		headers: headers
	};
	return new Promise((resolve, reject) => {
		const req = http.request(options, res => {
			let fullData = "";
			res.on('data', (data) => {fullData += data});
			res.on('end', () => resolve(fullData));
		})

		req.on('error', (error) => reject(error));

		if (data) req.write(data);
		req.end();
	});
}

exports.put = (uri, data, headers = {}) => {
	let q = url.parse(uri);
	let options = {
		hostname: q.hostname,
		port: 443,
		path: q.path,
		search: q.search,
		method: "PUT",
		headers: headers
	};
	return new Promise((resolve, reject) => {
		const req = http.request(options, res => {
			let fullData = "";
			res.on('data', (data) => {fullData += data});
			res.on('end', () => resolve(fullData));
		})

		req.on('error', (error) => reject(error));

		req.write(data);
		req.end();
	});
}