//LOCAL JSON SERVER SETTINGS
var JSON_ADDRESS = "127.0.0.1";
const JSON_PORT = 7190;
const POLLING_RATE = 333;
var JSON_ENDPOINT = `http://${JSON_ADDRESS}:${JSON_PORT}/`;

window.onload = function () {
	getData();
	setInterval(getData, POLLING_RATE);
};

var Asc = function (a, b) {
	if (a > b) return +1;
	if (a < b) return -1;
	return 0;
};

var Desc = function (a, b) {
	if (a > b) return -1;
	if (a < b) return +1;
	return 0;
};

function getData() {
	fetch(JSON_ENDPOINT)
		.then(function (response) {
			return response.json();
		})
		.then(function (data) {
			appendData(data);
		})
		.catch(function (err) {
			console.log("Error: " + err);
		});
}

//	<summary>
//	PROGRESS BAR DRAW FUNCTION
//	</summary>
//
//	current = current value;
//	max = max value;
//	percent = current / max as float 0 - 1
//	label = string label for progress bar (optional)
//	colors = array of color class names as string
//	Example
// DrawProgressBar(1000, 1000, 1, "Player: ", ["fine", "green"]);
function DrawProgressBar(current, max, percent, label, colors) {
	let mainContainer = document.getElementById("srtQueryData");
	mainContainer.innerHTML += `<div class="bar"><div class="progressbar ${colors[0]}" style="width:${(percent * 100)}%">
		<div id="currentprogress">${label}: ${current} / ${max}</div><div class="${colors[1]}" id="percentprogress">${(percent * 100).toFixed(1)}%</div></div></div>`;
}

//	<summary>
//	TEXTBLOCK DRAW FUNCTION
//	</summary>
//
//	label = string label
//	val = current value
//	colors = array of color class names as string
//	hideParam = user choosen query parameter
//	Example
//	DrawTextBlock("IGT", "00:00:00", ["white", "green2"], HideIGT);
function DrawTextBlock(label, val, colors, hideParam) {
	if (hideParam) { return; }
	let mainContainer = document.getElementById("srtQueryData");
	mainContainer.innerHTML += `<div class="title ${colors[0]} fsize">${label}: <span class="${colors[1]} fsize">${val}</span></div>`;
}

//	<summary>
//	FLEXBOXED TEXTBLOCK DRAW FUNCTION
//	</summary>
//
//	labels = string labels array
//	vals = current value array
//	colors = array of color class names as string
//	hideParam = user choosen query parameter
//	Example
//	DrawTextBlocks(["DARank", "DAScore"], [9, 9999], ["white", "green2"], HideDA);
function DrawTextBlocks(labels, vals, colors, hideParam) {
	if (hideParam) { return; }
	let mainContainer = document.getElementById("srtQueryData");
	let children = "";
	for (var i = 0; i < labels.length; i++) {
		children += `<div class="title ${colors[0]} fsize">${labels[i]}: <span class="${colors[1]} fsize">${vals[i]}</span></div>`
	}
	mainContainer.innerHTML += `<div class="textblock">${children}</div>`;
}

//	<summary>
//	ALIGNED FLEXBOX TEXTBLOCK DRAW FUNCTION
//	</summary>
//
//	labels = string labels array
//	vals = current value array
//	colors = array of color class names as string
//	alignment = text alignment as string (left, center, right)
//	hideParam = user choosen query parameter
//	Example
//	DrawAlignedTextBlocks(["X", "Y", "Z"], [100.0000, 100.0000, 100.0000], ["white", "green2"], "center", HideDA);
function DrawAlignedTextBlocks(labels, vals, colors, alignment, hideParam) {
	if (hideParam) { return; }
	let mainContainer = document.getElementById("srtQueryData");
	let children = "";
	for (var i = 0; i < labels.length; i++) {
		children += `<div class="title ${colors[0]} fsize">${labels[i]}: <span class="${colors[1]} fsize">${vals[i]}</span></div>`
	}
	mainContainer.innerHTML += `<div class="textblock-${alignment}">${children}</div>`;
}

//	<summary>
//	GET HP BAR AND TEXT COLOR ACCORDING TO PLAYER HEALTH STATE
//	</summary>
function GetColor(player) {
	if (player.CurrentHealthState == "Gassed") return ["gassed", "pink"];
	if (player.CurrentHealthState == "Poisoned") return ["poison", "purple"];
	if (player.CurrentHealthState == "Fine") return ["fine", "green"];
	else if (player.CurrentHealthState == "FineToo") return ["fineToo", "yellow"];
	else if (player.CurrentHealthState == "Caution") return ["caution", "orange"];
	else if (player.CurrentHealthState == "Danger") return ["danger", "red"];
	return ["dead", "grey"];
}

// UPDATES UI WITH DATA FROM SERVER
function appendData(data) {
	var mainContainer = document.getElementById("srtQueryData");
	mainContainer.innerHTML = "";
	DrawUI(data);
}

// REMAKE
function DrawUI(data) {
	// DRAWS IN GAME TIMER
	DrawTextBlock("IGT", data.Timer.IGTFormattedString, ["white", "green2"], false);

	// GETS COLOR FOR HP BAR ACCORDING TO PLAYERS HEALTH STATE
	let _colors = GetColor(data.PlayerManager);
	// DRAWS PLAYER HP IF MAX HP IS GREATER THAN OR EQUAL TO 1200
	if (data.PlayerManager.Health.MaxHP >= 1200) {
		DrawProgressBar(data.PlayerManager.Health.CurrentHP, data.PlayerManager.Health.MaxHP, data.PlayerManager.Health.Percentage, data.PlayerManager.CurrentSurvivorString, _colors);
	}
	// DRAWS DA RANK AND SCORE
	DrawTextBlocks(["Rank", "RankScore"], [data.RankManager.GameRank, data.RankManager.RankPoint], ["white", "green2"], false);

	// FILTERS ENEMIES FOR ENEMIES THAT ARE ALIVE
	var filterdEnemies = data.Enemies.filter(m => { return (m.IsAlive) });

	// DRAWS ALL ENEMIES TO SCREEN
	filterdEnemies.sort(function (a, b) {
		return Asc(a.CurrentHP, b.CurrentHP) || Desc(a.CurrentHP, b.CurrentHP);
	}).forEach(function (item, index, arr) {
		DrawProgressBar(item.CurrentHP, item.MaxHP, item.Percentage, "", ["danger", "red"]);
	});
}