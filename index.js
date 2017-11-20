/*

    This file is part of Dash Webserver
    Copyright 2017 Benjamin Collins

    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be included
    in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
    OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
    IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
    CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
    TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
    SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

"use strict";

const fs = require("fs");
const sprintf = require("sprintf");
const express = require("express");

const app = express();

app.set("views", __dirname + "/public");
app.set("view engine", 'ejs');
app.get("/", renderPage);
app.get(/^\/([A-z]+)\/$/, renderPage);
app.get(/^\/([A-z]+)\/([A-z,0-9]+)\/$/, renderPage);
app.use(express.static("public"));
app.listen(8080);

function renderPage(req, res) {

	// Sort Parameters

	fs.readFile("public/articles.json", function(err, buf) {
		if(err) {
			throw err;
		}

		let articles = JSON.parse(buf.toString());
		let keys = Object.keys(articles);

		let params = req.params;
		params[0] = params[0] || keys[0];
		params[1] = params[1];

		if(!params[1]) {
			if(articles[params[0]]) {
				params[1] = articles[params[0]][0];
			} else {
				return res.status(404).end("not found");
			}
		}

		params[1] = params[1].replace(/ /g, "_");
		params[2] = params[1].replace(/_/g, " ");

		// Set Arguments for Template

		let args = {
			"selected" : params[0],
			"desktop_header" : renderDesktopHeader(params,articles),
			"mobile_header" : renderMobileHeader(params,articles),
			"table_of_contents" : renderTableOfContents(params,articles),
			"article_body" : renderArticleBody(params,articles),
			"footer" : renderFooter(params,articles)
		};

		// Render ejs Template

		res.render('index', args);

	});

}

function renderDesktopHeader(params,articles) {

	let str = "";

	for(let key in articles) {

		str += "<td>";
		if(params[0] !== key) {
			str += sprintf("<a href='/%s/'>", key);
		} else {
			str += sprintf("<a class='selected'>");
		}
		str += key;
		str += "</a>";
		str += "</td>";
	}

	return str;

}

function renderMobileHeader(params,articles) {

	let str = "";

	for(let key in articles) {

		str += "<li>";
		if(params[0] !== key) {
			str += sprintf("<a href='/%s/'>", key);
		} else {
			str += sprintf("<a class='selected'>");
		}
		str += key;
		str += "</a>";
		str += "</li>";
	}

	return str;

}

function renderTableOfContents(params,articles) {

	let str = "";
	let base = params[0];

	for(let i = 0; i < articles[base].length; i++) {

		let key = articles[params[0]][i];
		let link = key.replace(/ /g, "_");

		str += "<li>";
		if(params[2] !== key) {
			str += sprintf("<a href='/%s/%s/'>", base, link);
		} else {
			str += sprintf("<a class='selected'>");
		}
		str += key;
		str += "</a>";
		str += "</li>";

	}

	return str;

}

function renderArticleBody(params,articles) {

	let data;
	let str = "";

	str += sprintf("<h2>%s</h2>", params[2]);

	let format = "public/pages/%s/%s.html";
	let file = sprintf(format, params[0], params[1]);

	try {
		data = fs.readFileSync(file);
	} catch(err) {
		return str;
	}

	str += data.toString();
	return str;

}

function renderFooter(params,articles) {

	let ref;
	let str = "";
	let list = articles[params[0]];

	let pos = list.indexOf(params[2]);

	str += "<table>";
	str += "<tr>";
	// Previous Article
	str += "<td>";
	if(pos > 0) {
		ref = list[pos - 1].replace(/ /g, "_");
		str += sprintf("<a href='/%s/%s/'>", params[0], ref);
		str += "&lt;&lt; Prev";
		str += "<span><br>";
		str += list[pos - 1];
		str += "</span>";
	}
	str += "</td>";
	// Spacing
	str += "<td>";
	str += "</td>";
	// Next Article
	str += "<td>";
	if(pos < list.length - 1) {
		ref = list[pos + 1].replace(/ /g, "_");
		str += sprintf("<a href='/%s/%s/'>", params[0], ref);
		str += "Next &gt;&gt;";
		str += "<span><br>";
		str += list[pos + 1];
		str += "</span>";
	}
	str += "</td>";
	str += "</tr>";
	str += "</table>";

	return str;

}

