"use strict";

document.addEventListener("DOMContentLoaded", function() {

	const nav = document.getElementById("nav");
	const menu = document.getElementById("menu");

	menu.addEventListener("click", function(evt) {
		nav.classList.toggle("open");
	});


});
