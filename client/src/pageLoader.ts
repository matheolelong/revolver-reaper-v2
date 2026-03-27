import { socket } from './main.ts';

const body = document.body;

const ConnectionButton = document.querySelector('.ConnectionButton');
const RegisterButton = document.querySelector('.button-confirm');
const PlayButton = document.querySelector('.PlayButton');
const LeaderboardButton = document.querySelector('.LeaderboardButton');
const TheLeaderboard = document.querySelector('.leaderboard');
const CreditButton = document.querySelector('.CreditButton');
const backToHomePage = document.querySelectorAll('.backToHomePage');

const articleHomePage = document.querySelector('.HomePage');
const articleConnectionPage = document.querySelector('.ConnectionPage');
const articleGamePage = document.querySelector('.GamePage');
const articleLeaderboardPage = document.querySelector('.LeaderboardPage');
const articleCreditPage = document.querySelector('.CreditPage');
const articleReplayPage = document.querySelector('.ReplayPage');

const backToHomePageFromReplay = document.querySelector(
	'.backToHomePageFromReplay'
);

const pseudoInput = document.getElementById('pseudoInput') as HTMLInputElement;

RegisterButton?.addEventListener('click', function (e) {
	e.preventDefault();
	const pseudo = pseudoInput.value.trim();
	if (pseudo !== '') {
		socket.emit('setPseudo', pseudo);
		alert(
			"t'es trop chaud ta réussi à écrire un pseudo wow wow wow" +
				pseudo +
				' ptit con'
		);
		articleConnectionPage?.setAttribute('style', 'display: none;');
		articleHomePage?.setAttribute('style', '');
		body.setAttribute(
			'style',
			"background-image: url('../images/homePage.png');"
		);
	} else {
		alert('entre un pseudo ptit con');
	}
});

ConnectionButton?.addEventListener('click', function () {
	articleHomePage?.setAttribute('style', 'display: none;');
	articleConnectionPage?.setAttribute('style', '');
	console.log('ConnectionButton press');
});

PlayButton?.addEventListener('click', function () {
	let pseudoFinal = pseudoInput.value.trim();
	if (pseudoFinal === '') {
		pseudoFinal = 'Martin' + Math.floor(Math.random() * 1000);
	}
	socket.emit('setPseudo', pseudoFinal);
	console.log('pseudo : ' + pseudoFinal);

	articleHomePage?.setAttribute('style', 'display: none;');
	articleGamePage?.setAttribute('style', '');

	socket.emit('logInGame', socket.id);

	console.log('PlayButton press');
});
LeaderboardButton?.addEventListener('click', function () {
	articleHomePage?.setAttribute('style', 'display: none;');
	articleLeaderboardPage?.setAttribute('style', '');
	body?.setAttribute(
		'style',
		"background-image: url('../images/leaderboard.png');"
	);
	console.log('LeaderboardButton press');
});

socket.on('leaderboard', (tabScore:[string ,{score: number, date:string} ][]) => {
	tabScore.sort((a, b) => b[1].score - a[1].score);
	const top10 = tabScore.slice(0, 10);
	let nouveauHTML = '';

	top10.forEach(([nom, score], index: number) => {
		nouveauHTML += `<div> ${index + 1}. ${nom} : ${score.score}  |  ${score.date} </div>`;
	});

	if (TheLeaderboard) {
		TheLeaderboard.innerHTML = nouveauHTML;
	}
});

CreditButton?.addEventListener('click', function () {
	articleHomePage?.setAttribute('style', 'display: none;');
	articleCreditPage?.setAttribute('style', '');
	body?.setAttribute('style', "background-image: url('../images/credit.png');");
	console.log('CreditButton press');
});

backToHomePage?.forEach(element => {
	element?.addEventListener('click', function (e) {
		e.preventDefault();
		articleConnectionPage?.setAttribute('style', 'display: none;');
		articleLeaderboardPage?.setAttribute('style', 'display: none;');
		articleCreditPage?.setAttribute('style', 'display: none;');
		articleReplayPage?.setAttribute('style', 'display: none;');
		articleGamePage?.setAttribute('style', 'display: none;');
		articleHomePage?.setAttribute('style', '');
		body?.setAttribute(
			'style',
			"background-image: url('../images/homePage.png');"
		);
		console.log('BackToHomePage press');
	});
});

backToHomePageFromReplay?.addEventListener('click', function (e) {
	e.preventDefault();
	articleConnectionPage?.setAttribute('style', 'display: none;');
	articleLeaderboardPage?.setAttribute('style', 'display: none;');
	articleCreditPage?.setAttribute('style', 'display: none;');
	articleReplayPage?.setAttribute('style', 'display: none;');
	articleGamePage?.setAttribute('style', 'display: none;');
	articleHomePage?.setAttribute('style', '');
	body?.setAttribute(
		'style',
		"background-image: url('../images/homePage.png');"
	);
	console.log('BackToHomePage press');
});
